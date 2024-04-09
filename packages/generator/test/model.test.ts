import { describe, expect, it } from 'vitest'
import { renderModel } from '../src/generators/model'
import { getSampleDMMF, samplePrismaSchema } from './__fixtures__/getSampleDMMF'
import { createPrismaSchemaBuilder } from '@mrleebo/prisma-ast'

describe('model generation', () => {
  it('generates all dmmf models', async () => {
    const sampleDMMF = await getSampleDMMF()

    const builder = createPrismaSchemaBuilder(samplePrismaSchema)

    sampleDMMF.datamodel.models.forEach((model) => {
      expect(renderModel(model, builder, 'model')).toMatchSnapshot(model.name)
    })
  })
})
