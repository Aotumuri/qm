<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import MemoEditor from './components/MemoEditor.vue'
import MemoList from './components/MemoList.vue'
import NotebookSidebar from './components/NotebookSidebar.vue'
import { i18n, type Locale, useLocale } from './i18n'
import { useMemoData } from './composables/useMemoData'
import type { Memo, Notebook } from './domain/types'

const { t } = useLocale()
const {
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
} = useMemoData()

const activeMemoId = ref<string | null>(null)
const searchQuery = ref('')
const errorKey = ref<string | null>(null)
const saveState = ref<'idle' | 'saving' | 'saved'>('idle')
const pendingDeletion = ref<{ kind: 'notebook' | 'memo'; id: string } | null>(null)
let saveSequence = 0

const activeMemo = computed(() =>
  memos.value.find((memo) => memo.id === activeMemoId.value) ?? null,
)
const filteredMemos = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase()
  if (!query) return memos.value
  return memos.value.filter((memo) =>
    `${memo.title}\n${memo.content}`.toLocaleLowerCase().includes(query),
  )
})

onMounted(async () => {
  await runAction(async () => {
    await load()
    activeMemoId.value = memos.value[0]?.id ?? null
  })
})

async function runAction(action: () => Promise<void>) {
  errorKey.value = null
  try {
    await action()
  } catch (error) {
    console.error('QMeo could not complete a local storage operation.', error)
    errorKey.value = 'storageError'
  }
}

async function handleCreateNotebook(name: string) {
  await runAction(async () => {
    await createNotebook(name)
    activeMemoId.value = null
    searchQuery.value = ''
  })
}

async function handleRenameNotebook(notebook: Notebook, name: string) {
  await runAction(async () => {
    await renameNotebook(notebook.id, name)
  })
}

async function handleSelectNotebook(id: string) {
  await runAction(async () => {
    await selectNotebook(id)
    activeMemoId.value = memos.value[0]?.id ?? null
    searchQuery.value = ''
    saveState.value = 'idle'
  })
}

async function handleCreateMemo() {
  await runAction(async () => {
    const memo = await createMemo()
    activeMemoId.value = memo.id
    searchQuery.value = ''
    saveState.value = 'idle'
  })
}

async function handleSaveMemo(payload: Pick<Memo, 'id' | 'title' | 'content'>) {
  const sequence = ++saveSequence
  saveState.value = 'saving'
  errorKey.value = null
  try {
    await saveMemo(payload)
    if (sequence === saveSequence) saveState.value = 'saved'
  } catch (error) {
    console.error('QMeo could not save a memo locally.', error)
    errorKey.value = 'storageError'
    saveState.value = 'idle'
  }
}

async function confirmDeletion() {
  const deletion = pendingDeletion.value
  if (!deletion) return

  await runAction(async () => {
    if (deletion.kind === 'notebook') {
      const deletedSelection = selectedNotebookId.value === deletion.id
      await deleteNotebook(deletion.id)
      if (deletedSelection) {
        activeMemoId.value = memos.value[0]?.id ?? null
        searchQuery.value = ''
      }
    } else {
      await deleteMemo(deletion.id)
      activeMemoId.value = memos.value[0]?.id ?? null
    }
    pendingDeletion.value = null
  })
}

function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
  document.title = i18n.global.t('pageTitle')
}

async function retryLoading() {
  await runAction(async () => {
    await load()
    activeMemoId.value = memos.value[0]?.id ?? null
  })
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="./" :aria-label="t('appHome')">
        <span class="brand-mark" aria-hidden="true">Q</span>
        <span class="brand-name">QMeo</span>
      </a>
      <p class="topbar-tagline">{{ t('tagline') }}</p>
      <div class="topbar-actions">
        <span class="privacy-badge">
          <span class="privacy-dot" aria-hidden="true"></span>
          {{ t('localOnly') }}
        </span>
        <div class="language-switch" role="group" :aria-label="t('language')">
          <button
            type="button"
            :aria-pressed="i18n.global.locale.value === 'en'"
            @click="setLocale('en')"
          >
            EN
          </button>
          <button
            type="button"
            :aria-pressed="i18n.global.locale.value === 'ja'"
            @click="setLocale('ja')"
          >
            日本語
          </button>
        </div>
      </div>
    </header>

    <main class="workspace">
      <NotebookSidebar
        :notebooks="notebooks"
        :selected-id="selectedNotebookId"
        @select="handleSelectNotebook"
        @create="handleCreateNotebook"
        @rename="handleRenameNotebook"
        @delete="(id) => (pendingDeletion = { kind: 'notebook', id })"
      />

      <section class="memo-panel" :aria-label="t('memos')">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">{{ t('yourWorkspace') }}</p>
            <h1>{{ t('memos') }}</h1>
          </div>
          <button
            class="icon-button add-memo-button"
            type="button"
            :disabled="!selectedNotebookId"
            :aria-label="t('newMemo')"
            @click="handleCreateMemo"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>

        <search class="search-field" :aria-label="t('searchMemos')">
          <span class="visually-hidden">{{ t('searchMemos') }}</span>
          <span class="search-icon" aria-hidden="true">⌕</span>
          <input
            v-model="searchQuery"
            type="search"
            name="memo-search"
            :placeholder="t('searchMemos')"
            :disabled="!selectedNotebookId"
          />
          <kbd v-if="searchQuery" class="clear-search" aria-hidden="true">×</kbd>
        </search>

        <MemoList
          :memos="filteredMemos"
          :active-id="activeMemoId"
          :has-notebook="Boolean(selectedNotebookId)"
          :search-query="searchQuery"
          @select="activeMemoId = $event"
          @create="handleCreateMemo"
        />
      </section>

      <section class="editor-panel" :aria-label="t('editor')">
        <div v-if="errorKey" class="error-banner" role="alert">
          <span>{{ t(errorKey) }}</span>
          <button type="button" class="text-button" @click="retryLoading">
            {{ t('retry') }}
          </button>
        </div>
        <MemoEditor
          :key="activeMemo?.id ?? 'empty'"
          :memo="activeMemo"
          @save="handleSaveMemo"
          @delete="(id) => (pendingDeletion = { kind: 'memo', id })"
        />
      </section>
    </main>

    <footer class="app-footer">
      <span>{{ t('localStorageNotice') }}</span>
      <span class="save-indicator" aria-live="polite">
        <span class="save-dot" :class="`is-${saveState}`" aria-hidden="true"></span>
        {{ t(`save.${saveState}`) }}
      </span>
    </footer>

    <ConfirmDialog
      :open="Boolean(pendingDeletion)"
      :title="
        pendingDeletion?.kind === 'notebook'
          ? t('deleteNotebookTitle')
          : t('deleteMemoTitle')
      "
      :message="
        pendingDeletion?.kind === 'notebook'
          ? t('deleteNotebookMessage')
          : t('deleteMemoMessage')
      "
      :cancel-label="t('cancel')"
      :confirm-label="t('delete')"
      @cancel="pendingDeletion = null"
      @confirm="confirmDeletion"
    />
  </div>
</template>
