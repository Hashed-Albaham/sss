// This component is intentionally left mostly empty for now.
// It will be developed further in a subsequent step if this approach is confirmed.
'use client';

import type { Pipeline, Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Edit3, Trash2, Users, CalendarDays } from 'lucide-react';

interface PipelineCardProps {
  pipeline: Pipeline;
  allAgents: Agent[]; // To resolve agent names if needed
  onExecute: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PipelineCard({ pipeline, allAgents, onExecute, onEdit, onDelete }: PipelineCardProps) {
  const agentNamesInSequence = pipeline.agentSequence.map(seq => {
    const agent = allAgents.find(a => a.id === seq.agentId);
    return agent ? agent.name : 'وكيل غير معروف';
  }).join(' ← ');

  return (
    <Card className="flex flex-col justify-between h-full bg-card border-border hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-xl mb-1 text-card-foreground">{pipeline.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2 h-10">
          {pipeline.description || 'لا يوجد وصف لخط الأنابيب هذا.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center">
            <Users className="me-2 h-3 w-3" />
            تسلسل الوكلاء ({pipeline.agentSequence.length}):
          </h4>
          <p className="text-xs text-primary bg-primary/10 p-1.5 rounded-md line-clamp-2">
            {agentNamesInSequence || "لم يتم تحديد وكلاء."}
          </p>
        </div>
        <p className="text-xs text-muted-foreground flex items-center">
            <CalendarDays className="me-2 h-3 w-3" />
            آخر تحديث: {new Date(pipeline.updatedAt).toLocaleDateString('ar-EG')}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4 border-t border-border/50">
        <Button variant="outline" size="sm" onClick={onExecute} className="w-full sm:w-auto text-accent border-accent hover:bg-accent hover:text-accent-foreground">
          <Play className="me-2 h-4 w-4" />
          تنفيذ
        </Button>
        <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 sm:flex-none">
          <Edit3 className="me-2 h-4 w-4" />
          تعديل
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} className="flex-1 sm:flex-none">
          <Trash2 className="me-2 h-4 w-4" />
          حذف
        </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
