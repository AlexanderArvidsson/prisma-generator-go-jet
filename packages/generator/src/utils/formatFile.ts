import { spawnSync } from 'child_process'

export const formatFile = (content: string): Promise<string> => {
  return new Promise((res) => {
    const result = spawnSync('gofmt', [], {
      input: content,
      encoding: 'utf-8',
    })

    res(result.stdout)
  })
}
