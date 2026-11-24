<script setup lang="ts">
import { useLocale } from '../i18n'

defineProps<{
  scale: number
  persistent: boolean
}>()

const emit = defineEmits<{
  change: [value: number]
  reset: []
}>()

const { t } = useLocale()

function updateScale(event: Event) {
  const input = event.target
  if (input instanceof HTMLInputElement) emit('change', Number(input.value))
}
</script>

<template>
  <details class="display-settings">
    <summary class="display-settings-trigger">
      <span class="settings-glyph">Aa</span>
      <span class="display-settings-label">{{ t('displaySettings') }}</span>
    </summary>
    <div class="display-settings-popover">
      <label for="display-scale">{{ t('interfaceSize') }}</label>
      <div class="scale-control">
        <span class="scale-endpoint" aria-hidden="true">A</span>
        <input
          id="display-scale"
          name="display-scale"
          type="range"
          min="80"
          max="125"
          step="5"
          :value="scale"
          :aria-valuetext="t('scalePercent', { value: scale })"
          aria-describedby="display-scale-help"
          @input="updateScale"
        />
        <output for="display-scale">{{ scale }}%</output>
      </div>
      <p id="display-scale-help" class="scale-help">{{ t('scaleHelp') }}</p>
      <button
        class="text-button reset-scale-button"
        type="button"
        :disabled="scale === 100"
        @click="emit('reset')"
      >
        {{ t('resetSize') }}
      </button>
      <p v-if="!persistent" class="scale-warning" role="status">
        {{ t('scaleNotSaved') }}
      </p>
    </div>
  </details>
</template>
