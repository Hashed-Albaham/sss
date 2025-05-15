'use client';

import type { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit3, Trash2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AgentCardProps {
  agent: Agent;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  const fallbackAvatarText = agent.name.substring(0, 2).toUpperCase();

  return (
    <Card className="flex flex-col justify-between h-full bg-card border-border hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex-row gap-4 items-start">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarImage src={agent.avatarUrl || `https://placehold.co/100x100.png/29a800/FFFFFF?text=${fallbackAvatarText}&font= árabe`} alt={agent.name} data-ai-hint="abstract geometric" />
          <AvatarFallback className="text-xl bg-primary/20 text-primary font-semibold">{fallbackAvatarText}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-xl mb-1 text-card-foreground">{agent.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 h-10">
            {agent.description || 'لا يوجد وصف متاح لهذا الوكيل.'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-xs text-muted-foreground mt-2">آخر تحديث: {new Date(agent.updatedAt).toLocaleDateString('ar-EG')}</p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4 border-t border-border/50">
        <Button variant="outline" size="sm" className="w-full sm:w-auto text-accent border-accent hover:bg-accent hover:text-accent-foreground" asChild>
           <Link href={`/chat?agentId=${agent.id}`}>
            <MessageSquare className="me-2 h-4 w-4" />
            محادثة
          </Link>
        </Button>
        <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 sm:flex-none">
          <Edit3 className="me-2 h-4 w-4" />
          تعديل
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
              <Trash2 className="me-2 h-4 w-4" />
              حذف
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد?</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف الوكيل "{agent.name}" بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                نعم, احذف الوكيل
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
