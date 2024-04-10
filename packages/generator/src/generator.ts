import { createPrismaSchemaBuilder } from '@mrleebo/prisma-ast'
import helper, { DMMF, GeneratorOptions } from '@prisma/generator-helper'
import { version } from '../package.json'
import { GENERATOR_NAME } from './constants.js'
import { generateEnum } from './generators/enum.js'
import { generateModel } from './generators/model.js'
import { generateTable, generateTableUseSchema } from './generators/table.js'

const { generatorHandler } = helper

export type GeneratorConfig = {
  outputModels: string
  outputTables: string
  outputEnums: string
  schemaName: string
}

const defaultConfig: GeneratorConfig = {
  outputModels: 'model/',
  outputTables: 'table/',
  outputEnums: 'enum/',
  schemaName: 'public',
}

generatorHandler({
  onManifest() {
    return {
      version,
      defaultOutput: '../generated',
      prettyName: GENERATOR_NAME,
    }
  },
  onGenerate: async (options: GeneratorOptions) => {
    const config = {
      ...defaultConfig,
      ...(options.generator.config as GeneratorConfig),
    }

    const builder = createPrismaSchemaBuilder(options.datamodel)

    const output = options.generator.output?.value!

    const models = options.dmmf.datamodel.models
    const enums = options.dmmf.datamodel.enums

    await Promise.all([
      ...models.map(async (model) => {
        await generateModel(model, config, builder, output)
        await generateTable(model, config, builder, output)
      }),
      ...enums.map(async (datamodelEnum: DMMF.DatamodelEnum) => {
        await generateEnum(datamodelEnum, config, output)
      }),
      generateTableUseSchema(models, config, output),
    ])
  },
})
