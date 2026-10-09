// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LOCALE_CODES, messages, toLocale } from '../app/locales'

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === 'locales' ? [] : sourceFiles(path)
    return /\.(vue|ts)$/.test(name) ? [path] : []
  })
}

describe('message catalog', () => {
  it('has a non-empty translation for every locale', () => {
    for (const [key, entry] of Object.entries(messages)) {
      for (const code of LOCALE_CODES) {
        expect(entry[code]?.trim(), `${key} [${code}]`).toBeTruthy()
      }
    }
  })

  it('uses the same {placeholders} in every locale', () => {
    for (const [key, entry] of Object.entries(messages)) {
      for (const code of LOCALE_CODES) {
        expect(placeholders(entry[code]), `${key} [${code}]`).toBe(placeholders(entry.en))
      }
    }
  })

  it('defines every key referenced as t(\'literal\') in app/', () => {
    const used = new Set<string>()
    for (const file of sourceFiles(join(__dirname, '../app'))) {
      for (const m of readFileSync(file, 'utf8').matchAll(/\bt\(\s*'([\w.]+)'/g)) used.add(m[1]!)
    }
    const missing = [...used].filter(key => !messages[key])
    expect(missing).toEqual([])
  })
})

describe('toLocale', () => {
  it('accepts supported codes and maps legacy "la" to "lo"', () => {
    expect(toLocale('th')).toBe('th')
    expect(toLocale('la')).toBe('lo')
    expect(toLocale('xx')).toBeNull()
    expect(toLocale(null)).toBeNull()
  })
})
