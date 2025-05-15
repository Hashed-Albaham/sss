'use client';

import { useState, useRef, useEffect } from 'react';
import type { Agent, Message } from '@/types';
import MessageBubble from './message-bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, Image as ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

interface ChatInterfaceProps {
  agent: Agent | undefined;
  messages: Message[];
  onSendMessage: (message: Message) => void;
}

export default function ChatInterface({ agent, messages, onSendMessage }: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);
  
  useEffect(() => {
    // Clean up object URL
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAttachedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputText,
      imageUrl: imagePreviewUrl || undefined, // Use preview for display, actual upload would be different
      timestamp: new Date().toISOString(),
    };
    onSendMessage(newMessage);
    setInputText('');
    setAttachedImage(null);
    setImagePreviewUrl(null);
    if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
  };

  if (!agent) {
    return <div className="flex items-center justify-center h-full p-4"><p className="text-muted-foreground">الرجاء اختيار وكيل لبدء المحادثة.</p></div>;
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} agentName={agent.name} agentAvatar={agent.avatarUrl} />
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-background">
        {imagePreviewUrl && (
          <div className="mb-2 p-2 border border-dashed border-border rounded-md relative max-w-[150px]">
            <Image src={imagePreviewUrl} alt="Preview" width={100} height={100} className="rounded-md object-cover" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1 end-1 h-6 w-6 bg-destructive/70 text-destructive-foreground hover:bg-destructive"
              onClick={() => {
                setAttachedImage(null);
                setImagePreviewUrl(null);
                if(fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder={`اكتب رسالتك إلى ${agent.name}...`}
            className="flex-1 resize-none min-h-[40px] max-h-[150px] text-base"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            title="إرفاق صورة"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button type="submit" size="icon" className="h-10 w-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90" disabled={!inputText.trim() && !attachedImage}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
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
