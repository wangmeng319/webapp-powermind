'use client'
import { Streamdown } from 'streamdown'
import 'katex/dist/katex.min.css'

interface StreamdownMarkdownProps {
  content: string
  className?: string
}

// Use div instead of p to avoid hydration error when paragraphs contain block-level elements (e.g. images)
const components = {
  p: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <div className="mb-2 last:mb-0" {...props}>{children}</div>
  ),
}

export function StreamdownMarkdown({ content, className = '' }: StreamdownMarkdownProps) {
  return (
    <div className={`streamdown-markdown ${className}`}>
      <Streamdown components={components}>{content}</Streamdown>
    </div>
  )
}

export default StreamdownMarkdown
