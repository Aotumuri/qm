import { describe, expect, it } from 'vitest'
import { memoContentToText, toMemoDocument } from './memoContent'

describe('memo content', () => {
  it('converts legacy plain text into paragraphs without losing line breaks', () => {
    expect(toMemoDocument('first line\n\nthird line')).toEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'first line' }] },
        { type: 'paragraph' },
        { type: 'paragraph', content: [{ type: 'text', text: 'third line' }] },
      ],
    })
  })

  it('extracts readable text from formatted content for search and previews', () => {
    expect(
      memoContentToText({
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Plan' }] },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Keep it ' },
              { type: 'text', text: 'local', marks: [{ type: 'bold' }] },
              { type: 'hardBreak' },
              { type: 'text', text: 'and private.' },
            ],
          },
        ],
      }),
    ).toBe('Plan\nKeep it local\nand private.')
  })
})
