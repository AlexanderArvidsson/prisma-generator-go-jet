import { describe, expect, it } from 'vitest'
import { getSampleDMMF } from './__fixtures__/getSampleDMMF'
import { renderEnum } from '../src/generators/enum'

describe('enum generation', () => {
  it('generates all dmmf enums', async () => {
    const sampleDMMF = await getSampleDMMF()

    sampleDMMF.datamodel.enums.forEach((enumInfo) => {
      expect(renderEnum(enumInfo, 'enum')).toMatchSnapshot(enumInfo.name)
    })
  })
})
