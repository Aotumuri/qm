import type { JSONContent } from '@tiptap/core'

export function toMemoDocument(content: string | JSONContent): JSONContent {
  if (typeof content !== 'string') return content

  return {
    type: 'doc',
    content: content.split(/\r\n?|\n/).map((line) => ({
      type: 'paragraph',
      ...(line ? { content: [{ type: 'text', text: line }] } : {}),
    })),
  }
}

export function memoContentToText(content: string | JSONContent): string {
  if (typeof content === 'string') return content
  return getNodeText(content)
}

function getNodeText(node: JSONContent): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'

  const children = (node.content ?? []).map(getNodeText)
  return node.type === 'doc' ? children.join('\n') : children.join('')
}
