/* Strapi v5 rich-text blocks → HTML serialiser (server-side, no React) */

type TextNode = {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

type LinkNode = {
  type: 'link';
  url: string;
  children: TextNode[];
};

type InlineNode = TextNode | LinkNode;

type Block =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: { type: 'list-item'; children: InlineNode[] }[] }
  | { type: 'quote'; children: InlineNode[] }
  | { type: 'code'; language?: string; children: [{ type: 'code'; text: string }] }
  | { type: 'image'; image: { url: string; alternativeText?: string; width?: number; height?: number } }
  | { type: 'divider' };

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineToHtml(nodes: InlineNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === 'link') {
        const inner = inlineToHtml(n.children);
        const href = escHtml(n.url);
        const external = /^https?:\/\//.test(n.url);
        return external
          ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${inner}</a>`
          : `<a href="${href}">${inner}</a>`;
      }
      let t = escHtml(n.text);
      if (n.code)          t = `<code>${t}</code>`;
      if (n.bold)          t = `<strong>${t}</strong>`;
      if (n.italic)        t = `<em>${t}</em>`;
      if (n.underline)     t = `<u>${t}</u>`;
      if (n.strikethrough) t = `<s>${t}</s>`;
      return t;
    })
    .join('');
}

export function blocksToHtml(blocks: unknown): string {
  if (!Array.isArray(blocks)) return '';
  return (blocks as Block[])
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${inlineToHtml(block.children)}</p>`;
        case 'heading': {
          const t = `h${block.level}`;
          return `<${t}>${inlineToHtml(block.children)}</${t}>`;
        }
        case 'list': {
          const tag = block.format === 'ordered' ? 'ol' : 'ul';
          const items = block.children
            .map((li) => `<li>${inlineToHtml(li.children)}</li>`)
            .join('');
          return `<${tag}>${items}</${tag}>`;
        }
        case 'quote':
          return `<blockquote>${inlineToHtml(block.children)}</blockquote>`;
        case 'code': {
          const lang = block.language ? ` class="language-${escHtml(block.language)}"` : '';
          const code = block.children[0]?.text ?? '';
          return `<pre><code${lang}>${escHtml(code)}</code></pre>`;
        }
        case 'image': {
          const { url, alternativeText = '', width, height } = block.image;
          const w = width  ? ` width="${width}"`  : '';
          const h = height ? ` height="${height}"` : '';
          return `<img src="${escHtml(url)}" alt="${escHtml(alternativeText)}"${w}${h} loading="lazy" />`;
        }
        case 'divider':
          return '<hr />';
        default:
          return '';
      }
    })
    .join('\n');
}
