import { ethers } from 'ethers';
import { BrowserProvider } from 'ethers';

// INFT Contract ABI (simplified for the essential functions)
const INFT_ABI = [
  // ERC-721 standard functions
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  // INFT specific functions
  'function mint(address to, string memory uri, bytes memory encryptedMetadata, bytes memory proof) returns (uint256)',
  'function getMetadata(uint256 tokenId) view returns (bytes memory)',
  'function updateMetadata(uint256 tokenId, bytes memory newEncryptedMetadata, bytes memory proof)',
  'function verifyProof(uint256 tokenId, bytes memory proof) view returns (bool)',
  'function requestTransfer(uint256 tokenId, address to)',
  'function completeTransfer(uint256 tokenId, bytes memory reEncryptedMetadata)',
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
  'event MetadataUpdated(uint256 indexed tokenId)',
  'event TransferRequested(uint256 indexed tokenId, address indexed from, address indexed to)',
  'event TransferCompleted(uint256 indexed tokenId, address indexed from, address indexed to)'
];

// MetadataManager class for handling INFT metadata operations
export class MetadataManager {
  private encryptionKey: CryptoKey | null = null;
  private contractAddress: string;
  private provider: ethers.BrowserProvider;
  private signer: ethers.JsonRpcSigner | null = null;
  
  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
    this.provider = new BrowserProvider(window.ethereum);
  }
  
  // Initialize the manager with a signer
  async initialize() {
    try {
      this.signer = await this.provider.getSigner();
      await this.generateEncryptionKey();
      return true;
    } catch (error) {
      console.error('Failed to initialize MetadataManager:', error);
      return false;
    }
  }
  
  // Generate a new encryption key
  private async generateEncryptionKey() {
    this.encryptionKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  // Encrypt metadata for an AI agent
  async encryptMetadata(metadata: object): Promise<{ encryptedData: ArrayBuffer, proof: ArrayBuffer }> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    
    // Convert metadata to string
    const metadataString = JSON.stringify(metadata);
    const encoder = new TextEncoder();
    const data = encoder.encode(metadataString);
    
    // Generate a random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      this.encryptionKey,
      data
    );
    
    // Generate a proof (hash of the metadata)
    const proof = await window.crypto.subtle.digest('SHA-256', data);
    
    // Combine IV and encrypted data
    const result = new Uint8Array(iv.length + encryptedData.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encryptedData), iv.length);
    
    return {
      encryptedData: result.buffer,
      proof
    };
  }
  
  // Decrypt metadata from an INFT
  async decryptMetadata(encryptedData: ArrayBuffer): Promise<object | null> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    
    try {
      // Extract IV and encrypted data
      const data = new Uint8Array(encryptedData);
      const iv = data.slice(0, 12);
      const ciphertext = data.slice(12);
      
      // Decrypt the data
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        this.encryptionKey,
        ciphertext
      );
      
      // Convert back to object
      const decoder = new TextDecoder();
      const metadataString = decoder.decode(decrypted);
      return JSON.parse(metadataString);
    } catch (error) {
      console.error('Failed to decrypt metadata:', error);
      return null;
    }
  }
  
  // Export the encryption key (for secure storage)
  async exportEncryptionKey(): Promise<ArrayBuffer> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    
    return await window.crypto.subtle.exportKey('raw', this.encryptionKey);
  }
  
  // Import a previously exported encryption key
  async importEncryptionKey(keyData: ArrayBuffer) {
    this.encryptionKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
}

// TransferManager class for handling INFT transfers
export class TransferManager {
  private contractAddress: string;
  private provider: ethers.BrowserProvider;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  
  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
    this.provider = new BrowserProvider(window.ethereum);
  }
  
  // Initialize the manager with a signer and contract
  async initialize() {
    try {
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(this.contractAddress, INFT_ABI, this.signer);
      return true;
    } catch (error) {
      console.error('Failed to initialize TransferManager:', error);
      return false;
    }
  }
  
  // Request a transfer of an INFT to another address
  async requestTransfer(tokenId: number, toAddress: string): Promise<boolean> {
    if (!this.contract || !this.signer) {
      throw new Error('Contract or signer not initialized');
    }
    
    try {
      // Check if the caller is the owner of the token
      const ownerAddress = await this.contract.ownerOf(tokenId);
      const signerAddress = await this.signer.getAddress();
      
      if (ownerAddress.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error('Only the owner can request a transfer');
      }
      
      // Request the transfer
      const tx = await this.contract.requestTransfer(tokenId, toAddress);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Failed to request transfer:', error);
      return false;
    }
  }
  
  // Complete a transfer with re-encrypted metadata
  async completeTransfer(tokenId: number, reEncryptedMetadata: ArrayBuffer): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    try {
      // Convert ArrayBuffer to ethers-compatible format
      const metadata = ethers.hexlify(new Uint8Array(reEncryptedMetadata));
      
      // Complete the transfer
      const tx = await this.contract.completeTransfer(tokenId, metadata);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Failed to complete transfer:', error);
      return false;
    }
  }
  
  // Get the current owner of an INFT
  async getOwner(tokenId: number): Promise<string | null> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    try {
      return await this.contract.ownerOf(tokenId);
    } catch (error) {
      console.error('Failed to get owner:', error);
      return null;
    }
  }
  
  // Check if a transfer has been requested for a token
  async isTransferRequested(tokenId: number): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    try {
      // This would require a custom function in the contract
      // For this example, we'll assume there's a function to check this
      return await this.contract.isTransferRequested(tokenId);
    } catch (error) {
      console.error('Failed to check transfer status:', error);
      return false;
    }
  }
}

// INFTContract class for interacting with the INFT contract
export class INFTContract {
  public contractAddress: string;
  private provider: ethers.BrowserProvider;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private metadataManager: MetadataManager;
  
  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
    this.provider = new BrowserProvider(window.ethereum);
    this.metadataManager = new MetadataManager(contractAddress);
  }
  
  // Initialize the contract with a signer
  async initialize() {
    try {
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(this.contractAddress, INFT_ABI, this.signer);
      await this.metadataManager.initialize();
      return true;
    } catch (error) {
      console.error('Failed to initialize INFTContract:', error);
      return false;
    }
  }
  
  // Create and mint a new INFT
  async mintINFT(toAddress: string, metadata: object, uri: string): Promise<number | null> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    try {
      // Encrypt the metadata
      const { encryptedData, proof } = await this.metadataManager.encryptMetadata(metadata);
      
      // Convert ArrayBuffer to ethers-compatible format
      const encryptedMetadataHex = ethers.hexlify(new Uint8Array(encryptedData));
      const proofHex = ethers.hexlify(new Uint8Array(proof));
      
      // Mint the INFT
      const tx = await this.contract.mint(toAddress, uri, encryptedMetadataHex, proofHex);
      const receipt = await tx.wait();
      
      // Extract the token ID from the event
      const transferEvent = receipt.logs
        .map((log: any) => {
          try {
            return this.contract?.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event: any) => event && event.name === 'Transfer');
      
      if (transferEvent) {
        return Number(transferEvent.args.tokenId);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to mint INFT:', error);
      return null;
    }
  }
  
  // Get and decrypt metadata for an INFT
  async getINFTMetadata(tokenId: number): Promise<object | null> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    try {
      // Get the encrypted metadata from the contract
      const encryptedMetadata = await this.contract.getMetadata(tokenId);
      
      // Convert from ethers format to ArrayBuffer
      const encryptedDataArray = ethers.getBytes(encryptedMetadata);
      
      // Decrypt the metadata
      return await this.metadataManager.decryptMetadata(encryptedDataArray.buffer as any);
    } catch (error) {
      console.error('Failed to get INFT metadata:', error);
      return null;
    }
  }
  
  // Update metadata for an existing INFT
  async updateINFTMetadata(tokenId: number, newMetadata: object): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    try {
      // Encrypt the new metadata
      const { encryptedData, proof } = await this.metadataManager.encryptMetadata(newMetadata);
      
      // Convert ArrayBuffer to ethers-compatible format
      const encryptedMetadataHex = ethers.hexlify(new Uint8Array(encryptedData));
      const proofHex = ethers.hexlify(new Uint8Array(proof));
      
      // Update the metadata
      const tx = await this.contract.updateMetadata(tokenId, encryptedMetadataHex, proofHex);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Failed to update INFT metadata:', error);
      return false;
    }
  }
  
  // Get the metadata manager for advanced operations
  getMetadataManager(): MetadataManager {
    return this.metadataManager;
  }
  
  // Create a transfer manager for handling transfers
  createTransferManager(): TransferManager {
    return new TransferManager(this.contractAddress);
  }
}