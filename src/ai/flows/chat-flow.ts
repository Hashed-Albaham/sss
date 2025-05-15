'use server';
/**
 * @fileOverview Flow for handling chat interactions with an agent.
 *
 * - chatWithAgent - A function that takes user input, agent system prompt, and optionally an agent-specific API key, returns agent response.
 * - ChatInput - The input type for the chatWithAgent function.
 * - ChatOutput - The return type for the chatWithAgent function.
 */

import { genkit, type Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit'; // Using z from genkit as it's aliased typically. If not, use 'zod'.

const ChatInputSchema = z.object({
  userText: z.string().describe('The text message from the user.'),
  agentSystemPrompt: z.string().describe("The system prompt defining the agent's personality and instructions."),
  imageDataUri: z.string().optional().describe(
    "An optional image sent by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  agentApiKey: z.string().optional().describe('Optional API key for the agent to use for this specific call.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  agentResponse: z.string().describe('The text response from the agent.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithAgent(input: ChatInput): Promise<ChatOutput> {
  return chatWithAgentFlow(input);
}

// Reference to the global ai instance from genkit.ts
import { ai as globalAi } from '@/ai/genkit';

// Global prompt, used if no agentApiKey is provided
// This prompt is defined on the globalAi instance.
const globalChatPrompt = globalAi.definePrompt({
  name: 'chatWithAgentPromptGlobal',
  input: { schema: ChatInputSchema }, // This schema includes agentApiKey, but it won't be used by the prompt template itself
  output: { schema: ChatOutputSchema },
  prompt: `{{{agentSystemPrompt}}}

User: {{{userText}}}
{{#if imageDataUri}}
[User sent an image: {{media url=imageDataUri}}]
{{/if}}
Agent:`,
});


const chatWithAgentFlow = globalAi.defineFlow(
  {
    name: 'chatWithAgentFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    let responseOutput: ChatOutput | undefined;

    if (input.agentApiKey && input.agentApiKey.trim() !== '') {
      // Create a temporary Genkit instance with the agent's specific API key
      const agentAi = genkit({
        plugins: [googleAI({ apiKey: input.agentApiKey })],
        // Use the model configuration from the global AI instance, or make it configurable per agent
        model: globalAi.getModel('googleai/gemini-2.0-flash'), 
      });

      // Define the prompt using this temporary Genkit instance
      // The prompt template is the same, but it's now bound to agentAi
      const agentSpecificPrompt = agentAi.definePrompt({
        name: `chatWithAgentPrompt_AgentSpecific_${crypto.randomUUID().substring(0,8)}`, // Unique name for dynamic prompt
        input: { schema: ChatInputSchema }, 
        output: { schema: ChatOutputSchema },
        prompt: `{{{agentSystemPrompt}}}

User: {{{userText}}}
{{#if imageDataUri}}
[User sent an image: {{media url=imageDataUri}}]
{{/if}}
Agent:`,
      });
      
      const { output } = await agentSpecificPrompt(input);
      responseOutput = output;

    } else {
      // Use the globally defined prompt (which uses the globalAi instance)
      const { output } = await globalChatPrompt(input);
      responseOutput = output;
    }

    if (!responseOutput) {
      return { agentResponse: "أ抱歉، لم أتمكن من معالجة طلبك الآن. يرجى المحاولة مرة أخرى." };
    }
    return responseOutput;
  }
);
