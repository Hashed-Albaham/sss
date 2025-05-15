'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Agent, Message, ChatSession } from '@/types';
import useLocalStorage from '@/hooks/use-local-storage';
import ChatInterface from './components/chat-interface';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageSquare, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { chatWithAgent, type ChatInput } from '@/ai/flows/chat-flow'; // Import Genkit flow
import { useToast } from '@/hooks/use-toast';

const AGENTS_STORAGE_KEY = 'wakilPlusAgents';
const CHAT_HISTORY_PREFIX = 'wakilPlusChatHistory_';

async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [agents, setAgents] = useLocalStorage<Agent[]>(AGENTS_STORAGE_KEY, []);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useLocalStorage<Message[]>('temp-chat', []);
  const [chatSessions, setChatSessions] = useLocalStorage<Record<string, ChatSession>>('wakilPlusChatSessions', {});
  const [isAgentResponding, setIsAgentResponding] = useState(false);
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const agentIdFromQuery = searchParams.get('agentId');
    if (agentIdFromQuery && agents.find(a => a.id === agentIdFromQuery)) {
      setSelectedAgentId(agentIdFromQuery);
    } else if (agents.length > 0 && !selectedAgentId) {
      // setSelectedAgentId(agents[0].id); // Default to first agent if none selected and no valid query param
    }
  }, [searchParams, agents, selectedAgentId]);

  const updateChatSession = useCallback((agentId: string, messagesToSave: Message[]) => {
    const sessionKey = `${CHAT_HISTORY_PREFIX}${agentId}`;
    setChatSessions(prevSessions => ({
      ...prevSessions,
      [sessionKey]: {
        agentId: agentId,
        messages: messagesToSave,
        lastUpdated: new Date().toISOString(),
      }
    }));
  }, [setChatSessions]);

  useEffect(() => {
    if (selectedAgentId) {
      const sessionKey = `${CHAT_HISTORY_PREFIX}${selectedAgentId}`;
      const existingSession = chatSessions[sessionKey];
      if (existingSession) {
        setCurrentMessages(existingSession.messages);
      } else {
        setCurrentMessages([]);
      }
    } else {
        setCurrentMessages([]); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgentId]); // setCurrentMessages is stable, chatSessions changes when new message is saved.

  const handleSendMessage = async (text: string, imageFile: File | null = null) => {
    if (!selectedAgentId || !selectedAgent) return;

    setIsAgentResponding(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
      timestamp: new Date().toISOString(),
    };

    const messagesWithUser = [...currentMessages, userMessage];
    setCurrentMessages(messagesWithUser);

    // Add typing indicator
    const typingMessage: Message = {
      id: crypto.randomUUID(),
      role: 'agent',
      content: 'يكتب الوكيل...',
      timestamp: new Date().toISOString(),
      agentId: selectedAgentId,
      isTyping: true,
    };
    const messagesWithTyping = [...messagesWithUser, typingMessage];
    setCurrentMessages(messagesWithTyping);

    try {
      let imageDataUri: string | undefined = undefined;
      if (imageFile) {
        imageDataUri = await fileToDataUri(imageFile);
      }

      const flowInput: ChatInput = {
        userText: text,
        agentSystemPrompt: selectedAgent.systemPrompt,
        imageDataUri: imageDataUri,
      };
      
      const response = await chatWithAgent(flowInput);

      const agentResponse: Message = {
        id: crypto.randomUUID(),
        role: 'agent',
        content: response.agentResponse,
        timestamp: new Date().toISOString(),
        agentId: selectedAgentId,
      };
      
      // Remove typing message and add actual response
      const finalMessages = [...messagesWithUser, agentResponse];
      setCurrentMessages(finalMessages);
      updateChatSession(selectedAgentId, finalMessages);

    } catch (error) {
      console.error("Error calling Genkit flow:", error);
      toast({
        title: "خطأ في الاتصال بالوكيل",
        description: "حدث خطأ أثناء محاولة الحصول على رد من الوكيل. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      // Remove typing message on error
      setCurrentMessages(messagesWithUser); 
      updateChatSession(selectedAgentId, messagesWithUser);
    } finally {
      setIsAgentResponding(false);
      // Clean up object URL if it was created for the user message
      if (userMessage.imageUrl && userMessage.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(userMessage.imageUrl);
      }
    }
  };
  
  const handleAgentSelection = (agentId: string) => {
    setSelectedAgentId(agentId);
    const sessionKey = `${CHAT_HISTORY_PREFIX}${agentId}`;
    if (chatSessions[sessionKey]) {
      setCurrentMessages(chatSessions[sessionKey].messages);
    } else {
      setCurrentMessages([]);
    }
  };

  if (!isMounted) {
    return <div className="flex items-center justify-center h-full"><p className="text-muted-foreground text-lg">جارٍ تحميل واجهة المحادثة...</p></div>;
  }
  
  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <MessageSquare className="h-8 w-8" />
          محادثة تفاعلية
        </h1>
        {agents.length > 0 && (
           <div className="w-full sm:w-72">
            <Select value={selectedAgentId || ""} onValueChange={handleAgentSelection} disabled={isAgentResponding}>
              <SelectTrigger className="w-full bg-card">
                <SelectValue placeholder="اختر وكيلاً للمحادثة..." />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
           </div>
        )}
      </div>

      {agents.length === 0 ? (
        <Card className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card">
          <Bot className="h-20 w-20 text-muted-foreground mb-6" />
          <CardTitle className="text-2xl mb-2 text-card-foreground">لا يوجد وكلاء متاحون</CardTitle>
          <p className="text-muted-foreground mb-6 max-w-md">
            يجب عليك إنشاء وكيل واحد على الأقل في صفحة <Link href="/agents" className="text-accent hover:underline">إدارة الوكلاء</Link> قبل أن تتمكن من بدء محادثة.
          </p>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/agents">
              اذهب إلى إدارة الوكلاء
            </Link>
          </Button>
        </Card>
      ) : !selectedAgentId ? (
         <Card className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card">
            <Bot className="h-20 w-20 text-muted-foreground mb-6" />
            <CardTitle className="text-2xl mb-2 text-card-foreground">اختر وكيلاً</CardTitle>
            <p className="text-muted-foreground mb-6 max-w-md">
              يرجى اختيار وكيل من القائمة أعلاه لبدء المحادثة.
            </p>
          </Card>
      ) : (
        <Card className="flex-1 flex flex-col bg-card overflow-hidden">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-xl text-card-foreground">
              محادثة مع: <span className="text-accent">{selectedAgent?.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ChatInterface
              agent={selectedAgent}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              isAgentResponding={isAgentResponding}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><p className="text-muted-foreground text-lg">جارٍ تحميل واجهة المحادثة...</p></div>}>
      <ChatPageContent />
    </Suspense>
  );
}
