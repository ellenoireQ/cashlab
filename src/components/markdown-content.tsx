import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  content: string
  className?: string
}

/**
 * Component for rendering markdown content with proper styling
 * Supports bold, italic, lists, links, code blocks, etc.
 */
export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Paragraphs
        p: ({ children }) => (
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {children}
          </p>
        ),
        // Bold text
        strong: ({ children }) => (
          <strong className='font-semibold text-foreground'>{children}</strong>
        ),
        // Italic text
        em: ({ children }) => (
          <em className='italic text-foreground'>{children}</em>
        ),
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary underline-offset-4 hover:underline'
          >
            {children}
          </a>
        ),
        // Inline code
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-')
          if (isBlock) {
            return (
              <code className='block rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto'>
                {children}
              </code>
            )
          }
          return (
            <code className='rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground'>
              {children}
            </code>
          )
        },
        // Unordered lists
        ul: ({ children }) => (
          <ul className='space-y-2 list-disc list-inside'>{children}</ul>
        ),
        // Ordered lists
        ol: ({ children }) => (
          <ol className='space-y-2 list-decimal list-inside'>{children}</ol>
        ),
        // List items
        li: ({ children }) => (
          <li className='text-sm text-muted-foreground leading-relaxed'>
            {children}
          </li>
        ),
        // Headings
        h1: ({ children }) => (
          <h1 className='text-xl font-bold text-foreground mb-2'>{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className='text-lg font-semibold text-foreground mb-2'>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className='text-base font-semibold text-foreground mb-1'>{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className='text-sm font-semibold text-foreground mb-1'>{children}</h4>
        ),
        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className='border-l-4 border-primary pl-4 italic text-muted-foreground'>
            {children}
          </blockquote>
        ),
        // Horizontal rule
        hr: () => <hr className='my-4 border-border' />,
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
