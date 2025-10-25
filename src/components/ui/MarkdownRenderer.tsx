'use client';

import remarkGfm from 'remark-gfm';

import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

import { Box, BoxProps } from '@chakra-ui/react';

import './markdown-renderer.css';

interface MarkdownRendererProps extends BoxProps {
  content: string;
}

/**
 * Renders markdown content with consistent styling
 * Supports GitHub Flavored Markdown (GFM)
 * Note: Headers are disabled and will render as plain text
 */
export function MarkdownRenderer({
  content,
  ...boxProps
}: MarkdownRendererProps) {
  // Disable headers by rendering them as plain text
  const components: Components = {
    h1: ({ children }) => <>{children}</>,
    h2: ({ children }) => <>{children}</>,
    h3: ({ children }) => <>{children}</>,
    h4: ({ children }) => <>{children}</>,
    h5: ({ children }) => <>{children}</>,
    h6: ({ children }) => <>{children}</>,
  };

  return (
    <Box className="markdown-content" lineHeight="1.7" {...boxProps}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </Box>
  );
}
