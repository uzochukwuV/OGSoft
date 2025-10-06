import { db } from '@/lib/db';
import { aiAgents, aiAgentMetadata, aiAgentAuthorizations } from '@/lib/db/schema-ai';
import { INFTContract } from '@/lib/0g/inft';
import { eq, and } from 'drizzle-orm';

// Define types for the service
export interface AIAgentData {
  title: string;
  description: string;
  type: string;
  thumbnailUrl: string;
  price: number;
  creatorId: string;
  modelDetails: {
    baseModel: string;
    parameters: Record<string, any>;
    capabilities: string[];
    verificationMode: string;
  };
}

export interface AIAgentWithMetadata {
  id: number;
  title: string;
  description: string;
  type: string;
  thumbnailUrl: string;
  price: number;
  creatorId: string;
  status: string;
  inftTokenId: number | null;
  inftContractAddress: string | null;
  inftMetadataUri: string | null;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    baseModel: string;
    parameters: Record<string, any>;
    capabilities: string[];
    verificationMode: string;
  };
}

// Service class for AI agent operations
export class AIAgentService {
  private inftContract: INFTContract | null = null;
  
  constructor(inftContractAddress?: string) {
    if (inftContractAddress) {
      this.inftContract = new INFTContract(inftContractAddress);
    }
  }
  
  // Initialize the INFT contract
  async initializeContract(contractAddress: string): Promise<boolean> {
    this.inftContract = new INFTContract(contractAddress);
    return await this.inftContract.initialize();
  }
  
  // Create a new AI agent
  async createAIAgent(agentData: AIAgentData): Promise<number | null> {
    try {
      // Insert the agent into the database
      const [agent] = await db.insert(aiAgents).values({
        title: agentData.title,
        description: agentData.description,
        agentType: agentData.type,
        thumbnailUrl: agentData.thumbnailUrl,
        price: agentData.price.toString(),
        creatorId: agentData.creatorId,
        status: 'inactive', // Initial status
        inftTokenId: null,
        inftContractAddress: null,
        inftMetadataUri: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: aiAgents.id });
      
      if (!agent) {
        throw new Error('Failed to create AI agent');
      }
      
      // Insert the agent metadata
      await db.insert(aiAgentMetadata).values({
        agentId: agent.id,
        baseModel: agentData.modelDetails.baseModel,
        parameters: agentData.modelDetails.parameters,
        capabilities: agentData.modelDetails.capabilities,
        verificationMode: agentData.modelDetails.verificationMode,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      return agent.id;
    } catch (error) {
      console.error('Failed to create AI agent:', error);
      return null;
    }
  }
  
  // Mint an AI agent as an INFT
  async mintAIAgentAsINFT(agentId: number, ownerAddress: string): Promise<number | null> {
    if (!this.inftContract) {
      throw new Error('INFT contract not initialized');
    }
    
    try {
      // Get the agent data
      const agent = await this.getAIAgentWithMetadata(agentId);
      
      if (!agent) {
        throw new Error('AI agent not found');
      }
      
      // Prepare metadata for the INFT
      const inftMetadata = {
        title: agent.title,
        description: agent.description,
        type: agent.type,
        creator: agent.creatorId,
        model: agent.metadata.baseModel,
        parameters: agent.metadata.parameters,
        capabilities: agent.metadata.capabilities,
        verificationMode: agent.metadata.verificationMode,
      };
      
      // Create a metadata URI (could be IPFS or other storage)
      const metadataUri = `https://api.0g.network/metadata/${agentId}`;
      
      // Mint the INFT
      const tokenId = await this.inftContract.mintINFT(ownerAddress, inftMetadata, metadataUri);
      
      if (tokenId === null) {
        throw new Error('Failed to mint INFT');
      }
      
      // Update the agent with INFT details
      await db.update(aiAgents)
        .set({
          inftTokenId: tokenId,
          inftContractAddress: this.inftContract.contractAddress,
          inftMetadataUri: metadataUri,
          status: 'published',
          updatedAt: new Date(),
        })
        .where(eq(aiAgents.id, agentId));
      
      return tokenId;
    } catch (error) {
      console.error('Failed to mint AI agent as INFT:', error);
      return null;
    }
  }
  
  // Get an AI agent with its metadata
  async getAIAgentWithMetadata(agentId: number): Promise<AIAgentWithMetadata | null> {
    try {
      // Get the agent
      const agent = await db.query.aiAgents.findFirst({
        where: eq(aiAgents.id, agentId),
      });
      
      if (!agent) {
        return null;
      }
      
      // Get the agent metadata
      const metadata = await db.query.aiAgentMetadata.findFirst({
        where: eq(aiAgentMetadata.agentId, agentId),
      });
      
      if (!metadata) {
        return null;
      }
      
      // Combine agent and metadata
      return {
        ...agent,
        metadata: {
          baseModel: metadata.baseModel,
          parameters: metadata.parameters,
          capabilities: metadata.capabilities,
          verificationMode: metadata.verificationMode,
        },
      };
    } catch (error) {
      console.error('Failed to get AI agent with metadata:', error);
      return null;
    }
  }
  
  // List AI agents with optional filters
  async listAIAgents(filters?: {
    creatorId?: string;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<AIAgentWithMetadata[]> {
    try {
      const { creatorId, type, status, limit = 10, offset = 0 } = filters || {};
      
      // Build the query conditions
      let conditions = [];
      
      if (creatorId) {
        conditions.push(eq(aiAgents.creatorId, creatorId));
      }
      
      if (type) {
        conditions.push(eq(aiAgents.type, type));
      }
      
      if (status) {
        conditions.push(eq(aiAgents.status, status));
      }
      
      // Get the agents
      const agents = await db.query.aiAgents.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        limit,
        offset,
        orderBy: (aiAgents, { desc }) => [desc(aiAgents.createdAt)],
      });
      
      // Get the metadata for each agent
      const agentsWithMetadata: AIAgentWithMetadata[] = [];
      
      for (const agent of agents) {
        const metadata = await db.query.aiAgentMetadata.findFirst({
          where: eq(aiAgentMetadata.agentId, agent.id),
        });
        
        if (metadata) {
          agentsWithMetadata.push({
            ...agent,
            metadata: {
              baseModel: metadata.baseModel,
              parameters: metadata.parameters,
              capabilities: metadata.capabilities,
              verificationMode: metadata.verificationMode,
            },
          });
        }
      }
      
      return agentsWithMetadata;
    } catch (error) {
      console.error('Failed to list AI agents:', error);
      return [];
    }
  }
  
  // Authorize a user to use an AI agent
  async authorizeUser(agentId: number, userId: string, usageLimit?: number): Promise<boolean> {
    try {
      // Check if the authorization already exists
      const existingAuth = await db.query.aiAgentAuthorizations.findFirst({
        where: and(
          eq(aiAgentAuthorizations.agentId, agentId),
          eq(aiAgentAuthorizations.userId, userId)
        ),
      });
      
      if (existingAuth) {
        // Update the existing authorization
        await db.update(aiAgentAuthorizations)
          .set({
            usageLimit: usageLimit || existingAuth.usageLimit,
            usageCount: 0, // Reset usage count
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            updatedAt: new Date(),
          })
          .where(eq(aiAgentAuthorizations.id, existingAuth.id));
      } else {
        // Create a new authorization
        await db.insert(aiAgentAuthorizations).values({
          agentId,
          userId,
          usageLimit: usageLimit || 100, // Default limit
          usageCount: 0,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to authorize user:', error);
      return false;
    }
  }
  
  // Check if a user is authorized to use an AI agent
  async isUserAuthorized(agentId: number, userId: string): Promise<boolean> {
    try {
      const auth = await db.query.aiAgentAuthorizations.findFirst({
        where: and(
          eq(aiAgentAuthorizations.agentId, agentId),
          eq(aiAgentAuthorizations.userId, userId)
        ),
      });
      
      if (!auth) {
        return false;
      }
      
      // Check if the authorization is valid
      const now = new Date();
      
      if (auth.expiresAt < now) {
        return false;
      }
      
      if (auth.usageCount >= auth.usageLimit) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to check user authorization:', error);
      return false;
    }
  }
  
  // Increment usage count for a user
  async incrementUsageCount(agentId: number, userId: string): Promise<boolean> {
    try {
      const auth = await db.query.aiAgentAuthorizations.findFirst({
        where: and(
          eq(aiAgentAuthorizations.agentId, agentId),
          eq(aiAgentAuthorizations.userId, userId)
        ),
      });
      
      if (!auth) {
        return false;
      }
      
      await db.update(aiAgentAuthorizations)
        .set({
          usageCount: auth.usageCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(aiAgentAuthorizations.id, auth.id));
      
      return true;
    } catch (error) {
      console.error('Failed to increment usage count:', error);
      return false;
    }
  }
  
  // Get the INFT contract
  getINFTContract(): INFTContract | null {
    return this.inftContract;
  }
}