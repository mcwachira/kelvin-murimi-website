import type { PortableTextBlock, PortableTextItem } from './types'

const CHARS: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (ch) => CHARS[ch] ?? ch)
}

export function blocksToPlainText(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks) return ''
  return blocks
    .map((block) => (block.children ?? []).map((child) => child.text ?? '').join(''))
    .join('\n\n')
}

export function blocksToMarkdown(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks) return ''
  return blocks
    .map((block) => {
      const text = (block.children ?? []).map((child) => child.text ?? '').join('')
      switch (block.style) {
        case 'h1':
          return `# ${text}`
        case 'h2':
          return `## ${text}`
        case 'h3':
          return `### ${text}`
        case 'blockquote':
          return `> ${text}`
        case 'code':
          return '```\n' + text + '\n```'
        default:
          return text
      }
    })
    .join('\n\n')
}

/**
 * Parse a plain-textarea representation of a document into Sanity Portable
 * Text blocks. Conventions:
 *   - a blank line separates paragraphs
 *   - `## ` / `### ` / `# ` prefix a heading (h2/h3/h1)
 *   - `- ` prefix a bullet item
 *   - `> ` prefix a blockquote
 *   - a line starting with four spaces is code
 */
export function plainTextToBlocks(markdown: string): PortableTextBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: PortableTextBlock[] = []
  let paragraph: string[] = []

  function flushParagraph() {
    if (paragraph.length === 0) return
    const text = paragraph.join('\n')
    if (!text.trim()) return
    blocks.push(makeBlock('normal', text))
    paragraph = []
  }

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '')
    if (!line.trim()) {
      flushParagraph()
      continue
    }
    if (line.startsWith('    ')) {
      flushParagraph()
      blocks.push(makeBlock('code', line.replace(/^ {4}/, '')))
      continue
    }
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line)
    if (bullet) {
      flushParagraph()
      blocks.push(makeBlock('normal', bullet[1], true))
      continue
    }
    const quote = /^>\s?(.*)$/.exec(line)
    if (quote) {
      flushParagraph()
      blocks.push(makeBlock('blockquote', quote[1]))
      continue
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      flushParagraph()
      const level = heading[1].length
      blocks.push(makeBlock(level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3', heading[2]))
      continue
    }
    paragraph.push(line)
  }
  flushParagraph()
  return blocks
}

function makeBlock(
  style: PortableTextBlock['style'],
  text: string,
  bullet = false,
): PortableTextBlock {
  return {
    _type: 'block',
    _key: `block-${Math.random().toString(36).slice(2, 10)}`,
    style,
    listItem: bullet ? 'bullet' : undefined,
    children: [
      {
        _type: 'span',
        text,
      },
    ],
  }
}

/** Render Portable Text children as HTML for the rich-text editor preview. */
export function blocksToHtml(blocks: PortableTextItem[] | undefined): string {
  if (!blocks) return ''
  let html = ''
  for (const block of blocks) {
    if (block._type !== 'block') continue
    const text = (block.children ?? [])
      .map((child) => (child._type === 'span' ? escapeHtml(child.text ?? '') : ''))
      .join('')
    const content =
      block.listItem === 'bullet' ? `<li>${text}</li>` : `<p>${text}</p>`
    if (block.listItem === 'bullet') {
      html += content
    } else if (block.style === 'h1') {
      html += `<h1>${text}</h1>`
    } else if (block.style === 'h2') {
      html += `<h2>${text}</h2>`
    } else if (block.style === 'h3') {
      html += `<h3>${text}</h3>`
    } else if (block.style === 'blockquote') {
      html += `<blockquote>${text}</blockquote>`
    } else if (block.style === 'code') {
      html += `<pre><code>${text}</code></pre>`
    } else {
      html += `<p>${text}</p>`
    }
  }
  return html
}
