import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { deleteDB } from 'idb'
import { createDatabase, createMemoRepository } from './database'

const databaseName = 'qmeo-test'
let database: ReturnType<typeof createDatabase>
let repository: ReturnType<typeof createMemoRepository>

beforeEach(async () => {
  await deleteDB(databaseName)
  database = createDatabase(databaseName)
  repository = createMemoRepository(database)
})

afterEach(async () => {
  const db = await database
  db.close()
  await deleteDB(databaseName)
})

describe('memo repository', () => {
  it('creates and saves memos under a notebook', async () => {
    const notebook = await repository.createNotebook('Ideas')
    const memo = await repository.createMemo(notebook.id)

    const saved = await repository.saveMemo({
      id: memo.id,
      title: 'A quick thought',
      content: 'Keep it local.',
    })

    expect(await repository.getMemos(notebook.id)).toEqual([saved])
    expect(saved).toMatchObject({
      notebookId: notebook.id,
      title: 'A quick thought',
      content: 'Keep it local.',
    })
  })

  it('persists formatted memo content as structured data', async () => {
    const notebook = await repository.createNotebook('Ideas')
    const memo = await repository.createMemo(notebook.id)
    const content = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'A formatted thought' }],
        },
      ],
    }

    await repository.saveMemo({ id: memo.id, title: 'Title', content })

    expect((await repository.getMemos(notebook.id))[0]?.content).toEqual(content)
  })

  it('renames a notebook without changing its memos', async () => {
    const notebook = await repository.createNotebook('Drafts')
    const memo = await repository.createMemo(notebook.id)

    await repository.renameNotebook(notebook.id, 'Ideas')

    expect(await repository.getNotebooks()).toMatchObject([{ id: notebook.id, name: 'Ideas' }])
    expect(await repository.getMemos(notebook.id)).toEqual([memo])
  })

  it('deletes a notebook and all of its memos', async () => {
    const notebook = await repository.createNotebook('Temporary')
    await repository.createMemo(notebook.id)

    await repository.deleteNotebook(notebook.id)

    expect(await repository.getNotebooks()).toEqual([])
    expect(await repository.getMemos(notebook.id)).toEqual([])
  })

  it('rejects blank notebook names and missing notebook references', async () => {
    await expect(repository.createNotebook('  ')).rejects.toThrow(
      'Notebook name cannot be empty.',
    )
    await expect(repository.createMemo('missing')).rejects.toThrow(
      'Notebook "missing" does not exist.',
    )
  })
})
