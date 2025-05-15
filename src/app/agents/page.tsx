'use client';

import { useState, useEffect } from 'react';
import type { Agent } from '@/types';
import useLocalStorage from '@/hooks/use-local-storage';
import AgentForm from './components/agent-form';
import AgentCard from './components/agent-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const AGENTS_STORAGE_KEY = 'wakilPlusAgents';

export default function AgentsPage() {
  const [agents, setAgents] = useLocalStorage<Agent[]>(AGENTS_STORAGE_KEY, []);
  const [isMounted, setIsMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSaveAgent = (agent: Agent) => {
    if (editingAgent) {
      setAgents(agents.map((a) => (a.id === agent.id ? agent : a)));
      toast({ title: "تم تحديث الوكيل", description: `تم تحديث "${agent.name}" بنجاح.` });
    } else {
      setAgents([...agents, agent]);
      toast({ title: "تم إنشاء الوكيل", description: `تم إنشاء "${agent.name}" بنجاح.` });
    }
    setShowForm(false);
    setEditingAgent(null);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowForm(true);
  };

  const handleDeleteAgent = (agentId: string) => {
    const agentToDelete = agents.find(a => a.id === agentId);
    setAgents(agents.filter((a) => a.id !== agentId));
    if (agentToDelete) {
      toast({ title: "تم حذف الوكيل", description: `تم حذف "${agentToDelete.name}" بنجاح.`, variant: "destructive" });
    }
  };

  if (!isMounted) {
    // Render skeleton or loading state here if needed
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Users className="h-8 w-8" />
            إدارة الوكلاء
          </h1>
        </div>
        <p className="text-muted-foreground">جارٍ تحميل بيانات الوكلاء...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Users className="h-8 w-8" />
          إدارة الوكلاء
        </h1>
        <Dialog open={showForm} onOpenChange={(isOpen) => {
          setShowForm(isOpen);
          if (!isOpen) setEditingAgent(null);
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="me-2 h-5 w-5" />
              إنشاء وكيل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card">
            <DialogHeader>
              <DialogTitle className="text-primary text-2xl">
                {editingAgent ? 'تعديل الوكيل' : 'إنشاء وكيل جديد'}
              </DialogTitle>
            </DialogHeader>
            <AgentForm
              agent={editingAgent}
              onSave={handleSaveAgent}
              onCancel={() => {
                setShowForm(false);
                setEditingAgent(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">لا يوجد وكلاء حتى الآن.</p>
          <p className="text-muted-foreground">ابدأ بإنشاء وكيل جديد لعرضه هنا.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={() => handleEditAgent(agent)}
              onDelete={() => handleDeleteAgent(agent.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
