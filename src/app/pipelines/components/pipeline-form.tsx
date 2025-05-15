// This component is intentionally left mostly empty for now.
// It will be developed further in a subsequent step if this approach is confirmed.
'use client';

import { useState, useEffect } from 'react';
import type { Agent, Pipeline, PipelineAgentConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, XCircle, ListPlus, ArrowUp, ArrowDown, Trash2, Users } from 'lucide-react';
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface PipelineFormProps {
  pipeline?: Pipeline | null;
  allAgents: Agent[];
  onSave: (pipeline: Pipeline) => void;
  onCancel: () => void;
}

const pipelineAgentConfigSchema = z.object({
  id: z.string(), // Unique ID for the step, can be agentId if unique in pipeline
  agentId: z.string().min(1, "يجب اختيار وكيل"),
});

const pipelineFormSchema = z.object({
  name: z.string().min(1, "اسم خط الأنابيب مطلوب").max(100, "الاسم طويل جداً"),
  description: z.string().max(300, "الوصف طويل جداً").optional(),
  agentSequence: z.array(pipelineAgentConfigSchema).min(1, "يجب إضافة وكيل واحد على الأقل إلى خط الأنابيب."),
});

type PipelineFormData = z.infer<typeof pipelineFormSchema>;

export default function PipelineForm({ pipeline, allAgents, onSave, onCancel }: PipelineFormProps) {
  const form = useForm<PipelineFormData>({
    resolver: zodResolver(pipelineFormSchema),
    defaultValues: {
      name: pipeline?.name || '',
      description: pipeline?.description || '',
      agentSequence: pipeline?.agentSequence || [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "agentSequence",
  });

  const [availableAgentToAdd, setAvailableAgentToAdd] = useState<string>("");

  useEffect(() => {
    if (pipeline) {
      form.reset({
        name: pipeline.name,
        description: pipeline.description || '',
        agentSequence: pipeline.agentSequence.map(seq => ({ id: seq.id, agentId: seq.agentId })),
      });
    } else {
      form.reset({ name: '', description: '', agentSequence: [] });
    }
  }, [pipeline, form]);

  const handleAddAgentToSequence = () => {
    if (availableAgentToAdd) {
      const agentExists = fields.some(field => field.agentId === availableAgentToAdd);
      // Allow adding the same agent multiple times, each with a unique step ID
      append({ agentId: availableAgentToAdd, id: crypto.randomUUID() });
      setAvailableAgentToAdd(""); // Reset selector
    }
  };

  const handleSubmit = (data: PipelineFormData) => {
    const now = new Date().toISOString();
    const newPipeline: Pipeline = {
      id: pipeline?.id || crypto.randomUUID(),
      ...data,
      description: data.description || '',
      agentSequence: data.agentSequence,
      createdAt: pipeline?.createdAt || now,
      updatedAt: now,
    };
    onSave(newPipeline);
  };
  
  const getAgentNameById = (agentId: string) => {
    const agent = allAgents.find(a => a.id === agentId);
    return agent ? agent.name : 'وكيل غير معروف';
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">اسم خط الأنابيب</Label>
        <Input id="name" {...form.register("name")} placeholder="مثال: خط أنابيب تحليل الشكاوى" />
        {form.formState.errors.name && <p className="text-destructive text-xs mt-1">{form.formState.errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">وصف خط الأنابيب (اختياري)</Label>
        <Textarea id="description" {...form.register("description")} placeholder="وصف موجز لعمل خط الأنابيب" />
        {form.formState.errors.description && <p className="text-destructive text-xs mt-1">{form.formState.errors.description.message}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center"><Users className="me-2 h-5 w-5 text-primary" /> تكوين تسلسل الوكلاء</CardTitle>
          <CardDescription>أضف الوكلاء بالترتيب الذي تريدهم أن يعملوا به.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <Label>اختر وكيلاً لإضافته:</Label>
              <Select value={availableAgentToAdd} onValueChange={setAvailableAgentToAdd}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر وكيلاً..." />
                </SelectTrigger>
                <SelectContent>
                  {allAgents.length > 0 ? allAgents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  )) : <p className="p-2 text-muted-foreground text-sm">لا يوجد وكلاء متاحون. قم بإنشاء وكلاء أولاً.</p>}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={handleAddAgentToSequence} disabled={!availableAgentToAdd || allAgents.length === 0}>
              <ListPlus className="me-2 h-4 w-4" /> إضافة وكيل للتسلسل
            </Button>
          </div>
          
          {form.formState.errors.agentSequence && !form.formState.errors.agentSequence.root && form.formState.errors.agentSequence.message && (
             <p className="text-destructive text-sm mt-1">{form.formState.errors.agentSequence.message}</p>
          )}

          {fields.length > 0 && (
            <ScrollArea className="h-48 border rounded-md p-2">
              <ul className="space-y-2">
                {fields.map((item, index) => (
                  <li key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <span className="font-medium">{index + 1}. {getAgentNameById(item.agentId)}</span>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => move(index, index - 1)} disabled={index === 0} title="تحريك لأعلى">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => move(index, index + 1)} disabled={index === fields.length - 1} title="تحريك لأسفل">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} title="إزالة الوكيل">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
          {fields.length === 0 && <p className="text-muted-foreground text-center py-3">لم يتم إضافة أي وكلاء لخط الأنابيب بعد.</p>}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <XCircle className="me-2 h-4 w-4" />
          إلغاء
        </Button>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="me-2 h-4 w-4" />
          {pipeline ? 'حفظ التعديلات' : 'إنشاء خط الأنابيب'}
        </Button>
      </div>
    </form>
  );
}
