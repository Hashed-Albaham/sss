'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

// Basic inline code style
const codeStyle: React.CSSProperties = {
  backgroundColor: 'rgba(100, 100, 100, 0.2)',
  padding: '0.1em 0.3em',
  borderRadius: '0.25em',
  fontFamily: 'monospace',
  fontSize: '0.9em',
};

// Basic pre/code block style
const preStyle: React.CSSProperties = {
  backgroundColor: 'rgba(50, 50, 50, 0.5)',
  padding: '0.8em',
  borderRadius: '0.3em',
  overflowX: 'auto',
  fontFamily: 'monospace',
  fontSize: '0.9em',
  margin: '0.5em 0',
  color: '#e0e0e0', // Lighter text for dark code blocks
};


export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // This is a VERY simplified Markdown to HTML converter.
  // It only handles basic cases for demonstration.
  // For a production app, use a library like react-markdown.

  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/`(.*?)`/g, `<code style="background-color: rgba(100,100,100,0.2); padding: 0.1em 0.3em; border-radius: 0.25em; font-family: monospace; font-size: 0.9em;">$1</code>`) // Inline code
    .replace(/```([\s\S]*?)```/g, (match, codeBlock) => { // Code blocks
      const lines = codeBlock.split('\n');
      const lang = lines[0].trim(); // Attempt to get language
      const code = lines.slice(1).join('\n');
      return `<pre style="background-color: rgba(30,30,30,0.8); color: #f0f0f0; padding: 0.8em; border-radius: 0.3em; overflow-x: auto; font-family: monospace; font-size: 0.9em; margin: 0.5em 0;"><code ${lang ? `class="language-${lang}"` : ''}>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    })
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>') // Links
    .replace(/^\s*([-*+])\s+(.*)/gm, '<ul><li>$2</li></ul>') // Basic lists (very naive, combines all list items into separate uls)
    .replace(/\n/g, '<br />'); // Newlines

  // To somewhat fix the multiple ULs, a more complex regex or post-processing would be needed.
  // For now, this is a basic visual representation.

  return <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-sm dark:prose-invert max-w-none leading-relaxed" />;
}
