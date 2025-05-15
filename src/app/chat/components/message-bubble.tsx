'use client';

import type { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot, Loader2 } from 'lucide-react';
import MarkdownRenderer from '@/components/common/markdown-renderer';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
  agentName?: string;
  agentAvatar?: string;
}

export default function MessageBubble({ message, agentName, agentAvatar }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const fallbackAvatarText = isUser ? "أنت" : agentName?.substring(0,1) || "W";

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
        'flex items-end gap-3 max-w-[85%] sm:max-w-[75%]',
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
          isUser ? 'bg-accent text-accent-foreground rounded-es-none' : 'bg-muted text-muted-foreground rounded-ss-none'
        )}
      >
        {message.imageUrl && (
          <div className="mb-2">
            <Image src={message.imageUrl} alt="Attached image" width={200} height={200} className="rounded-md max-w-full h-auto object-contain" data-ai-hint="user upload" />
          </div>
        )}
        {renderContent()}
        {!message.isTyping && (
          <p className={cn("text-xs mt-1", isUser ? "text-accent-foreground/70" : "text-muted-foreground/70")}>
            {new Date(message.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}
