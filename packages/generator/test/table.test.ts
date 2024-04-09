import { createPrismaSchemaBuilder } from '@mrleebo/prisma-ast'
import { describe, expect, it } from 'vitest'
import { renderTable } from '../src/generators/table'
import { getSampleDMMF, samplePrismaSchema } from './__fixtures__/getSampleDMMF'

describe('model generation', () => {
  it('generates all dmmf models', async () => {
    const sampleDMMF = await getSampleDMMF()

    const builder = createPrismaSchemaBuilder(samplePrismaSchema)

    sampleDMMF.datamodel.models.forEach((model) => {
      expect(renderTable(model, builder, 'public', 'table')).toMatchSnapshot(
        model.name,
      )
    })
  })
})
