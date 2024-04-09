import { getDMMF } from '@prisma/internals'
import { getSchemaSync } from '@prisma/sdk'
import path from 'path'

export const samplePrismaSchema = getSchemaSync(
  path.join(__dirname, './sample.prisma'),
)

export const getSampleDMMF = async () => {
  return getDMMF({
    datamodel: samplePrismaSchema,
  })
}
