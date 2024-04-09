import fs from 'fs'
import path from 'path'
import { formatFile } from './formatFile.js'

export const writeFileSafely = async (
  writeLocation: string,
  content: any,
  { header, format = true }: { header?: string; format?: boolean } = {},
) => {
  fs.mkdirSync(path.dirname(writeLocation), {
    recursive: true,
  })

  if (header) {
    content = header + '\n\n' + content
  }

  fs.writeFileSync(writeLocation, format ? await formatFile(content) : content)
}
