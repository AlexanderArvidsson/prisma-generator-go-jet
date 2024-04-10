import path from 'path'
import { rimraf } from 'rimraf'

export async function cleanGoFilesSafe(output: string, directory: string) {
  const dirPath = path.join(output, directory, '*.go')

  const relative = path.relative(output, dirPath)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(
      'Tried to clean files in directory outside of output directory',
    )
  }

  return rimraf(dirPath, { glob: true })
}
