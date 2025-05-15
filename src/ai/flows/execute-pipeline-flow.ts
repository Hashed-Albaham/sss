'use server';
/**
 * @fileOverview Flow for executing a sequence of agents (a pipeline).
 *
 * - executePipeline - A function that takes an initial input and a sequence of agents,
 *   then processes the input through each agent, passing the output of one as input to the next.
 * - PipelineExecutionFlowInput - The input type for the executePipeline function.
 * - PipelineExecutionFlowOutput - The return type for the executePipeline function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { PipelineExecutionFlowInput, PipelineExecutionFlowOutput, PipelineStepResult, PipelineExecutionFlowAgent } from '@/types';
import { chatWithAgent, type ChatInput, type ChatOutput } from './chat-flow'; // Reusing chatWithAgent logic

// Define Zod schemas based on TypeScript types for validation if desired,
// or directly use the types if validation is handled elsewhere or implicitly.
// For simplicity, we'll directly use the TS types for the flow definition here,
// assuming the input object is correctly structured by the caller.

const PipelineExecutionFlowAgentSchema = z.object({
  agentId: z.string(),
  name: z.string(),
  systemPrompt: z.string(),
  apiKey: z.string().optional(),
});

const PipelineExecutionFlowInputSchema = z.object({
  agentsInSequence: z.array(PipelineExecutionFlowAgentSchema).min(1, "يجب أن يحتوي خط الأنابيب على وكيل واحد على الأقل."),
  initialUserText: z.string(),
  initialImageDataUri: z.string().optional().describe(
    "An optional image sent by the user, as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});

const PipelineStepResultSchema = z.object({
  agentId: z.string(),
  agentName: z.string(),
  input: z.string(),
  output: z.string().optional(),
  error: z.string().optional(),
  durationMs: z.number().optional(),
});

const PipelineExecutionFlowOutputSchema = z.object({
  initialInputText: z.string(),
  initialImageDataUri: z.string().optional(),
  steps: z.array(PipelineStepResultSchema),
  finalOutput: z.string().optional(),
  overallError: z.string().optional(),
});


export async function executePipeline(input: PipelineExecutionFlowInput): Promise<PipelineExecutionFlowOutput> {
  return executePipelineFlow(input);
}

const executePipelineFlow = ai.defineFlow(
  {
    name: 'executePipelineFlow',
    inputSchema: PipelineExecutionFlowInputSchema,
    outputSchema: PipelineExecutionFlowOutputSchema,
  },
  async (input) => {
    const { agentsInSequence, initialUserText, initialImageDataUri } = input;
    const results: PipelineStepResult[] = [];
    let currentInputText = initialUserText;
    let currentImageDataUri = initialImageDataUri; // Image is passed only to the first agent for now

    for (const agentConfig of agentsInSequence) {
      const startTime = Date.now();
      let stepResult: PipelineStepResult = {
        agentId: agentConfig.agentId,
        agentName: agentConfig.name,
        input: currentInputText,
      };

      try {
        const chatInput: ChatInput = {
          userText: currentInputText,
          agentSystemPrompt: agentConfig.systemPrompt,
          imageDataUri: currentImageDataUri, // Only pass image to the first agent
          agentApiKey: agentConfig.apiKey,
        };

        const output: ChatOutput = await chatWithAgent(chatInput);

        if (!output || typeof output.agentResponse === 'undefined') {
          throw new Error("لم يتم استلام أي مخرجات من الوكيل.");
        }
        
        stepResult.output = output.agentResponse;
        currentInputText = output.agentResponse; // Output of this agent becomes input for the next
        currentImageDataUri = undefined; // Image is not passed to subsequent agents

      } catch (e: any) {
        console.error(`Error with agent ${agentConfig.name} (ID: ${agentConfig.agentId}) in pipeline:`, e);
        stepResult.error = e.message || "حدث خطأ غير معروف أثناء معالجة هذا الوكيل في خط الأنابيب.";
        results.push({ ...stepResult, durationMs: Date.now() - startTime });
        return {
          initialInputText,
          initialImageDataUri,
          steps: results,
          overallError: `فشل خط الأنابيب عند الوكيل: ${agentConfig.name}. الخطأ: ${stepResult.error}`,
        };
      }
      stepResult.durationMs = Date.now() - startTime;
      results.push(stepResult);
    }

    return {
      initialInputText,
      initialImageDataUri,
      steps: results,
      finalOutput: currentInputText, // The output of the last agent
    };
  }
);
