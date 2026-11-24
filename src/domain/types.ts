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
  content: string
  createdAt: string
  updatedAt: string
}
