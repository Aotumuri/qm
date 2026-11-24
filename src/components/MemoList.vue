<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '../i18n'
import { memoContentToText } from '../domain/memoContent'
import type { Memo } from '../domain/types'

defineProps<{
  memos: Memo[]
  activeId: string | null
  hasNotebook: boolean
  searchQuery: string
}>()

const emit = defineEmits<{
  select: [id: string]
  create: []
}>()

const { t, locale } = useLocale()
const dateFormatter = computed(
  () => new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' }),
)

function getPreview(memo: Memo) {
  return memoContentToText(memo.content).trim() || t('emptyMemoPreview')
}

function formatUpdatedAt(value: string) {
  return dateFormatter.value.format(new Date(value))
}
</script>

<template>
  <div class="memo-list-wrap">
    <ul v-if="memos.length" class="memo-list">
      <li v-for="memo in memos" :key="memo.id">
        <button
          class="memo-card"
          :class="{ 'is-selected': activeId === memo.id }"
          type="button"
          :aria-current="activeId === memo.id ? 'true' : undefined"
          @click="emit('select', memo.id)"
        >
          <span class="memo-card-title">{{ memo.title.trim() || t('untitledMemo') }}</span>
          <span class="memo-card-preview">{{ getPreview(memo) }}</span>
          <time class="memo-card-date" :datetime="memo.updatedAt">
            {{ formatUpdatedAt(memo.updatedAt) }}
          </time>
        </button>
      </li>
    </ul>

    <div v-else-if="!hasNotebook" class="list-empty-state">
      <span class="empty-state-icon" aria-hidden="true">▤</span>
      <p>{{ t('createNotebookPrompt') }}</p>
    </div>
    <div v-else-if="searchQuery" class="list-empty-state">
      <span class="empty-state-icon" aria-hidden="true">⌕</span>
      <p>{{ t('noSearchResults') }}</p>
    </div>
    <div v-else class="list-empty-state">
      <span class="empty-state-icon" aria-hidden="true">✎</span>
      <p>{{ t('noMemos') }}</p>
      <button class="text-button" type="button" @click="emit('create')">
        {{ t('createFirstMemo') }}
      </button>
    </div>
  </div>
</template>
