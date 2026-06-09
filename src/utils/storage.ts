const STORAGE_PREFIX = 'cat-cafe-'
const SAVE_VERSION = 1

export interface SaveData<T> {
  version: number
  savedAt: number
  data: T
}

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    const payload: SaveData<T> = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      data,
    }
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(payload))
  } catch (e) {
    console.error('Save failed:', e)
  }
}

export const loadFromStorage = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null
    const payload = JSON.parse(raw) as SaveData<T>
    if (payload.version !== SAVE_VERSION) {
      console.warn('Save version mismatch, migrating...')
      return migrateData(payload)
    }
    return payload.data
  } catch (e) {
    console.error('Load failed:', e)
    return null
  }
}

const migrateData = <T>(payload: SaveData<T>): T | null => {
  return payload.data
}

export const deleteFromStorage = (key: string): void => {
  localStorage.removeItem(STORAGE_PREFIX + key)
}

export const getAllSlotKeys = (): string[] => {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(STORAGE_PREFIX + 'slot-')) {
      keys.push(key)
    }
  }
  return keys
}
