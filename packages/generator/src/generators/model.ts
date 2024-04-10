import { DMMF } from '@prisma/generator-helper'
import path from 'path'
import { OUTPUT_HEADER } from '../constants.js'
import { GeneratorConfig } from '../generator.js'
import { formatField, getModelName } from '../helpers/format.js'
import { SchemaBuilder } from '../helpers/schema.js'
import { writeFileSafely } from '../utils/writeFileSafely.js'

export type ModelField = {
  name: string
  type: string
  tags: string[]
}

export type RenderModelTemplateOptions = {
  packageName: string
  modelName: string
  imports: string[]
  fields: ModelField[]
}

export function renderModelTemplate({
  packageName,
  modelName,
  imports,
  fields,
}: RenderModelTemplateOptions) {
  let importsStr = ''

  if (imports.length > 0) {
    importsStr = `import (
  ${imports.map((i) => `"${i}"`).join('\n  ')}
)`
  }

  return `package ${packageName}

${importsStr}

type ${modelName} struct {
  ${fields
    .map(
      ({ name, type, tags }) =>
        `${name} ${type}` + (tags.length > 0 ? ` \`${tags.join(' ')}\`` : ''),
    )
    .join('\n  ')}
}`
}

export function renderModel(
  model: DMMF.Model,
  builder: SchemaBuilder,
  packageName: string,
) {
  const modelName = getModelName(model)

  const schemaModel = builder.findByType('model', { name: model.name })
  if (!schemaModel) throw new Error(`Model ${modelName} not found in schema`)

  const imports: Set<string> = new Set()
  const fields = model.fields
    .filter((field) => !field.relationName)
    .map((field) => {
      const { name, typeImport, type, tags } = formatField(
        field,
        schemaModel,
        builder,
      )

      if (typeImport) imports.add(typeImport)

      return {
        name,
        type,
        tags,
      }
    })

  return renderModelTemplate({
    packageName,
    modelName,
    imports: Array.from(imports),
    fields,
  })
}

export async function generateModel(
  model: DMMF.Model,
  config: GeneratorConfig,
  builder: SchemaBuilder,
  output: string,
) {
  const modelName = getModelName(model)

  const location = path.join(
    output,
    config.outputModels,
    modelName.toLowerCase() + '.go',
  )
  const packageName = path.basename(path.dirname(location))

  const content = renderModel(model, builder, packageName)

  await writeFileSafely(location, content, {
    header: OUTPUT_HEADER,
  })
}
