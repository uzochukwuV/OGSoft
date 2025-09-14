import { getNetworkConfig } from '@/lib/0g/network';
import { submitTransaction, uploadToStorage } from '@/lib/0g/uploader';
import { getProvider, getSigner, getFlowContract, calculateFees } from '@/lib/0g/fees';
import { createBlob, createSubmission } from '@/lib/0g/blob';
import { Contract, BrowserProvider } from 'ethers';
import { SocialContent, CreatePostRequest } from './types';

/**
 * Thin service to create social posts by reusing existing 0G upload infra.
 * - Uploads media to 0G storage
 * - Persists post metadata to 0G storage
 * - Optionally records the content hash on-chain (future)
 *
 * The class is written as a simple utility. In components, prefer the useSocial() hook.
 */
export class SocialManager {
  private networkType: 'standard' | 'turbo';

  constructor(networkType: 'standard' | 'turbo') {
    this.networkType = networkType;
  }

  private async ensureSignerAndFlow(): Promise<{ provider: BrowserProvider; signer: any; flow: Contract; storageRpc: string; l1Rpc: string }> {
    const [provider, providerErr] = await getProvider();
    if (!provider) throw new Error(providerErr?.message || 'Provider not found');

    const [signer, signerErr] = await getSigner(provider);
    if (!signer) throw new Error(signerErr?.message || 'Signer not found');

    const network = getNetworkConfig(this.networkType);
    const flow = getFlowContract(network.flowAddress, signer);

    return { provider, signer, flow, storageRpc: network.storageRpc, l1Rpc: network.l1Rpc };
  }

  async uploadMediaFiles(files: File[]): Promise<string[]> {
    if (!files?.length) return [];

    const { provider, signer, flow, storageRpc, l1Rpc } = await this.ensureSignerAndFlow();

    const hashes: string[] = [];
    for (const file of files) {
      // Convert to 0G Blob and create submission
      const blob = createBlob(file);
      const [submission, submissionErr] = await createSubmission(blob);
      if (!submission) throw new Error(submissionErr?.message || 'Failed to create submission');

      // Calculate fees
      const [feeInfo, feeErr] = await calculateFees(submission, flow, provider);
      if (!feeInfo) throw new Error(feeErr?.message || 'Failed to calculate fees');

      // Pay storage fee by submitting to flow contract
      const [txRes, txErr] = await submitTransaction(flow, submission, feeInfo.rawTotalFee);
      if (!txRes) throw new Error(txErr?.message || 'Transaction failed');

      // Upload to storage
      const [ok, upErr] = await uploadToStorage(blob, storageRpc, l1Rpc, signer);
      if (!ok) throw new Error(upErr?.message || 'Upload failed');

      // Derive media root hash
      let rootHash = '';
      try {
        if (submission?.data?.root) {
          rootHash = submission.data.root as string;
        } else {
          const [tree] = await blob.merkleTree();
          // @ts-ignore - tree.rootHash exists in sdk
          rootHash = tree?.rootHash?.() || '';
        }
      } catch {
        // best-effort
      }
      if (!rootHash) throw new Error('Could not determine media root hash');
      hashes.push(rootHash);
    }

    return hashes;
  }

  async createPost(req: CreatePostRequest, creator: string): Promise<SocialContent> {
    const media: { rootHash: string; type: 'image' | 'video' | 'other' }[] = [];

    for (const h of req.mediaRootHashes || []) {
      media.push({ rootHash: h, type: 'other' });
    }

    const post: SocialContent = {
      id: crypto.randomUUID(),
      creator,
      type: 'post',
      content: {
        text: req.text,
        media,
      },
      engagement: {
        likes: 0,
        comments: 0,
      },
      createdAt: Date.now(),
    };

    // Persist post JSON to 0G storage with proper payment
    const { provider, signer, flow, storageRpc, l1Rpc } = await this.ensureSignerAndFlow();
    const file = new File([JSON.stringify(post)], `post-${post.id}.json`, { type: 'application/json' });
    const blob = createBlob(file);
    const [submission, submissionErr] = await createSubmission(blob);
    if (!submission) throw new Error(submissionErr?.message || 'Failed to create post submission');

    const [feeInfo, feeErr] = await calculateFees(submission, flow, provider);
    if (!feeInfo) throw new Error(feeErr?.message || 'Failed to calculate post fee');

    const [txRes, txErr] = await submitTransaction(flow, submission, feeInfo.rawTotalFee);
    if (!txRes) throw new Error(txErr?.message || 'Post transaction failed');

    const [ok, upErr] = await uploadToStorage(blob, storageRpc, l1Rpc, signer);
    if (!ok) throw new Error(upErr?.message || 'Failed to upload post metadata');

    // Try to extract the metadata root hash
    let storageHash = '';
    try {
      if (submission?.data?.root) {
        storageHash = submission.data.root as string;
      } else {
        const [tree] = await blob.merkleTree();
        // @ts-ignore
        storageHash = tree?.rootHash?.() || '';
      }
    } catch {
      // ignore
    }

    return { ...post, storageHash };
  }
}