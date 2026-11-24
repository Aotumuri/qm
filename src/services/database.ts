import { openDB, type IDBPDatabase } from 'idb'
import type { Memo, Notebook } from '../domain/types'

interface QMeoDatabase {
  notebooks: {
    key: string
    value: Notebook
  }
  memos: {
    key: string
    value: Memo
    indexes: {
      'by-notebook': string
    }
  }
}

const DATABASE_NAME = 'qmeo-local'
const DATABASE_VERSION = 1

export function createDatabase(name = DATABASE_NAME) {
  return openDB<QMeoDatabase>(name, DATABASE_VERSION, {
    upgrade(database) {
      database.createObjectStore('notebooks', { keyPath: 'id' })
      const memoStore = database.createObjectStore('memos', { keyPath: 'id' })
      memoStore.createIndex('by-notebook', 'notebookId')
    },
  })
}

export function createMemoRepository(
  database: Promise<IDBPDatabase<QMeoDatabase>> = createDatabase(),
) {
  return {
    async getNotebooks(): Promise<Notebook[]> {
      const db = await database
      return (await db.getAll('notebooks')).sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      )
    },

    async getMemos(notebookId: string): Promise<Memo[]> {
      const db = await database
      return (await db.getAllFromIndex('memos', 'by-notebook', notebookId)).sort(
        (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      )
    },

    async createNotebook(name: string): Promise<Notebook> {
      const cleanedName = name.trim()
      if (!cleanedName) throw new Error('Notebook name cannot be empty.')

      const now = new Date().toISOString()
      const notebook: Notebook = {
        id: crypto.randomUUID(),
        name: cleanedName,
        createdAt: now,
        updatedAt: now,
      }
      const db = await database
      await db.add('notebooks', notebook)
      return notebook
    },

    async renameNotebook(id: string, name: string): Promise<Notebook> {
      const cleanedName = name.trim()
      if (!cleanedName) throw new Error('Notebook name cannot be empty.')

      const db = await database
      const transaction = db.transaction('notebooks', 'readwrite')
      const existing = await transaction.store.get(id)
      if (!existing) throw new Error(`Notebook "${id}" does not exist.`)

      const notebook = { ...existing, name: cleanedName, updatedAt: new Date().toISOString() }
      await transaction.store.put(notebook)
      await transaction.done
      return notebook
    },

    async deleteNotebook(id: string): Promise<void> {
      const db = await database
      const transaction = db.transaction(['notebooks', 'memos'], 'readwrite')
      const memoIds = await transaction.objectStore('memos')
        .index('by-notebook')
        .getAllKeys(id)

      await Promise.all([
        transaction.objectStore('notebooks').delete(id),
        ...memoIds.map((memoId) => transaction.objectStore('memos').delete(memoId)),
      ])
      await transaction.done
    },

    async createMemo(notebookId: string): Promise<Memo> {
      const db = await database
      const transaction = db.transaction(['notebooks', 'memos'], 'readwrite')
      const notebook = await transaction.objectStore('notebooks').get(notebookId)
      if (!notebook) throw new Error(`Notebook "${notebookId}" does not exist.`)

      const now = new Date().toISOString()
      const memo: Memo = {
        id: crypto.randomUUID(),
        notebookId,
        title: '',
        content: '',
        createdAt: now,
        updatedAt: now,
      }
      await transaction.objectStore('memos').add(memo)
      await transaction.done
      return memo
    },

    async saveMemo(
      update: Pick<Memo, 'id' | 'title' | 'content'>,
    ): Promise<Memo> {
      const db = await database
      const transaction = db.transaction('memos', 'readwrite')
      const existing = await transaction.store.get(update.id)
      if (!existing) throw new Error(`Memo "${update.id}" does not exist.`)

      const memo: Memo = {
        ...existing,
        title: update.title,
        content: update.content,
        updatedAt: new Date().toISOString(),
      }
      await transaction.store.put(memo)
      await transaction.done
      return memo
    },

    async deleteMemo(id: string): Promise<void> {
      const db = await database
      await db.delete('memos', id)
    },
  }
}

export const memoRepository = createMemoRepository()
