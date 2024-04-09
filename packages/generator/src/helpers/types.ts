type TypeName =
  | 'BigInt'
  | 'Boolean'
  | 'Bytes'
  | 'DateTime'
  | 'Decimal'
  | 'Float'
  | 'Int'
  | 'Json'
  | 'String'
  | 'Unsupported'

type TypeMap = Partial<Record<TypeName, string>> & { [x: string]: string }

export const goTypeMap: TypeMap = {
  BigInt: 'int64',
  Boolean: 'bool',
  Bytes: '[]byte',
  DateTime: 'time.Time',
  Decimal: 'float64',
  Float: 'float64',
  Int: 'int32',
  Json: 'string',
  String: 'string',
  Unsupported: 'any',
  // Custom types
  UnsignedInt: 'uint32',
  UnsignedSmallInt: 'uint16',
  SmallInt: 'int16',
  UUID: 'uuid.UUID',
}

export const goTypeImportMap: TypeMap = {
  DateTime: 'time',
  UUID: 'github.com/google/uuid',
}

export const goAttributeTypeMap: TypeMap = {
  UnsignedInt: 'UnsignedInt',
  UnsignedSmallInt: 'UnsignedSmallInt',
  SmallInt: 'SmallInt',
  Uuid: 'UUID',
}

export const pgTypeMap: TypeMap = {
  BigInt: 'Integer',
  Boolean: 'Bool',
  Bytes: 'String',
  DateTime: 'Timestampz',
  Decimal: 'Float',
  Float: 'Float',
  Int: 'Integer',
  Json: 'String',
  String: 'String',
  Unsupported: '',
  // Custom types
  UnsignedInt: 'Integer',
  UnsignedSmallInt: 'Integer',
  SmallInt: 'Integer',
  UUID: 'String',
}
