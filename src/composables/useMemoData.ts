import { ref } from 'vue'
import { memoRepository } from '../services/database'
import type { Memo, Notebook } from '../domain/types'

export function useMemoData() {
  const notebooks = ref<Notebook[]>([])
  const memos = ref<Memo[]>([])
  const selectedNotebookId = ref<string | null>(null)
  let saveQueue = Promise.resolve()

  async function load() {
    notebooks.value = await memoRepository.getNotebooks()
    const firstNotebook = notebooks.value[0]
    selectedNotebookId.value = firstNotebook?.id ?? null
    memos.value = firstNotebook
      ? await memoRepository.getMemos(firstNotebook.id)
      : []
  }

  async function selectNotebook(id: string) {
    const notebook = notebooks.value.find((item) => item.id === id)
    if (!notebook) throw new Error(`Notebook "${id}" does not exist.`)

    const nextMemos = await memoRepository.getMemos(id)
    selectedNotebookId.value = id
    memos.value = nextMemos
  }

  async function createNotebook(name: string) {
    const notebook = await memoRepository.createNotebook(name)
    notebooks.value = await memoRepository.getNotebooks()
    await selectNotebook(notebook.id)
  }

  async function renameNotebook(id: string, name: string) {
    const updated = await memoRepository.renameNotebook(id, name)
    notebooks.value = notebooks.value.map((notebook) =>
      notebook.id === id ? updated : notebook,
    )
  }

  async function deleteNotebook(id: string) {
    await saveQueue
    await memoRepository.deleteNotebook(id)
    notebooks.value = notebooks.value.filter((notebook) => notebook.id !== id)

    if (selectedNotebookId.value === id) {
      const nextNotebook = notebooks.value[0]
      selectedNotebookId.value = nextNotebook?.id ?? null
      memos.value = nextNotebook
        ? await memoRepository.getMemos(nextNotebook.id)
        : []
    }
  }

  async function createMemo() {
    if (!selectedNotebookId.value) {
      throw new Error('A notebook must be selected before creating a memo.')
    }

    const memo = await memoRepository.createMemo(selectedNotebookId.value)
    memos.value = [memo, ...memos.value]
    return memo
  }

  function saveMemo(update: Pick<Memo, 'id' | 'title' | 'content'>) {
    const operation = saveQueue.then(async () => {
      const memo = await memoRepository.saveMemo(update)
      memos.value = [memo, ...memos.value.filter((item) => item.id !== memo.id)].sort(
        (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      )
    })
    saveQueue = operation.then(
      () => undefined,
      () => undefined,
    )
    return operation
  }

  async function deleteMemo(id: string) {
    await saveQueue
    await memoRepository.deleteMemo(id)
    memos.value = memos.value.filter((memo) => memo.id !== id)
  }

  return {
    notebooks,
    memos,
    selectedNotebookId,
    load,
    selectNotebook,
    createNotebook,
    renameNotebook,
    deleteNotebook,
    createMemo,
    saveMemo,
    deleteMemo,
  }
}
