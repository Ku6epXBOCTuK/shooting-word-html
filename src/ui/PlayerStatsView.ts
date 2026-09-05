import type { PlayerStatsSnapshot } from '../game/events'

/**
 * Таблица зрителей: топ-3 убийц и «Мазила». Имена вставляются через textContent,
 * а не innerHTML — ник нельзя доверять как разметку.
 */
export function renderPlayerStats(container: HTMLElement, stats: PlayerStatsSnapshot): void {
  container.replaceChildren()
  if (stats.top.length === 0) return

  const title = document.createElement('div')
  title.className = 'stats-section-title'
  title.textContent = 'УБИЙЦЫ'
  container.appendChild(title)

  stats.top.forEach((entry, index) => {
    const row = document.createElement('div')
    row.className = 'stats-row ' + (index === 0 ? 'stats-top1' : index === 1 ? 'stats-top2' : 'stats-top3')

    const place = document.createElement('span')
    place.className = 'stats-place'
    place.textContent = `#${index + 1}`
    row.appendChild(place)
    row.appendChild(document.createTextNode(' '))

    if (index === 0) {
      const crown = document.createElement('span')
      crown.className = 'stats-crown'
      crown.textContent = '👑'
      row.appendChild(crown)
      row.appendChild(document.createTextNode(' '))
    }

    const name = document.createElement('span')
    name.className = 'stats-name'
    name.textContent = entry.name
    row.appendChild(name)

    const kills = document.createElement('span')
    kills.className = 'stats-kills'
    kills.textContent = ` ${entry.kills}`
    row.appendChild(kills)

    container.appendChild(row)
  })

  if (stats.mazila) {
    const mazila = document.createElement('div')
    mazila.className = 'stats-mazila'

    const label = document.createElement('span')
    label.className = 'mazila-title'
    label.textContent = 'Мазила:'
    mazila.appendChild(label)

    const name = document.createElement('span')
    name.className = 'mazila-name'
    name.textContent = ` ${stats.mazila.name} `
    mazila.appendChild(name)

    const count = document.createElement('span')
    count.className = 'mazila-count'
    count.textContent = `(${stats.mazila.misses})`
    mazila.appendChild(count)

    container.appendChild(mazila)
  }
}
