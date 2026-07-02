import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Sparkles } from 'lucide-react';

/**
 * Renders AI-generated markdown safely (sanitized) inside the app's
 * signature "ai-block" treatment, so AI output is always visually
 * distinct from the student's own content.
 */
export default function AIContentBlock({ markdown, label = 'AI Generated' }) {
  const html = useMemo(() => {
    const rawHtml = marked.parse(markdown || '', { breaks: true });
    return DOMPurify.sanitize(rawHtml);
  }, [markdown]);

  return (
    <div className="ai-block">
      <span className="ai-tag mb-3 block">
        <Sparkles size={12} /> {label}
      </span>
      <div
        className="prose-sm max-w-none text-sm leading-relaxed text-ink [&_h1]:mt-3 [&_h1]:font-display [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:font-semibold [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:mb-2"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
