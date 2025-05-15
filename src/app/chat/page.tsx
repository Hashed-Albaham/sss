'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Agent, Message, ChatSession } from '@/types';
import useLocalStorage from '@/hooks/use-local-storage';
import ChatInterface from './components/chat-interface';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageSquare, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const AGENTS_STORAGE_KEY = 'wakilPlusAgents';
const CHAT_HISTORY_PREFIX = 'wakilPlusChatHistory_';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [agents, setAgents] = useLocalStorage<Agent[]>(AGENTS_STORAGE_KEY, []);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useLocalStorage<Message[]>('temp-chat', []); // Temporary until agent selected
  const [chatSessions, setChatSessions] = useLocalStorage<Record<string, ChatSession>>('wakilPlusChatSessions', {});

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
        setCurrentMessages([]); // Clear messages if no agent is selected
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgentId, chatSessions]); // Do not add setCurrentMessages to deps

  const handleSendMessage = (newMessage: Message) => {
    if (!selectedAgentId) return;

    const updatedMessages = [...currentMessages, newMessage];
    setCurrentMessages(updatedMessages);

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: crypto.randomUUID(),
        role: 'agent',
        content: `أنا الوكيل ${agents.find(a=>a.id === selectedAgentId)?.name}. لقد تلقيت رسالتك: "${newMessage.content}". هذا رد تجريبي.`,
        timestamp: new Date().toISOString(),
        agentId: selectedAgentId,
      };
      const finalMessages = [...updatedMessages, agentResponse];
      setCurrentMessages(finalMessages);
      
      const sessionKey = `${CHAT_HISTORY_PREFIX}${selectedAgentId}`;
      setChatSessions(prevSessions => ({
        ...prevSessions,
        [sessionKey]: {
          agentId: selectedAgentId,
          messages: finalMessages,
          lastUpdated: new Date().toISOString(),
        }
      }));

    }, 1000);
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
            <Select value={selectedAgentId || ""} onValueChange={handleAgentSelection}>
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
