
'use client';

import type { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot, Loader2, Copy, Check } from 'lucide-react';
import MarkdownRenderer from '@/components/common/markdown-renderer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface MessageBubbleProps {
  message: Message;
  agentName?: string;
  agentAvatar?: string;
}

export default function MessageBubble({ message, agentName, agentAvatar }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const fallbackAvatarText = isUser ? "أنت" : agentName?.substring(0,1) || "W";
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (message.isTyping || !message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      toast({
        title: "تم النسخ!",
        description: "تم نسخ محتوى الرسالة إلى الحافظة.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "فشل النسخ",
        description: "لم نتمكن من نسخ الرسالة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    if (message.isTyping) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{message.content}</span>
        </div>
      );
    }
    return <MarkdownRenderer content={message.content || ''} />;
  }

  return (
    <div
      className={cn(
        'group flex items-end gap-3 max-w-[85%] sm:max-w-[75%]',
        isUser ? 'ms-auto flex-row-reverse' : 'me-auto'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0 border">
        {isUser ? (
          <>
            <AvatarImage src="https://placehold.co/40x40.png/ec2c71/FFFFFF?text=U" alt="User" data-ai-hint="person user" />
            <AvatarFallback className="bg-accent text-accent-foreground"><User className="h-4 w-4" /></AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src={agentAvatar || `https://placehold.co/40x40.png/29a800/FFFFFF?text=${fallbackAvatarText}`} alt={agentName || 'Agent'} data-ai-hint="robot friendly"/>
            <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
          </>
        )}
      </Avatar>
      <div
        className={cn(
          'p-3 rounded-lg shadow-md break-words',
          isUser 
            ? 'bg-background text-primary border border-primary/30 dark:bg-primary dark:text-primary-foreground dark:border-transparent rounded-es-none' 
            : 'bg-card text-card-foreground border border-border rounded-ss-none'
        )}
      >
        {message.imageUrl && (
          <div className="mb-2">
            <Image src={message.imageUrl} alt="Attached image" width={200} height={200} className="rounded-md max-w-full h-auto object-contain" data-ai-hint="user upload" />
          </div>
        )}
        {renderContent()}
        
        {!message.isTyping && (
          <div className={cn(
            "flex items-center text-xs mt-1.5",
            "justify-start" 
          )}>
            <p className={cn( isUser ? "text-primary/70 dark:text-primary-foreground/70" : "text-muted-foreground/70" )}>
              {new Date(message.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </p>
            {message.content && ( 
              <Button
                variant="ghost"
                size="sm" 
                className={cn(
                  "p-1 h-auto rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity",
                  "ms-2", 
                  isCopied ? 
                    "text-primary" : // Stays primary (green) when copied
                    (isUser ? 
                      "text-primary/80 hover:text-primary dark:text-primary-foreground/80 dark:hover:text-primary-foreground" : 
                      "text-muted-foreground/80 hover:text-foreground")
                )}
                onClick={handleCopy}
                aria-label="نسخ الرسالة"
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

