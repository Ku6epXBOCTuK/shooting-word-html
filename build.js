import { cpSync, copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const dist = join(root, 'dist')

const rootFiles = ['index.html', 'game.html', 'style.css', 'serve.json']
const jsDir = 'js'
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

cpSync(join(root, jsDir), join(dist, jsDir), { recursive: true })

mkdirSync(join(dist, 'img'))
for (const file of imgFiles) {
  copyFileSync(join(root, 'img', file), join(dist, 'img', file))
}

console.log('Собрано в dist:')
for (const file of listFiles(dist)) {
  console.log('  ' + relative(dist, file))
}
