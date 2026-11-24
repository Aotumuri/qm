<script setup lang="ts">
import { onBeforeUnmount, ref, toRaw, watch } from 'vue'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { useLocale } from '../i18n'
import { toMemoDocument } from '../domain/memoContent'
import type { Memo } from '../domain/types'
import MemoFormattingToolbar from './MemoFormattingToolbar.vue'

const props = defineProps<{
  memo: Memo | null
}>()

const emit = defineEmits<{
  save: [memo: Pick<Memo, 'id' | 'title' | 'content'>]
  delete: [id: string]
}>()

const { t } = useLocale()
const title = ref(props.memo?.title ?? '')
const content = ref(toMemoDocument(props.memo?.content ?? ''))
let saveTimer: number | undefined

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      blockquote: false,
      bulletList: false,
      code: false,
      codeBlock: false,
      heading: { levels: [1, 2, 3] },
      horizontalRule: false,
      italic: false,
      link: false,
      orderedList: false,
      strike: false,
      underline: false,
    }),
    Placeholder.configure({ placeholder: t('memoPlaceholder') }),
  ],
  content: content.value,
  editorProps: {
    attributes: {
      id: 'memo-content',
      class: 'memo-content-input',
      role: 'textbox',
      'aria-label': t('memoContent'),
      'aria-multiline': 'true',
    },
  },
  onUpdate: ({ editor: currentEditor }) => {
    content.value = currentEditor.getJSON()
  },
})

watch(
  [title, content],
  () => {
    if (!props.memo) return
    window.clearTimeout(saveTimer)
    saveTimer = window.setTimeout(saveNow, 350)
  },
  { flush: 'post' },
)

function saveNow() {
  if (!props.memo) return
  window.clearTimeout(saveTimer)
  saveTimer = undefined
  emit('save', {
    id: props.memo.id,
    title: title.value,
    content: structuredClone(toRaw(content.value)),
  })
}

function flushSave() {
  if (saveTimer !== undefined) saveNow()
}

onBeforeUnmount(flushSave)
window.addEventListener('pagehide', flushSave)
onBeforeUnmount(() => window.removeEventListener('pagehide', flushSave))
</script>

<template>
  <div v-if="memo" class="editor">
    <div class="editor-toolbar">
      <span class="editor-breadcrumb">{{ t('quickMemo') }}</span>
      <button
        class="text-button delete-memo-button"
        type="button"
        @click="emit('delete', memo.id)"
      >
        {{ t('delete') }}
      </button>
    </div>

    <label class="visually-hidden" for="memo-title">{{ t('memoTitle') }}</label>
    <input
      id="memo-title"
      v-model="title"
      class="memo-title-input"
      name="memo-title"
      type="text"
      maxlength="160"
      :placeholder="t('untitledMemo')"
      @blur="flushSave"
    />

    <MemoFormattingToolbar v-if="editor" :editor="editor" />

    <div class="editor-meta">
      <span>{{ t('savedInBrowser') }}</span>
    </div>

    <EditorContent v-if="editor" :editor="editor" @blur="flushSave" />
  </div>

  <div v-else class="editor-empty-state">
    <span class="empty-state-icon" aria-hidden="true">✎</span>
    <h2>{{ t('welcomeTitle') }}</h2>
    <p>{{ t('welcomeMessage') }}</p>
  </div>
</template>
