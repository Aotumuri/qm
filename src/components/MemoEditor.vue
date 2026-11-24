<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useLocale } from '../i18n'
import type { Memo } from '../domain/types'

const props = defineProps<{
  memo: Memo | null
}>()

const emit = defineEmits<{
  save: [memo: Pick<Memo, 'id' | 'title' | 'content'>]
  delete: [id: string]
}>()

const { t } = useLocale()
const title = ref(props.memo?.title ?? '')
const content = ref(props.memo?.content ?? '')
let saveTimer: number | undefined

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
  emit('save', { id: props.memo.id, title: title.value, content: content.value })
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

    <div class="editor-meta">
      <span>{{ t('plainText') }}</span>
      <span>{{ t('savedInBrowser') }}</span>
    </div>

    <label class="visually-hidden" for="memo-content">{{ t('memoContent') }}</label>
    <textarea
      id="memo-content"
      v-model="content"
      class="memo-content-input"
      name="memo-content"
      :placeholder="t('memoPlaceholder')"
      spellcheck
      @blur="flushSave"
    ></textarea>
  </div>

  <div v-else class="editor-empty-state">
    <span class="empty-state-icon" aria-hidden="true">✎</span>
    <h2>{{ t('welcomeTitle') }}</h2>
    <p>{{ t('welcomeMessage') }}</p>
  </div>
</template>
