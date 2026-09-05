export function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (!element) throw new Error(`Shooting Word: не найден элемент #${id}`)
  return element as T
}
