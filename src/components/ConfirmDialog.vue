<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
  message: string
  cancelLabel: string
  confirmLabel: string
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

const dialog = ref<HTMLDialogElement | null>(null)

watch(
  () => props.open,
  (open) => {
    if (!dialog.value) return
    if (open && !dialog.value.open) dialog.value.showModal()
    if (!open && dialog.value.open) dialog.value.close()
  },
  { flush: 'post' },
)

function cancel() {
  emit('cancel')
}
</script>

<template>
  <dialog
    ref="dialog"
    class="confirm-dialog"
    aria-labelledby="confirm-title"
    @cancel="cancel"
  >
    <h2 id="confirm-title">{{ title }}</h2>
    <p>{{ message }}</p>
    <div class="dialog-actions">
      <button class="secondary-button" type="button" @click="cancel">
        {{ cancelLabel }}
      </button>
      <button class="danger-button" type="button" @click="emit('confirm')">
        {{ confirmLabel }}
      </button>
    </div>
  </dialog>
</template>
