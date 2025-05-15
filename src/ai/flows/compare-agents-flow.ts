'use server';
/**
 * @fileOverview Flow for comparing responses from multiple agents to the same prompt.
 *
 * - compareMultipleAgents - A function that takes user input and a list of agents, returns their responses.
 * - CompareAgentsFlowInput - The input type for the compareMultipleAgents function.
 * - CompareAgentsFlowOutput - The return type for the compareMultipleAgents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Agent } from '@/types';
import { chatPrompt, ChatInputSchema, ChatOutputSchema, type ChatInput, type ChatOutput } from './chat-flow'; // Reusing chatPrompt

const AgentInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  systemPrompt: z.string(),
  avatarUrl: z.string().optional(),
  // We don't need other Agent fields like createdAt, apiKey for the flow's core logic
});

export const CompareAgentsFlowInputSchema = z.object({
  agents: z.array(AgentInputSchema).min(1, "يجب تحديد وكيل واحد على الأقل للمقارنة."),
  userText: z.string().describe('The text message from the user.'),
  imageDataUri: z.string().optional().describe(
    "An optional image sent by the user, as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type CompareAgentsFlowInput = z.infer<typeof CompareAgentsFlowInputSchema>;

export const CompareAgentsFlowOutputSchema = z.object({
  results: z.array(
    z.object({
      agentId: z.string(),
      agentName: z.string(),
      avatarUrl: z.string().optional(),
      agentResponse: z.string().optional(),
      error: z.string().optional(),
    })
  ),
});
export type CompareAgentsFlowOutput = z.infer<typeof CompareAgentsFlowOutputSchema>;


export async function compareMultipleAgents(input: CompareAgentsFlowInput): Promise<CompareAgentsFlowOutput> {
  return compareAgentsFlow(input);
}

const compareAgentsFlow = ai.defineFlow(
  {
    name: 'compareAgentsFlow',
    inputSchema: CompareAgentsFlowInputSchema,
    outputSchema: CompareAgentsFlowOutputSchema,
  },
  async (input) => {
    const { agents, userText, imageDataUri } = input;

    const comparisonResults = await Promise.all(
      agents.map(async (agent) => {
        try {
          const chatInput: ChatInput = {
            userText,
            agentSystemPrompt: agent.systemPrompt,
            imageDataUri,
          };
          const { output } = await chatPrompt(chatInput);
          
          if (!output) {
            throw new Error("لم يتم استلام أي مخرجات من الوكيل.");
          }

          return {
            agentId: agent.id,
            agentName: agent.name,
            avatarUrl: agent.avatarUrl,
            agentResponse: output.agentResponse,
          };
        } catch (e: any) {
          console.error(`Error with agent ${agent.name} (ID: ${agent.id}):`, e);
          return {
            agentId: agent.id,
            agentName: agent.name,
            avatarUrl: agent.avatarUrl,
            error: e.message || "حدث خطأ غير معروف أثناء معالجة طلب هذا الوكيل.",
          };
        }
      })
    );
    return { results: comparisonResults };
  }
);
