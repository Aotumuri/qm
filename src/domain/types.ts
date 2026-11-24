import type { JSONContent } from '@tiptap/core'

export interface Notebook {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Memo {
  id: string
  notebookId: string
  title: string
  content: string | JSONContent
  createdAt: string
  updatedAt: string
}
