import { join } from 'path'
import { writeFileSync } from 'fs'
import { ensureDir } from 'fs-extra'
import globals from './globals'

export type ConfigType = keyof typeof globals.appConfigFiles

export async function persistConfig(data: Record<string, unknown>, type: ConfigType): Promise<void> {
  const frontendDirectory = join(process.cwd(), './frontend/src')

  // Ensure directory exists
  await ensureDir(frontendDirectory)

  // Persist in app stack
  writeFileSync(
    join(frontendDirectory, globals.appConfigFiles[type]), 
    JSON.stringify(data, null, 2)
  )
}
