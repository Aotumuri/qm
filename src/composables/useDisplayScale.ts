import { ref, watch } from 'vue'

const STORAGE_KEY = 'qmeo-display-scale'
const MIN_SCALE = 80
const MAX_SCALE = 125
const SCALE_STEP = 5
const DEFAULT_SCALE = 100

function isValidScale(value: number) {
  return (
    Number.isInteger(value) &&
    value >= MIN_SCALE &&
    value <= MAX_SCALE &&
    (value - MIN_SCALE) % SCALE_STEP === 0
  )
}

function readStoredScale() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return { value: DEFAULT_SCALE, persistent: true }

    const value = Number(stored)
    return {
      value: isValidScale(value) ? value : DEFAULT_SCALE,
      persistent: true,
    }
  } catch (error) {
    console.error('QMeo could not read the display size preference.', error)
    return { value: DEFAULT_SCALE, persistent: false }
  }
}

export function useDisplayScale() {
  const stored = readStoredScale()
  const scale = ref(stored.value)
  const persistent = ref(stored.persistent)

  function applyScale(value: number) {
    document.documentElement.style.setProperty('--qmeo-ui-scale', String(value / 100))
  }

  applyScale(scale.value)

  watch(scale, (value) => {
    applyScale(value)
    if (!persistent.value) return

    try {
      window.localStorage.setItem(STORAGE_KEY, String(value))
    } catch (error) {
      console.error('QMeo could not save the display size preference.', error)
      persistent.value = false
    }
  })

  function setScale(value: number) {
    if (!isValidScale(value)) throw new RangeError('Display size is outside the supported range.')
    scale.value = value
  }

  function resetScale() {
    setScale(DEFAULT_SCALE)
  }

  return { scale, persistent, setScale, resetScale }
}
