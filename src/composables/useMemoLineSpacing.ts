import { ref, watch } from 'vue'

const STORAGE_KEY = 'qmeo-memo-line-spacing'
const MIN_LINE_SPACING = 120
const MAX_LINE_SPACING = 200
const LINE_SPACING_STEP = 10
const DEFAULT_LINE_SPACING = 150

function isValidLineSpacing(value: number) {
  return (
    Number.isInteger(value) &&
    value >= MIN_LINE_SPACING &&
    value <= MAX_LINE_SPACING &&
    (value - MIN_LINE_SPACING) % LINE_SPACING_STEP === 0
  )
}

function readStoredLineSpacing() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return { value: DEFAULT_LINE_SPACING, persistent: true }

    const value = Number(stored)
    return {
      value: isValidLineSpacing(value) ? value : DEFAULT_LINE_SPACING,
      persistent: true,
    }
  } catch (error) {
    console.error('QMeo could not read the memo line spacing preference.', error)
    return { value: DEFAULT_LINE_SPACING, persistent: false }
  }
}

export function useMemoLineSpacing() {
  const stored = readStoredLineSpacing()
  const lineSpacing = ref(stored.value)
  const persistent = ref(stored.persistent)

  function applyLineSpacing(value: number) {
    document.documentElement.style.setProperty(
      '--qmeo-memo-line-height',
      String(value / 100),
    )
  }

  applyLineSpacing(lineSpacing.value)

  watch(lineSpacing, (value) => {
    applyLineSpacing(value)
    if (!persistent.value) return

    try {
      window.localStorage.setItem(STORAGE_KEY, String(value))
    } catch (error) {
      console.error('QMeo could not save the memo line spacing preference.', error)
      persistent.value = false
    }
  })

  function setLineSpacing(value: number) {
    if (!isValidLineSpacing(value)) {
      throw new RangeError('Memo line spacing is outside the supported range.')
    }
    lineSpacing.value = value
  }

  function resetLineSpacing() {
    setLineSpacing(DEFAULT_LINE_SPACING)
  }

  return { lineSpacing, persistent, setLineSpacing, resetLineSpacing }
}
