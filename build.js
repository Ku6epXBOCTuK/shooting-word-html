import { build, context } from 'esbuild'
import { cpSync, copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const dist = join(root, 'dist')
const watch = process.argv.includes('--watch')

const rootFiles = ['index.html', 'game.html', 'style.css', 'serve.json']
const imgFiles = ['sprite.svg']

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

rmSync(dist, { recursive: true, force: true })
mkdirSync(dist)

for (const file of rootFiles) {
  copyFileSync(join(root, file), join(dist, file))
}

mkdirSync(join(dist, 'img'))
for (const file of imgFiles) {
  copyFileSync(join(root, 'img', file), join(dist, 'img', file))
}

const options = {
  entryPoints: {
    game: join(root, 'src/entries/game.ts'),
    index: join(root, 'src/entries/index.ts'),
  },
  outdir: dist,
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'iife',
  target: 'es2020',
  logLevel: 'info',
}

if (watch) {
  const contexts = await Promise.all([context(options)])
  await Promise.all(contexts.map((c) => c.watch()))
  console.log('Слежу за изменениями src/...')
} else {
  await build(options)
  console.log('Собрано в dist:')
  for (const file of listFiles(dist)) {
    console.log('  ' + relative(dist, file))
  }
}
