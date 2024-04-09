import { GeneratorConfig } from '../../src/generator.js'

const defaultConfig: GeneratorConfig = {
  outputModels: 'model/',
  outputTables: 'table/',
  outputEnums: 'enum/',
  schemaName: 'public',
}

export function getSampleConfig(config: GeneratorConfig): GeneratorConfig {
  return {
    ...defaultConfig,
    ...(config as GeneratorConfig),
  }
}
