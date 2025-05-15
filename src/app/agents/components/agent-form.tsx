'use client';

import { useState, useEffect } from 'react';
import type { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, XCircle, KeyRound } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface AgentFormProps {
  agent?: Agent | null;
  onSave: (agent: Agent) => void;
  onCancel: () => void;
}

const agentSchema = z.object({
  name: z.string().min(1, { message: "اسم الوكيل مطلوب" }).max(50, { message: "الاسم طويل جداً" }),
  description: z.string().max(200, { message: "الوصف طويل جداً" }).optional(),
  systemPrompt: z.string().min(1, { message: "الموجه النظامي مطلوب" }),
  apiKey: z.string().optional().or(z.literal('')),
  avatarUrl: z.string().url({ message: "الرابط غير صحيح" }).optional().or(z.literal('')),
});

type AgentFormData = z.infer<typeof agentSchema>;

export default function AgentForm({ agent, onSave, onCancel }: AgentFormProps) {
  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: agent?.name || '',
      description: agent?.description || '',
      systemPrompt: agent?.systemPrompt || '',
      apiKey: agent?.apiKey || '',
      avatarUrl: agent?.avatarUrl || '',
    },
  });
  
  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        description: agent.description || '',
        systemPrompt: agent.systemPrompt,
        apiKey: agent.apiKey || '',
        avatarUrl: agent.avatarUrl || '',
      });
    } else {
       form.reset({
        name: '',
        description: '',
        systemPrompt: '',
        apiKey: '',
        avatarUrl: '',
      });
    }
  }, [agent, form]);


  const handleSubmit = (data: AgentFormData) => {
    const now = new Date().toISOString();
    const newAgent: Agent = {
      id: agent?.id || crypto.randomUUID(),
      ...data,
      description: data.description || '', // ensure description is not undefined
      apiKey: data.apiKey || undefined, // ensure empty string becomes undefined
      avatarUrl: data.avatarUrl || undefined, // ensure empty string becomes undefined
      createdAt: agent?.createdAt || now,
      updatedAt: now,
    };
    onSave(newAgent);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الوكيل</FormLabel>
              <FormControl>
                <Input placeholder="مثال: مساعد خدمة العملاء" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وصف الوكيل (اختياري)</FormLabel>
              <FormControl>
                <Input placeholder="وصف قصير لمهمة الوكيل" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الموجه النظامي (System Prompt)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أنت مساعد مفيد وودود..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                مفتاح API (اختياري)
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="أدخل مفتاح API هنا (إن وجد)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رابط صورة الأفاتار (اختياري)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://placehold.co/100x100.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <XCircle className="me-2 h-4 w-4" />
            إلغاء
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="me-2 h-4 w-4" />
            {agent ? 'حفظ التعديلات' : 'إنشاء الوكيل'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
