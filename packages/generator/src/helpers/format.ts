import { DMMF } from '@prisma/generator-helper'
import { pascalCase } from 'change-case'
import { logger } from '@prisma/sdk'
import { goAttributeTypeMap, goTypeImportMap, goTypeMap } from './types.js'
import { Model, Field } from '@mrleebo/prisma-ast'
import { SchemaBuilder } from './schema.js'

export const getFieldName = (field: DMMF.Field) => {
  // Go requires PascaleCase for exported fields
  let name = pascalCase(field.name)

  // Certain field names should be mapped to different name
  if (name.endsWith('Id')) name = name.substring(0, name.length - 2) + 'ID'
  if (name.endsWith('Url')) name = name.substring(0, name.length - 3) + 'URL'
  if (name.endsWith('Uuid')) name = name.substring(0, name.length - 4) + 'UUID'

  return name
}

export const getFieldType = (field: DMMF.Field, schemaField: Field | null) => {
  let fieldType = field.type

  const visitedGroups: Record<string, boolean> = {}
  schemaField?.attributes?.forEach((attr) => {
    if (attr.group) {
      if (visitedGroups[attr.group]) {
        logger.warn(
          `Attribute group ${attr.group} has already been visited, this may be a bug in the schema`,
        )
        return
      }

      visitedGroups[attr.group] = true
    }

    // if (attr.kind !== 'field') console.log(model.name, field.name, attr)

    if (attr.group === 'db') {
      if (goAttributeTypeMap[attr.name]) {
        fieldType = goAttributeTypeMap[attr.name]
      }
    }
  })

  // List types are arrays
  if (field.isList) {
    fieldType = fieldType + '[]'
  }

  let type = goTypeMap[fieldType] ?? goTypeMap.Unsupported

  // Nullable types are pointers
  if (!field.isRequired) type = `*${type}`

  return [fieldType, type]
}

export const getModelName = (model: DMMF.Model) => {
  return pascalCase(model.name)
}

export const getEnumName = (datamodelEnum: DMMF.DatamodelEnum) => {
  return pascalCase(datamodelEnum.name)
}

export const getEnumMemberName = (member: string) => {
  return pascalCase(member)
}

export const formatField = (
  field: DMMF.Field,
  model: Model,
  builder: SchemaBuilder,
) => {
  const name = getFieldName(field)

  const schemaField = builder.findByType('field', {
    name: field.name,
    within: model.properties,
  })

  if (!schemaField) {
    logger.warn(
      `Field ${field.name} on model ${model.name} not found in schema, type may not be correct`,
    )
  }

  const [fieldType, type] = getFieldType(field, schemaField)

  const typeImport = goTypeImportMap[fieldType]
  const tags: string[] = []

  if (field.name === 'keywords') console.log(field.name, fieldType, type)

  // ID tags are primary keys
  if (field.isId) {
    tags.push('sql:"primary_key"')
  }

  return {
    name,
    type,
    tags,
    typeImport,
  }
}
