<script setup lang="ts">
import { ref } from 'vue'
import { useLocale } from '../i18n'
import type { Notebook } from '../domain/types'

defineProps<{
  notebooks: Notebook[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
  create: [name: string]
  rename: [notebook: Notebook, name: string]
  delete: [id: string]
}>()

const { t } = useLocale()
const notebookNameInput = ref<HTMLInputElement | null>(null)
const newName = ref('')
const editingId = ref<string | null>(null)
const editingName = ref('')

function createNotebook() {
  if (!newName.value.trim()) {
    notebookNameInput.value?.setCustomValidity(t('notebookNameRequired'))
    notebookNameInput.value?.reportValidity()
    return
  }
  notebookNameInput.value?.setCustomValidity('')
  emit('create', newName.value)
  newName.value = ''
}

function beginRename(notebook: Notebook) {
  editingId.value = notebook.id
  editingName.value = notebook.name
}

function finishRename(notebook: Notebook) {
  emit('rename', notebook, editingName.value)
  editingId.value = null
}
</script>

<template>
  <aside class="notebook-panel" :aria-label="t('notebooks')">
    <div class="panel-heading notebook-heading">
      <div>
        <p class="eyebrow">{{ t('organize') }}</p>
        <h2>{{ t('notebooks') }}</h2>
      </div>
      <span class="count-pill">{{ notebooks.length }}</span>
    </div>

    <form class="new-notebook-form" @submit.prevent="createNotebook">
      <label class="visually-hidden" for="new-notebook-name">{{ t('notebookName') }}</label>
      <input
        ref="notebookNameInput"
        id="new-notebook-name"
        v-model="newName"
        name="notebook-name"
        type="text"
        :placeholder="t('notebookName')"
        required
        maxlength="80"
        @input="notebookNameInput?.setCustomValidity('')"
      />
      <button class="icon-button create-notebook-button" type="submit" :aria-label="t('createNotebook')">
        <span aria-hidden="true">+</span>
      </button>
    </form>

    <ul v-if="notebooks.length" class="notebook-list">
      <li v-for="notebook in notebooks" :key="notebook.id" class="notebook-row">
        <form
          v-if="editingId === notebook.id"
          class="rename-form"
          @submit.prevent="finishRename(notebook)"
        >
          <label class="visually-hidden" :for="`rename-${notebook.id}`">
            {{ t('renameNotebookNamed', { name: notebook.name }) }}
          </label>
          <input
            :id="`rename-${notebook.id}`"
            v-model="editingName"
            type="text"
            maxlength="80"
            required
            @keydown.esc="editingId = null"
          />
          <button class="icon-button small-icon-button" type="submit" :aria-label="t('saveChanges')">
            <span aria-hidden="true">✓</span>
          </button>
        </form>
        <template v-else>
          <button
            class="notebook-select"
            :class="{ 'is-selected': selectedId === notebook.id }"
            type="button"
            :aria-current="selectedId === notebook.id ? 'page' : undefined"
            @click="emit('select', notebook.id)"
          >
            <span class="notebook-icon" aria-hidden="true">▤</span>
            <span class="notebook-name">{{ notebook.name }}</span>
          </button>
          <div class="notebook-actions">
            <button
              class="icon-button small-icon-button"
              type="button"
              :aria-label="t('renameNotebookNamed', { name: notebook.name })"
              @click="beginRename(notebook)"
            >
              <span aria-hidden="true">↗</span>
            </button>
            <button
              class="icon-button small-icon-button delete-action"
              type="button"
              :aria-label="t('deleteNotebookNamed', { name: notebook.name })"
              @click="emit('delete', notebook.id)"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </template>
      </li>
    </ul>

    <p v-else class="empty-notebooks">{{ t('noNotebooks') }}</p>

    <p class="privacy-note">
      <span aria-hidden="true">◉</span>
      {{ t('localStorageNotice') }}
    </p>
  </aside>
</template>
