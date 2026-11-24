<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Editor } from '@tiptap/core'
import { useLocale } from '../i18n'

const props = defineProps<{
  editor: Editor
}>()

const { t } = useLocale()
const toolbarElement = ref<HTMLElement | null>(null)
const editorRevision = ref(0)
let usesNativeFocusGroup = false

function updateEditorState() {
  editorRevision.value += 1
}

onMounted(() => {
  props.editor.on('transaction', updateEditorState)
  usesNativeFocusGroup = 'focusGroup' in HTMLElement.prototype

  if (!usesNativeFocusGroup) {
    toolbarElement.value
      ?.querySelectorAll<HTMLButtonElement>('button')
      .forEach((button, index) => {
        button.tabIndex = index === 0 ? 0 : -1
      })
  }
})

onBeforeUnmount(() => {
  props.editor.off('transaction', updateEditorState)
})

function isBoldActive() {
  editorRevision.value
  return props.editor.isActive('bold')
}

function isHeadingActive(level: 1 | 2 | 3) {
  editorRevision.value
  return props.editor.isActive('heading', { level })
}

function updateRovingTabIndex(event: FocusEvent) {
  if (usesNativeFocusGroup || !(event.target instanceof HTMLButtonElement)) return

  const buttons = Array.from(
    toolbarElement.value?.querySelectorAll<HTMLButtonElement>('button') ?? [],
  )
  if (!buttons.includes(event.target)) return

  buttons.forEach((button) => {
    button.tabIndex = button === event.target ? 0 : -1
  })
}

function handleToolbarKeydown(event: KeyboardEvent) {
  if (usesNativeFocusGroup || !toolbarElement.value) return

  const buttons = Array.from(
    toolbarElement.value.querySelectorAll<HTMLButtonElement>('button'),
  )
  const currentIndex = buttons.findIndex((button) => button === document.activeElement)
  if (currentIndex < 0 || buttons.length === 0) return

  let nextIndex: number
  if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = buttons.length - 1
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    const isRtl = window.getComputedStyle(toolbarElement.value).direction === 'rtl'
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const step = isRtl ? -direction : direction
    nextIndex = (currentIndex + step + buttons.length) % buttons.length
  } else {
    return
  }

  event.preventDefault()
  buttons[nextIndex]?.focus()
}
</script>

<template>
  <div
    ref="toolbarElement"
    class="memo-format-toolbar"
    role="toolbar"
    focusgroup="toolbar wrap"
    :aria-label="t('formattingToolbar')"
    aria-controls="memo-content"
    @focusin="updateRovingTabIndex"
    @keydown="handleToolbarKeydown"
  >
    <div class="formatting-button-group" role="group" :aria-label="t('inlineFormatting')">
      <button
        class="formatting-button"
        type="button"
        :aria-label="`B, ${t('bold')}`"
        :title="t('bold')"
        :aria-pressed="isBoldActive()"
        @click="props.editor.chain().focus().toggleBold().run()"
      >
        B
      </button>
    </div>
    <span class="formatting-separator" role="separator" aria-orientation="vertical"></span>
    <div class="formatting-button-group" role="group" :aria-label="t('headingFormatting')">
      <button
        v-for="level in [1, 2, 3] as const"
        :key="level"
        class="formatting-button"
        type="button"
        :aria-label="`H${level}, ${t(`heading${level}`)}`"
        :title="t(`heading${level}`)"
        :aria-pressed="isHeadingActive(level)"
        @click="props.editor.chain().focus().toggleHeading({ level }).run()"
      >
        H{{ level }}
      </button>
    </div>
  </div>
</template>
