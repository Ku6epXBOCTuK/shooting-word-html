export type WordRoll = { kind: 'simple'; word: string } | { kind: 'heavy'; words: string[] }

/** Словарь IT-слов: простые враги — одно слово, тяжёлые — пара слов. */
export class WordDictionary {
  constructor(
    private readonly simpleWords: readonly string[],
    private readonly heavyWords: readonly (readonly string[])[],
  ) {}

  static fromLists(simple: string[], heavy: string[][]): WordDictionary {
    return new WordDictionary(simple, heavy)
  }

  simple(): string {
    return pick(this.simpleWords)
  }

  heavyPair(): string[] {
    return [...pick(this.heavyWords)]
  }

  /** Слово или пара слов для врага выбранного типа. */
  roll(kind: 'simple' | 'heavy'): WordRoll {
    return kind === 'simple' ? { kind: 'simple', word: this.simple() } : { kind: 'heavy', words: this.heavyPair() }
  }
}

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

const SIMPLE_WORDS: string[] = [
  'hack', 'code', 'data', 'node', 'link', 'byte', 'bit', 'net', 'web', 'sys',
  'run', 'log', 'bug', 'fix', 'api', 'cpu', 'ram', 'ssd', 'gpu', 'dns',
  'ip', 'url', 'tag', 'css', 'js', 'sql', 'git', 'cli', 'env', 'dev',
  'app', 'bot', 'ai', 'io', 'os', 'ui', 'ux', 'vm', 'vpn', 'lan',
  'wan', 'ftp', 'ssh', 'http', 'json', 'xml', 'yaml', 'md', 'py', 'go',
  'rust', 'java', 'php', 'cpp', 'ts', 'rb', 'kt', 'swift', 'dart', 'lua',
  'perl', 'bash', 'zsh', 'fish', 'vim', 'nano', 'emacs', 'sed', 'awk', 'grep',
  'find', 'cat', 'ls', 'cd', 'mv', 'cp', 'rm', 'mkdir', 'chmod', 'chown',
  'ping', 'curl', 'wget', 'nc', 'nmap', 'tcp', 'udp', 'ip4', 'ip6', 'mac',
  'hex', 'bin', 'dec', 'oct', 'xor', 'and', 'or', 'not', 'shl', 'shr',
  'key', 'lock', 'door', 'gate', 'wall', 'fire', 'ice', 'wind', 'storm', 'rain',
  'sun', 'moon', 'star', 'void', 'null', 'zero', 'one', 'two', 'ten', 'max',
]

const HEAVY_WORDS: string[][] = [
  ['root', 'access'], ['data', 'breach'], ['fire', 'wall'], ['deep', 'web'], ['dark', 'net'],
  ['cloud', 'base'], ['neural', 'net'], ['quantum', 'bit'], ['block', 'chain'], ['smart', 'contract'],
  ['machine', 'learn'], ['deep', 'fake'], ['zero', 'day'], ['back', 'door'], ['side', 'channel'],
  ['man', 'middle'], ['denial', 'service'], ['brute', 'force'], ['social', 'engineer'], ['phishing', 'attack'],
  ['sql', 'inject'], ['cross', 'site'], ['buffer', 'over'], ['heap', 'spray'], ['stack', 'pivot'],
  ['return', 'orient'], ['format', 'string'], ['race', 'condition'], ['time', 'check'], ['use', 'after'],
  ['double', 'free'], ['null', 'pointer'], ['integer', 'over'], ['type', 'confus'], ['memory', 'leak'],
  ['dead', 'lock'], ['live', 'lock'], ['starvation', 'mode'], ['priority', 'invert'], ['cache', 'miss'],
  ['branch', 'mispred'], ['speculative', 'exec'], ['meltdown', 'flaw'], ['spectre', 'bug'], ['row', 'hammer'],
  ['cold', 'boot'], ['evil', 'maid'], ['supply', 'chain'], ['hardware', 'troj'], ['firmware', 'root'],
  ['bios', 'implant'], ['uefi', 'shell'], ['smm', 'exploit'], ['ring', 'zero'], ['kernel', 'panic'],
  ['blue', 'screen'], ['kernel', 'oops'], ['seg', 'fault'], ['bus', 'error'], ['illegal', 'op'],
  ['trap', 'divide'], ['trap', 'debug'], ['trap', 'nmi'], ['trap', 'break'], ['trap', 'overflow'],
  ['trap', 'bound'], ['trap', 'invalid'], ['trap', 'device'], ['trap', 'double'], ['trap', 'copro'],
  ['trap', 'tss'], ['trap', 'segment'], ['trap', 'stack'], ['trap', 'general'], ['trap', 'page'],
  ['trap', 'x87'], ['trap', 'align'], ['trap', 'machine'], ['trap', 'simd'], ['trap', 'virtual'],
  ['security', 'check'], ['stack', 'cookie'], ['aslr', 'bypass'], ['dep', 'bypass'], ['cfg', 'bypass'],
  ['cet', 'bypass'], ['shadow', 'stack'], ['control', 'flow'], ['indirect', 'call'], ['jump', 'oriented'],
  ['call', 'oriented'], ['data', 'oriented'], ['counterfeit', 'obj'], ['heap', 'feng'], ['house', 'spirit'],
  ['house', 'lore'], ['house', 'force'], ['fast', 'bin'], ['tcache', 'poison'], ['unsorted', 'bin'],
  ['large', 'bin'], ['small', 'bin'], ['mmap', 'chunk'], ['top', 'chunk'], ['wilderness', 'area'],
  ['arena', 'corrupt'], ['thread', 'cache'], ['per', 'thread'], ['main', 'arena'],
]

export const defaultWordDictionary = WordDictionary.fromLists(SIMPLE_WORDS, HEAVY_WORDS)
