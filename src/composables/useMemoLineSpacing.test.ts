import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useMemoLineSpacing } from './useMemoLineSpacing'

const values = new Map<string, string>()
const localStorage = {
  getItem: vi.fn((key: string) => values.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => values.set(key, value)),
}
const setProperty = vi.fn()

afterEach(() => {
  values.clear()
  localStorage.getItem.mockClear()
  localStorage.setItem.mockClear()
  setProperty.mockClear()
  vi.unstubAllGlobals()
})

function stubBrowserPreferences() {
  vi.stubGlobal('window', { localStorage })
  vi.stubGlobal('document', {
    documentElement: { style: { setProperty } },
  })
}

describe('useMemoLineSpacing', () => {
  it('applies the default, persists changes, and restores them on next use', async () => {
    stubBrowserPreferences()
    const preference = useMemoLineSpacing()

    expect(preference.lineSpacing.value).toBe(150)
    expect(setProperty).toHaveBeenLastCalledWith('--qmeo-memo-line-height', '1.5')

    preference.setLineSpacing(170)
    await nextTick()

    expect(localStorage.setItem).toHaveBeenCalledWith('qmeo-memo-line-spacing', '170')
    expect(setProperty).toHaveBeenLastCalledWith('--qmeo-memo-line-height', '1.7')

    values.set('qmeo-memo-line-spacing', '180')
    const restored = useMemoLineSpacing()

    expect(restored.lineSpacing.value).toBe(180)
    expect(setProperty).toHaveBeenLastCalledWith('--qmeo-memo-line-height', '1.8')
  })

  it('rejects values outside the supported range or step', () => {
    stubBrowserPreferences()
    const preference = useMemoLineSpacing()

    expect(() => preference.setLineSpacing(110)).toThrow(
      'Memo line spacing is outside the supported range.',
    )
    expect(() => preference.setLineSpacing(155)).toThrow(
      'Memo line spacing is outside the supported range.',
    )
  })
})
