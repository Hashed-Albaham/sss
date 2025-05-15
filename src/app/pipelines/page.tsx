// This page is a placeholder and will be developed.
'use client';

import { useState, useEffect, Suspense } from 'react';
import type { Agent, Pipeline, PipelineAgentConfig, PipelineExecutionFlowInput, PipelineExecutionFlowAgent, PipelineExecutionResult } from '@/types';
import useLocalStorage from '@/hooks/use-local-storage';
import PipelineForm from './components/pipeline-form';
import PipelineCard from './components/pipeline-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription as ShadCardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Renamed CardDescription to avoid conflict
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Share2, Play, Loader2, AlertTriangle, Info, ChevronsRight, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'; // Added DialogDescription
import { useToast } from '@/hooks/use-toast';
import { executePipeline } from '@/ai/flows/execute-pipeline-flow';
import MarkdownRenderer from '@/components/common/markdown-renderer';
import Link from 'next/link'; // Added Link import
import { Label } from '@/components/ui/label'; // Added Label import


const PIPELINES_STORAGE_KEY = 'wakilPlusPipelines';
const AGENTS_STORAGE_KEY = 'wakilPlusAgents';

function PipelinesPageContent() {
  const [allAgents, setAllAgents] = useLocalStorage<Agent[]>(AGENTS_STORAGE_KEY, []);
  const [pipelines, setPipelines] = useLocalStorage<Pipeline[]>(PIPELINES_STORAGE_KEY, []);
  const [isMounted, setIsMounted] = useState(false);
  const [showPipelineForm, setShowPipelineForm] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  
  const [selectedPipelineForExecution, setSelectedPipelineForExecution] = useState<Pipeline | null>(null);
  const [initialPipelineInput, setInitialPipelineInput] = useState<string>("");
  const [pipelineExecutionResult, setPipelineExecutionResult] = useState<PipelineExecutionResult | null>(null);
  const [isExecutingPipeline, setIsExecutingPipeline] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSavePipeline = (pipeline: Pipeline) => {
    if (editingPipeline) {
      setPipelines(pipelines.map((p) => (p.id === pipeline.id ? pipeline : p)));
      toast({ title: "تم تحديث خط الأنابيب", description: `تم تحديث "${pipeline.name}" بنجاح.` });
    } else {
      setPipelines([...pipelines, pipeline]);
      toast({ title: "تم إنشاء خط الأنابيب", description: `تم إنشاء "${pipeline.name}" بنجاح.` });
    }
    setShowPipelineForm(false);
    setEditingPipeline(null);
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setShowPipelineForm(true);
  };

  const handleDeletePipeline = (pipelineId: string) => {
    const pipelineToDelete = pipelines.find(p => p.id === pipelineId);
    if (pipelineToDelete) {
      setPipelines(pipelines.filter((p) => p.id !== pipelineId));
      toast({ title: "تم حذف خط الأنابيب", description: `تم حذف "${pipelineToDelete.name}" بنجاح.`, variant: "destructive" });
      if (selectedPipelineForExecution?.id === pipelineId) {
        setSelectedPipelineForExecution(null);
        setPipelineExecutionResult(null);
        setInitialPipelineInput("");
      }
    }
  };
  
  const handleOpenExecutionDialog = (pipeline: Pipeline) => {
    setSelectedPipelineForExecution(pipeline);
    setPipelineExecutionResult(null); // Clear previous results
    setInitialPipelineInput(""); // Clear previous input
  };

  const handleExecutePipeline = async () => {
    if (!selectedPipelineForExecution || !initialPipelineInput.trim()) {
      toast({ title: "خطأ في الإدخال", description: "يرجى اختيار خط أنابيب وإدخال رسالة أولية.", variant: "destructive" });
      return;
    }
    setIsExecutingPipeline(true);
    setPipelineExecutionResult(null);

    // Prepare agents data for the flow
    const agentsInSequenceForFlow: PipelineExecutionFlowAgent[] = selectedPipelineForExecution.agentSequence.map(config => {
      const agent = allAgents.find(a => a.id === config.agentId);
      if (!agent) {
        // This case should ideally be prevented by UI, but good to have a fallback
        toast({ title: "خطأ في تكوين خط الأنابيب", description: `لم يتم العثور على الوكيل بالمعرف: ${config.agentId}`, variant: "destructive" });
        throw new Error(`لم يتم العثور على الوكيل بالمعرف: ${config.agentId}`);
      }
      return {
        agentId: agent.id,
        name: agent.name,
        systemPrompt: agent.systemPrompt,
        apiKey: agent.apiKey,
      };
    });

    const flowInput: PipelineExecutionFlowInput = {
      agentsInSequence: agentsInSequenceForFlow,
      initialUserText: initialPipelineInput,
      // initialImageDataUri: undefined, // Add image support later
    };

    try {
      const result = await executePipeline(flowInput);
      setPipelineExecutionResult({
        pipelineId: selectedPipelineForExecution.id,
        pipelineName: selectedPipelineForExecution.name,
        initialInputText: result.initialInputText,
        initialImageDataUri: result.initialImageDataUri,
        steps: result.steps,
        finalOutput: result.finalOutput,
        overallError: result.overallError,
        executedAt: new Date().toISOString(),
        // totalDurationMs: result.steps.reduce((sum, step) => sum + (step.durationMs || 0), 0) // Calculate on client or flow
      });
    } catch (error: any) {
      console.error("Error executing pipeline flow:", error);
      toast({
        title: "فشل تنفيذ خط الأنابيب",
        description: error.message || "حدث خطأ غير متوقع أثناء محاولة تنفيذ خط الأنابيب.",
        variant: "destructive",
      });
      setPipelineExecutionResult({
        pipelineId: selectedPipelineForExecution.id,
        pipelineName: selectedPipelineForExecution.name,
        initialInputText: initialPipelineInput,
        steps: [],
        overallError: error.message || "حدث خطأ غير متوقع.",
        executedAt: new Date().toISOString(),
      });
    } finally {
      setIsExecutingPipeline(false);
    }
  };


  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ms-4 text-lg text-muted-foreground">جاري تحميل صفحة خطوط الأنابيب...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-0 sm:p-2 md:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Share2 className="h-8 w-8" />
          خطوط أنابيب الوكلاء
        </h1>
        <Dialog open={showPipelineForm} onOpenChange={(isOpen) => {
          setShowPipelineForm(isOpen);
          if (!isOpen) setEditingPipeline(null);
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={allAgents.length === 0 && isMounted}>
              <PlusCircle className="me-2 h-5 w-5" />
              إنشاء خط أنابيب جديد
            </Button>
          </DialogTrigger>
           {allAgents.length === 0 && isMounted && !showPipelineForm && ( // Only show if form is not open
             <p className="text-sm text-destructive text-end sm:text-start mt-1 w-full sm:w-auto">
               <Link href="/agents" className="underline hover:text-destructive/80">أنشئ بعض الوكلاء</Link> أولاً لتتمكن من إنشاء خط أنابيب.
             </p>
           )}
          <DialogContent className="sm:max-w-[700px] bg-card max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-primary text-2xl">
                {editingPipeline ? 'تعديل خط الأنابيب' : 'إنشاء خط أنابيب جديد'}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-grow pr-6 -mr-6"> {/* Add padding for scrollbar */}
              <PipelineForm
                pipeline={editingPipeline}
                allAgents={allAgents}
                onSave={handleSavePipeline}
                onCancel={() => {
                  setShowPipelineForm(false);
                  setEditingPipeline(null);
                }}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Execution Dialog */}
      <Dialog open={!!selectedPipelineForExecution} onOpenChange={(isOpen) => {
        if (!isOpen) setSelectedPipelineForExecution(null);
      }}>
        <DialogContent className="sm:max-w-[800px] md:max-w-[90vw] lg:max-w-[70vw] bg-card max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-primary text-2xl flex items-center gap-2">
              <Play className="h-6 w-6" />
              تنفيذ خط الأنابيب: {selectedPipelineForExecution?.name}
            </DialogTitle>
            <DialogDescription>
              أدخل الرسالة الأولية لبدء تنفيذ خط الأنابيب.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto space-y-4 p-1 -m-1">
            <div className="space-y-2">
              <Label htmlFor="pipeline-input" className="text-base">الرسالة الأولية:</Label>
              <Textarea
                id="pipeline-input"
                value={initialPipelineInput}
                onChange={(e) => setInitialPipelineInput(e.target.value)}
                placeholder="اكتب رسالتك هنا لبدء خط الأنابيب..."
                className="min-h-[100px] text-base"
                disabled={isExecutingPipeline}
              />
            </div>

            <Button onClick={handleExecutePipeline} disabled={isExecutingPipeline || !initialPipelineInput.trim()} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base py-3">
              {isExecutingPipeline ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <Send className="me-2 h-5 w-5" />}
              تنفيذ خط الأنابيب
            </Button>
            
            {isExecutingPipeline && (
              <div className="text-center p-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">جاري تنفيذ خط الأنابيب، يرجى الانتظار...</p>
              </div>
            )}

            {pipelineExecutionResult && (
              <Card className="mt-6 bg-background/30">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">نتائج التنفيذ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-muted-foreground">المدخل الأولي:</h4>
                    <p className="p-2 bg-muted rounded-md whitespace-pre-wrap">{pipelineExecutionResult.initialInputText}</p>
                  </div>

                  {pipelineExecutionResult.steps.map((step, index) => (
                    <div key={index} className="border-b border-border/50 pb-3 mb-3">
                      <h5 className="font-semibold text-accent flex items-center gap-2">
                        <ChevronsRight className="h-5 w-5" />
                        الخطوة {index + 1}: {step.agentName} ({step.agentId.substring(0,8)})
                      </h5>
                       {/* <p className="text-xs text-muted-foreground mt-1 mb-1">المدخل المستلم: <span className="font-mono text-xs bg-muted p-1 rounded">{step.input.substring(0,100) + (step.input.length > 100 ? '...' : '')}</span></p> */}
                      {step.output && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">المخرج:</p>
                          <div className="p-2 bg-muted rounded-md prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                             <MarkdownRenderer content={step.output} />
                          </div>
                        </div>
                      )}
                      {step.error && (
                        <div className="p-2 bg-destructive/20 text-destructive rounded-md">
                          <p className="font-semibold flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> خطأ في هذه الخطوة:</p>
                          <p className="text-sm">{step.error}</p>
                        </div>
                      )}
                      {/* step.durationMs && <p className="text-xs text-muted-foreground mt-1">المدة: {step.durationMs} مللي ثانية</p> */}
                    </div>
                  ))}

                  {pipelineExecutionResult.finalOutput && !pipelineExecutionResult.overallError && (
                    <div>
                      <h4 className="font-semibold text-primary mt-4">المخرج النهائي لخط الأنابيب:</h4>
                       <div className="p-3 bg-primary/10 text-primary-foreground rounded-md prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                          <MarkdownRenderer content={pipelineExecutionResult.finalOutput} />
                       </div>
                    </div>
                  )}
                  {pipelineExecutionResult.overallError && (
                    <div className="p-3 bg-destructive/20 text-destructive rounded-md mt-4">
                      <h4 className="font-semibold flex items-center gap-1"><AlertTriangle className="h-5 w-5" /> خطأ عام في خط الأنابيب:</h4>
                      <p>{pipelineExecutionResult.overallError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            <DialogClose asChild>
                <Button variant="outline">إغلاق</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Display Pipelines */}
      {pipelines.length === 0 && !showPipelineForm && isMounted ? ( // Added isMounted check
        <div className="text-center py-12">
          <Share2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">لا يوجد خطوط أنابيب حتى الآن.</p>
          <p className="text-muted-foreground">
            {allAgents.length > 0 ? "ابدأ بإنشاء خط أنابيب جديد لعرضه هنا." : <span>يرجى <Link href="/agents" className="text-accent hover:underline">إنشاء بعض الوكلاء</Link> أولاً لتتمكن من بناء خطوط الأنابيب.</span>}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pipelines.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              allAgents={allAgents}
              onExecute={() => handleOpenExecutionDialog(pipeline)}
              onEdit={() => handleEditPipeline(pipeline)}
              onDelete={() => handleDeletePipeline(pipeline.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PipelinesPage() {
  return (
    // Suspense can be added here if data fetching becomes async and not from localStorage
    <PipelinesPageContent />
  );
}

