import { existsSync } from 'fs'
import path from 'path'

export interface FrameworkInfo {
  hasSrc: boolean
  isVite: boolean
  isNext: boolean
  componentDir: string
  libDir: string
}

const NEXT_CONFIG_FILES = [
  'next.config.js',
  'next.config.mjs',
  'next.config.cjs',
  'next.config.ts',
  'next.config.mts',
]

const VITE_CONFIG_FILES = [
  'vite.config.js',
  'vite.config.ts',
  'vite.config.mjs',
  'vite.config.mts',
]

function hasAnyFile(cwd: string, candidates: string[]): boolean {
  return candidates.some((file) => existsSync(path.join(cwd, file)))
}

export function detectFramework(cwd: string): FrameworkInfo {
  const hasSrc = existsSync(path.join(cwd, 'src'))
  const isVite = hasAnyFile(cwd, VITE_CONFIG_FILES)
  const isNext = hasAnyFile(cwd, NEXT_CONFIG_FILES)

  return {
    hasSrc,
    isVite,
    isNext,
    componentDir: hasSrc ? 'src/components' : 'components',
    libDir: hasSrc ? 'src/lib' : 'lib',
  }
}
