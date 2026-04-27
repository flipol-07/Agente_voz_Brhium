import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createSeedState } from '@/features/brhium-platform/seed'
import type { PlatformStore } from '@/features/brhium-platform/types'

const DATA_DIR = path.join(process.cwd(), 'data')
const STORE_FILE = path.join(DATA_DIR, 'brhium-platform.json')

let writeQueue = Promise.resolve()

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true })

  try {
    await access(STORE_FILE)
  } catch {
    const seed = createSeedState()
    await writeFile(STORE_FILE, JSON.stringify(seed, null, 2), 'utf8')
  }
}

export async function readStore(): Promise<PlatformStore> {
  await ensureStore()
  const raw = await readFile(STORE_FILE, 'utf8')
  return JSON.parse(raw) as PlatformStore
}

export async function mutateStore<T>(mutator: (draft: PlatformStore) => Promise<T> | T) {
  let result!: T

  await (writeQueue = writeQueue.then(async () => {
    const draft = structuredClone(await readStore())
    result = await mutator(draft)
    draft.updatedAt = new Date().toISOString()
    await writeFile(STORE_FILE, JSON.stringify(draft, null, 2), 'utf8')
  }))

  return result
}

export async function saveCallEventToDatabase(event: unknown) {
  // Placeholder logic for saving call events
  console.log('Saving event to database:', event)
  // Implement actual database logic here
}
