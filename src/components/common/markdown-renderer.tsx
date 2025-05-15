
'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // This is a VERY simplified Markdown to HTML converter.
  // It only handles basic cases for demonstration.
  // For a production app, use a library like react-markdown or similar.

  // Escape HTML characters to prevent XSS when inserting into code blocks, etc.
  const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    // For inline code, we rely on prose styling.
    .replace(/`([^`\n]+?)`/g, `<code>${escapeHtml('$1')}</code>`) 
    // For code blocks, we also rely on prose styling.
    // This regex handles ```lang\ncode``` or ```\ncode```
    .replace(/```(\w*\n)?([\s\S]*?)```/g, (match, langLine, codeBlock) => {
      const lang = langLine ? langLine.trim() : '';
      const escapedCode = escapeHtml(codeBlock);
      return `<pre><code ${lang ? `class="language-${lang}"` : ''}>${escapedCode}</code></pre>`;
    })
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>') // Links
    // Basic lists (very naive, combines all list items into separate uls, needs improvement for proper nesting)
    // This is a common issue with simple regex-based markdown.
    // A proper parser is needed for complex list structures.
    .replace(/^\s*([-*+])\s+(.*)/gm, '<ul><li>$2</li></ul>') 
    .replace(/\n/g, '<br />');

  // The prose classes should handle most of the styling including links, code, pre, strong, em.
  return <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-sm dark:prose-invert max-w-none leading-relaxed" />;
}
