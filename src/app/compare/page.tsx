'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import type { Agent, CompareAgentsResultItem } from '@/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { Input } from '@/components/ui/input'; // Not used currently for prompt
import { GitCompareArrows, Send, Paperclip, Loader2, AlertTriangle, User, Bot, Users as UsersIcon } from 'lucide-react'; // Renamed Users to UsersIcon
import { useToast } from '@/hooks/use-toast';
import { compareMultipleAgents, type CompareAgentsFlowInput } from '@/ai/flows/compare-agents-flow';
import MarkdownRenderer from '@/components/common/markdown-renderer';
import Image from 'next/image';

const AGENTS_STORAGE_KEY = 'wakilPlusAgents';

async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Simple XIcon for removing image preview
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}


function ComparePageContent() {
  const [allAgents, setAllAgents] = useLocalStorage<Agent[]>(AGENTS_STORAGE_KEY, []);
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [promptText, setPromptText] = useState('');
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [comparisonResults, setComparisonResults] = useState<CompareAgentsResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleAgentSelectionChange = (agentId: string) => {
    setSelectedAgentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAttachedImage(file);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl); 
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleCompare = async () => {
    if (selectedAgentIds.size === 0) {
      toast({ title: 'خطأ', description: 'يرجى اختيار وكيل واحد على الأقل للمقارنة.', variant: 'destructive' });
      return;
    }
    if (!promptText.trim() && !attachedImage) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رسالة أو إرفاق صورة.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const agentsToCompare = allAgents.filter(agent => selectedAgentIds.has(agent.id));
    
    setComparisonResults(agentsToCompare.map(agent => ({
      agentId: agent.id,
      agentName: agent.name,
      avatarUrl: agent.avatarUrl,
      isLoading: true,
    })));

    try {
      let imageDataUri: string | undefined = undefined;
      if (attachedImage) {
        imageDataUri = await fileToDataUri(attachedImage);
      }

      const flowInput: CompareAgentsFlowInput = {
        agents: agentsToCompare.map(({ id, name, systemPrompt, avatarUrl, apiKey }) => ({ id, name, systemPrompt, avatarUrl, apiKey })), // Pass apiKey
        userText: promptText,
        imageDataUri,
      };

      const response = await compareMultipleAgents(flowInput);
      setComparisonResults(response.results.map(res => ({...res, isLoading: false})));

    } catch (error: any) {
      console.error("Error calling compare agents flow:", error);
      toast({
        title: "خطأ في عملية المقارنة",
        description: error.message || "حدث خطأ غير متوقع أثناء مقارنة الوكلاء.",
        variant: "destructive",
      });
       setComparisonResults(prevResults => prevResults.map(r => 
        r.isLoading ? { ...r, isLoading: false, error: "فشلت عملية المقارنة العامة."} : r
      ));
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isMounted) {
     return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ms-4 text-lg text-muted-foreground">جاري تحميل صفحة المقارنة...</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-0 sm:p-2 lg:p-4 space-y-6">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
          <GitCompareArrows className="h-8 w-8" />
          مقارنة استجابات الوكلاء
        </h1>
        <p className="mt-2 text-md text-muted-foreground">
          أرسل نفس الرسالة إلى عدة وكلاء وقارن ردودهم جنبًا إلى جنب.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-1 bg-card border-border sticky top-20">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground">إعدادات المقارنة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-md mb-2 block font-medium">اختر الوكلاء للمقارنة:</Label>
              {allAgents.length > 0 ? (
                <ScrollArea className="h-40 rounded-md border border-input p-3">
                  {allAgents.map((agent) => (
                    <div key={agent.id} className="flex items-center space-x-2 space-x-reverse mb-2">
                      <Checkbox
                        id={`agent-${agent.id}`}
                        checked={selectedAgentIds.has(agent.id)}
                        onCheckedChange={() => handleAgentSelectionChange(agent.id)}
                        disabled={isLoading}
                        className="rtl:ml-2"
                      />
                      <Label htmlFor={`agent-${agent.id}`} className="flex-1 cursor-pointer text-sm">
                        {agent.name}
                      </Label>
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground p-3 border border-dashed rounded-md">
                  لا يوجد وكلاء متاحون. <Link href="/agents" className="text-accent hover:underline">أنشئ وكيلاً أولاً</Link>.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="prompt-text" className="text-md mb-2 block font-medium">الرسالة/الموجه:</Label>
              <Textarea
                id="prompt-text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="min-h-[100px]"
                disabled={isLoading}
              />
            </div>
            
            {imagePreviewUrl && (
              <div className="p-2 border border-dashed border-border rounded-md relative max-w-[120px]">
                <Image src={imagePreviewUrl} alt="Preview" width={100} height={100} className="rounded-md object-cover" data-ai-hint="image preview" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 end-1 h-6 w-6 opacity-80 hover:opacity-100"
                  onClick={handleRemoveImage}
                  disabled={isLoading}
                  title="إزالة الصورة"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload-compare"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload-compare')?.click()}
                disabled={isLoading}
                className="w-full"
              >
                <Paperclip className="me-2 h-4 w-4" />
                {attachedImage ? `تم تحديد صورة: ${attachedImage.name.substring(0,20)}...` : 'إرفاق صورة (اختياري)'}
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCompare} disabled={isLoading || selectedAgentIds.size === 0} className="w-full bg-primary hover:bg-primary/90">
              {isLoading ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <Send className="me-2 h-5 w-5" />}
              بدء المقارنة
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {isLoading && comparisonResults.length === 0 && ( 
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">جاري مقارنة الوكلاء...</p>
              </CardContent>
            </Card>
          )}

          {comparisonResults.length > 0 && (
             <h2 className="text-2xl font-semibold text-center text-primary">نتائج المقارنة</h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparisonResults.map((result) => (
              <Card key={result.agentId} className="bg-card border-border flex flex-col">
                <CardHeader className="flex-row gap-3 items-center border-b pb-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={result.avatarUrl || `https://placehold.co/40x40.png/29a800/FFFFFF?text=${result.agentName.substring(0,1)}`} alt={result.agentName} data-ai-hint={result.agentName.includes(" ") ? result.agentName.split(" ")[0].toLowerCase() : "abstract"} />
                    <AvatarFallback>{result.agentName.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg text-card-foreground">{result.agentName}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  {result.isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                      <p className="text-muted-foreground">جاري جلب الرد...</p>
                    </div>
                  ) : result.error ? (
                    <div className="text-destructive p-3 bg-destructive/10 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-semibold">حدث خطأ</span>
                      </div>
                      <p className="text-sm">{result.error}</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-64"> 
                       <MarkdownRenderer content={result.agentResponse || "لم يتم تقديم أي رد."} />
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
           { !isLoading && comparisonResults.length === 0 && selectedAgentIds.size > 0 && (
             <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                    <GitCompareArrows className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">اضغط على "بدء المقارنة" لعرض النتائج هنا.</p>
                </CardContent>
            </Card>
           )}
            { !isLoading && comparisonResults.length === 0 && selectedAgentIds.size === 0 && allAgents.length > 0 && (
             <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                    <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">اختر بعض الوكلاء من اللوحة اليسرى لبدء المقارنة.</p>
                </CardContent>
            </Card>
           )}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ms-4 text-lg text-muted-foreground">جاري تحميل صفحة المقارنة...</p>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}
