<script setup lang="ts">
import { useLocale } from '../i18n'

defineProps<{
  scale: number
  persistent: boolean
  lineSpacing: number
  lineSpacingPersistent: boolean
}>()

const emit = defineEmits<{
  change: [value: number]
  reset: []
  lineSpacingChange: [value: number]
  lineSpacingReset: []
}>()

const { t } = useLocale()

function updateScale(event: Event) {
  const input = event.target
  if (input instanceof HTMLInputElement) emit('change', Number(input.value))
}

function updateLineSpacing(event: Event) {
  const input = event.target
  if (input instanceof HTMLInputElement) emit('lineSpacingChange', Number(input.value))
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
      <hr class="settings-divider" />
      <label for="memo-line-spacing">{{ t('memoLineSpacing') }}</label>
      <div class="scale-control">
        <span class="scale-endpoint">1.2</span>
        <input
          id="memo-line-spacing"
          name="memo-line-spacing"
          type="range"
          min="120"
          max="200"
          step="10"
          :value="lineSpacing"
          :aria-valuetext="t('lineSpacingValue', { value: (lineSpacing / 100).toFixed(1) })"
          aria-describedby="memo-line-spacing-help"
          @input="updateLineSpacing"
        />
        <span class="scale-endpoint">2.0</span>
        <output for="memo-line-spacing">
          {{ t('lineSpacingValue', { value: (lineSpacing / 100).toFixed(1) }) }}
        </output>
      </div>
      <p id="memo-line-spacing-help" class="scale-help">
        {{ t('lineSpacingHelp') }}
      </p>
      <button
        class="text-button reset-scale-button"
        type="button"
        :disabled="lineSpacing === 150"
        @click="emit('lineSpacingReset')"
      >
        {{ t('resetLineSpacing') }}
      </button>
      <p v-if="!persistent || !lineSpacingPersistent" class="scale-warning" role="status">
        {{ t('scaleNotSaved') }}
      </p>
    </div>
  </details>
</template>
