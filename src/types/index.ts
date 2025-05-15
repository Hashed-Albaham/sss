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

// Configuration for an agent step within a pipeline
export interface PipelineAgentConfig {
  id: string; // Unique ID for this step in the pipeline, can be same as agentId if agent is used once
  agentId: string; // ID of the agent to use for this step
  // Future: stepSpecificPromptOverride?: string;
  // Future: outputMapping?: Record<string, string>; // e.g. map agent's 'diagnosis' to next agent's 'context'
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  agentSequence: PipelineAgentConfig[]; // Ordered sequence of agents
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

// For Pipeline Execution
export interface PipelineStepResult {
  agentId: string;
  agentName: string; // For display purposes
  input: string; // What this agent received
  output?: string; // What this agent produced
  error?: string;
  durationMs?: number; // Optional: time taken for this step
}

export interface PipelineExecutionResult {
  pipelineId: string;
  pipelineName: string; // For display
  initialInputText: string;
  initialImageDataUri?: string; // For future use
  steps: PipelineStepResult[];
  finalOutput?: string; // The output of the last agent in the sequence
  overallError?: string; // If the pipeline itself failed catastrophically
  totalDurationMs?: number;
  executedAt: string;
}

// Input for the Genkit flow executing a pipeline
export interface PipelineExecutionFlowAgent {
  agentId: string;
  name: string; // For results display
  systemPrompt: string;
  apiKey?: string;
}
export interface PipelineExecutionFlowInput {
  agentsInSequence: PipelineExecutionFlowAgent[];
  initialUserText: string;
  initialImageDataUri?: string; // Optional
}

export interface PipelineExecutionFlowOutput {
  initialInputText: string;
  initialImageDataUri?: string;
  steps: PipelineStepResult[];
  finalOutput?: string;
  overallError?: string;
}
