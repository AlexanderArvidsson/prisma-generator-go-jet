import { DMMF, ReadonlyDeep } from '@prisma/generator-helper'
import path from 'path'
import { GeneratorConfig } from '../generator.js'
import { OUTPUT_HEADER } from './../constants.js'
import { formatField, getModelName } from './../helpers/format.js'
import { SchemaBuilder } from './../helpers/schema.js'
import { pgTypeMap } from './../helpers/types.js'
import { writeFileSafely } from './../utils/writeFileSafely.js'

export type TableColumn = {
  name: string
  columnName: string
  type: string
  mutable?: boolean
}

export type RenderTableTemplateOptions = {
  packageName: string
  modelName: string
  schemaName: string
  alias?: string
  tableName: string
  privateModelName: string
  columns: TableColumn[]
}

export function renderTableTemplate({
  packageName,
  modelName,
  schemaName,
  tableName,
  alias = '',
  privateModelName,
  columns,
}: RenderTableTemplateOptions) {
  return `package ${packageName}

import (
	"github.com/go-jet/jet/v2/postgres"
)

var ${modelName} = new${modelName}Table("${schemaName}", "${tableName}", "${alias}")

type ${privateModelName}Table struct {
	postgres.Table

	// Columns
  ${columns.map((c) => `${c.name} postgres.Column${c.type}`).join('\n  ')}

	AllColumns     postgres.ColumnList
	MutableColumns postgres.ColumnList
}

type ${modelName}Table struct {
	${privateModelName}Table

	EXCLUDED ${privateModelName}Table
}

// AS creates new ${modelName}Table with assigned alias
func (a ${modelName}Table) AS(alias string) *${modelName}Table {
	return new${modelName}Table(a.SchemaName(), a.TableName(), alias)
}

// Schema creates new ${modelName}Table with assigned schema name
func (a ${modelName}Table) FromSchema(schemaName string) *${modelName}Table {
	return new${modelName}Table(schemaName, a.TableName(), a.Alias())
}

// WithPrefix creates new ${modelName}Table with assigned table prefix
func (a ${modelName}Table) WithPrefix(prefix string) *${modelName}Table {
	return new${modelName}Table(a.SchemaName(), prefix+a.TableName(), a.TableName())
}

// WithSuffix creates new ${modelName}Table with assigned table suffix
func (a ${modelName}Table) WithSuffix(suffix string) *${modelName}Table {
	return new${modelName}Table(a.SchemaName(), a.TableName()+suffix, a.TableName())
}

func new${modelName}Table(schemaName, tableName, alias string) *${modelName}Table {
	return &${modelName}Table{
		${privateModelName}Table: new${modelName}TableImpl(schemaName, tableName, alias),
		EXCLUDED: new${modelName}TableImpl("", "excluded", ""),
	}
}

func new${modelName}TableImpl(schemaName, tableName, alias string) ${privateModelName}Table {
	var (
    ${columns.map((column) => `${column.name}Column = postgres.${column.type}Column("${column.columnName}")`).join('\n    ')}
		allColumns                     = postgres.ColumnList{${columns.map((column) => `${column.name}Column`).join(', ')}}
		mutableColumns                 = postgres.ColumnList{${columns
      .filter((column) => column.mutable)
      .map((column) => `${column.name}Column`)
      .join(', ')}}
	)

	return ${privateModelName}Table{
		Table: postgres.NewTable(schemaName, tableName, alias, allColumns...),

		//Columns
    ${columns.map((column) => `${column.name}: ${column.name}Column,`).join('\n    ')}

		AllColumns:     allColumns,
		MutableColumns: mutableColumns,
	}
}`
}

export function renderTable(
  model: DMMF.Model,
  builder: SchemaBuilder,
  schemaName: string,
  packageName: string,
) {
  const modelName = getModelName(model)
  const privateModelName =
    modelName.charAt(0).toLowerCase() + modelName.slice(1)

  const tableName = model.dbName?.toString() ?? model.name

  const schemaModel = builder.findByType('model', { name: model.name })
  if (!schemaModel) throw new Error(`Model ${modelName} not found in schema`)

  const columns = model.fields
    .filter((field) => !field.relationName)
    .map((field): TableColumn => {
      const { name } = formatField(field, schemaModel, builder)

      return {
        name,
        columnName: field.dbName ?? field.name,
        type: pgTypeMap[field.type] ?? pgTypeMap.Unsupported,
        mutable: !field.isId && !field.isGenerated,
      }
    })

  return renderTableTemplate({
    modelName,
    privateModelName,
    schemaName,
    tableName,
    alias: modelName,
    packageName,
    columns,
  })
}

export async function generateTable(
  model: DMMF.Model,
  config: GeneratorConfig,
  builder: SchemaBuilder,
  output: string,
) {
  const modelName = getModelName(model)

  const location = path.join(
    output,
    config.outputTables,
    modelName.toLowerCase() + '.go',
  )
  const packageName = path.basename(path.dirname(location))

  const content = renderTable(model, builder, config.schemaName, packageName)

  await writeFileSafely(location, content, { header: OUTPUT_HEADER })
}

export function renderTableUseSchema(
  models: ReadonlyDeep<DMMF.Model[]>,
  packageName: string,
) {
  const modelsStr = models
    .map((model) => {
      const modelName = getModelName(model)
      return `  ${modelName} = ${modelName}.FromSchema(schema)`
    })
    .join('\n')

  return `package ${packageName}

// UseSchema sets a new schema name for all generated table SQL builder types. It is recommended to invoke
// this method only once at the beginning of the program.
func UseSchema(schema string) {
${modelsStr}
}`
}

export async function generateTableUseSchema(
  models: ReadonlyDeep<DMMF.Model[]>,
  config: GeneratorConfig,
  output: string,
) {
  const location = path.join(output, config.outputTables, 'table_use_schema.go')
  const packageName = path.basename(path.dirname(location))

  const content = renderTableUseSchema(models, packageName)

  await writeFileSafely(location, content, { header: OUTPUT_HEADER })
}
