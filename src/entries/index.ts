function main(
  input: HTMLInputElement,
  copyBtn: HTMLElement,
  openBtn: HTMLElement,
  linkEl: HTMLElement,
  singlePlayEl: HTMLInputElement,
): void {
  function buildUrl(): string {
    const name = input.value.trim().toLowerCase() || 'Ku6ep_XBOCTuK'
    const single = singlePlayEl.checked ? '1' : '0'
    return `${location.origin}${location.pathname.replace(/\/[^/]*$/, '/')}game?channel=${encodeURIComponent(name)}&singlePlay=${single}`
  }

  function updateLink(): void {
    linkEl.textContent = buildUrl()
    linkEl.className = ''
  }

  function copyLink(): void {
    navigator.clipboard
      .writeText(buildUrl())
      .then(() => {
        linkEl.textContent = 'СКОПИРОВАНО!'
        linkEl.className = 'copied'
        setTimeout(updateLink, 1500)
      })
      .catch((error) => console.error('Shooting Word: не удалось скопировать ссылку', error))
  }

  function openLink(): void {
    window.open(buildUrl(), '_blank')
  }

  input.addEventListener('input', updateLink)
  singlePlayEl.addEventListener('change', updateLink)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') copyLink()
  })

  copyBtn.addEventListener('click', copyLink)
  openBtn.addEventListener('click', openLink)

  updateLink()

  document.querySelector('.hint-toggle')?.addEventListener('click', () => {
    document.querySelector('.settings-hints')?.classList.toggle('hidden')
  })
}

const input = document.getElementById('channel-input') as HTMLInputElement | null
const copyBtn = document.getElementById('copy-btn')
const openBtn = document.getElementById('open-btn')
const linkEl = document.getElementById('game-link')
const singlePlay = document.getElementById('opt-single-play') as HTMLInputElement | null

if (!input || !copyBtn || !openBtn || !linkEl || !singlePlay) {
  throw new Error('Shooting Word: страница настроек повреждена (не найдены элементы формы)')
}

main(input, copyBtn, openBtn, linkEl, singlePlay)
