export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  apiKey?: string; // Optional: API key for the agent
  avatarUrl?: string; // Optional: URL to an avatar image
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  imageUrl?: string; // For image attachments
  timestamp: string;
  agentId?: string; // ID of the agent sending/receiving for multi-agent contexts
  isTyping?: boolean; // Added for typing indicator
}

export interface PipelineAgentConfig {
  agentId: string;
  // Specific configurations for this agent in the pipeline if needed
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  agentSequence: PipelineAgentConfig[];
  createdAt: string;
  updatedAt: string;
}

// For chat history storage
export interface ChatSession {
  agentId: string;
  messages: Message[];
  lastUpdated: string;
}

// For Agent Comparison Feature
export interface CompareAgentsUserInput {
  agents: Agent[];
  userText: string;
  imageDataUri?: string;
}

export interface CompareAgentsResultItem {
  agentId: string;
  agentName: string;
  avatarUrl?: string;
  agentResponse?: string;
  error?: string;
  isLoading: boolean; // Added to track individual agent loading state
}
