// npm run dev → builds, serves on http://localhost:4321, and rebuilds when files in src/ or public/ change.
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
try {
  execFileSync(process.execPath, ['--import', 'tsx', join(root, 'scripts/build.tsx')], { stdio: 'inherit', cwd: root })
} catch {
  console.error('Build failed, fix the error above and save again.')
}
const { serve } = await import('./preview.mjs')
serve()
