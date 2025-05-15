'use server';
/**
 * @fileOverview Flow for handling chat interactions with an agent.
 *
 * - chatWithAgent - A function that takes user input and agent system prompt, returns agent response.
 * - ChatInput - The input type for the chatWithAgent function.
 * - ChatOutput - The return type for the chatWithAgent function.
 * - chatPrompt - The Genkit prompt object for chat.
 * - ChatInputSchema - Zod schema for chat input.
 * - ChatOutputSchema - Zod schema for chat output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ChatInputSchema = z.object({
  userText: z.string().describe('The text message from the user.'),
  agentSystemPrompt: z.string().describe('The system prompt defining the agent\'s personality and instructions.'),
  imageDataUri: z.string().optional().describe(
    "An optional image sent by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  agentResponse: z.string().describe('The text response from the agent.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithAgent(input: ChatInput): Promise<ChatOutput> {
  return chatWithAgentFlow(input);
}

export const chatPrompt = ai.definePrompt({
  name: 'chatWithAgentPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `{{{agentSystemPrompt}}}

User: {{{userText}}}
{{#if imageDataUri}}
[User sent an image: {{media url=imageDataUri}}]
{{/if}}
Agent:`,
});

const chatWithAgentFlow = ai.defineFlow(
  {
    name: 'chatWithAgentFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const {output} = await chatPrompt(input);
    if (!output) {
      // Fallback or error handling if output is undefined
      return { agentResponse: "أ抱歉، لم أتمكن من معالجة طلبك الآن. يرجى المحاولة مرة أخرى." }; // "Sorry, I couldn't process your request right now. Please try again."
    }
    return output;
  }
);
