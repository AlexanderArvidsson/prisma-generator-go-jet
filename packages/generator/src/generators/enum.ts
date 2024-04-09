import { DMMF } from '@prisma/generator-helper'
import { getEnumMemberName, getEnumName } from '../helpers/format.js'
import { GeneratorConfig } from '../generator.js'
import { OUTPUT_HEADER } from '../constants.js'
import { writeFileSafely } from '../utils/writeFileSafely.js'
import path from 'path'

export type EnumMember = {
  name: string
  value: string
}

export type RenderEnumTemplateOptions = {
  packageName: string
  enumName: string
  members: EnumMember[]
}

export function renderEnumTemplate({
  packageName,
  enumName,
  members,
}: RenderEnumTemplateOptions) {
  return `package ${packageName}

import "github.com/go-jet/jet/v2/postgres"

var ${enumName} = &struct {
  ${members.map((member) => `${member.name} postgres.StringExpression`).join('\n  ')}
}{
  ${members.map((member) => `${member.name}: postgres.NewEnumValue("${member.value}"),`).join('\n  ')}
}`
}

export function renderEnum(
  datamodelEnum: DMMF.DatamodelEnum,
  packageName: string,
) {
  const enumName = getEnumName(datamodelEnum)

  const members = datamodelEnum.values.map(
    (member): EnumMember => ({
      name: getEnumMemberName(member.name),
      value: member.name,
    }),
  )

  return renderEnumTemplate({
    packageName,
    enumName,
    members,
  })
}

export async function generateEnum(
  datamodelEnum: DMMF.DatamodelEnum,
  config: GeneratorConfig,
  output: string,
) {
  const enumName = getEnumName(datamodelEnum)

  const location = path.join(
    output,
    config.outputEnums,
    enumName.toLowerCase() + '.go',
  )
  const packageName = path.basename(path.dirname(location))

  const content = renderEnum(datamodelEnum, packageName)

  await writeFileSafely(location, content, { header: OUTPUT_HEADER })
}
