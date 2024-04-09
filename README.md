# Prisma Generator for Go Jet

This repository hosts a generator for the Prisma ORM to generate Go Jet code.
Prisma is a modern database toolkit used for data access in various applications
and services.
This generator specifically targets Go Jet, which is a SQL query builder for
the Go programming language.

## Installation

To use this generator, you must first install it.
You can install it using your package manager of choice if you haven't already:

```bash
yarn add prisma-generator-go-jet
```

Once the generator is installed, replace the default client generator in
your `schema.prisma` file with the following:

```prisma
generator go-jet {
    provider = "prisma-generator-go-jet"

    // Optionally provide a destination directory for the generated file
    // and a filename of your choice
    output = "../types"

    // Optionally change which packages enums, models or tables are generated to,
    // relative to the output
    outputModels = "model"
    outputTables = "table"
    outputEnums = "enum"

    // Optionally change which schema your database is using
    schemaName = "public"
}
```

## Usage

After generating the code, you can use it within your Go project.
The generated code includes models, tables, and enums based on your Prisma schema.
For more information how to use this, read the [go-jet documentation](https://github.com/go-jet/jet).

## Contributing

Contributions are welcome!
If you have any improvements or bug fixes, feel free to open a pull request.
Please make sure to follow the existing code style and write tests for any new functionality.

Here's a short summary to get your started with your contributions:

- Fork and pull the repository
- Go to the `packages/generator` and `packages/usage` folders separately.
- Inside `generator`:

  - Run `yarn install` and `yarn dev` to start `dts` in watch mode.
  - Make changes to the source code

- Inside `usage`:
  - Make some modifications to the `prisma/schema.prisma` schema.
  - Run `yarn prisma generate` and check the output in `types/*`.

Done! Once you've got some changes, create a pull request and I'll
try my best to review and merge them quickly!

## License

This project is licensed under the MIT License -
see the [LICENSE](LICENSE) file for details.

## Shoutouts

- This generator would not have been possible without the great efforts made
  by the [go-jet documentation](https://github.com/go-jet/jet) team!
  The generator they have built into go-jet is awesome, however it lacks the
  contextual information that Prisma can provide.
  It makes perfect sense to use Prisma to migrate your database, then use the
  built-in generator from go-jet to create your types,
  but I wanted to eliminate the extra step and instead do everything in one go,
  hence this generator was made.
- The amazing [prisma-ast](https://github.com/MrLeebo/prisma-ast) parser, which
  allows this generator from extracting additional data, otherwise unavailable
  in the Prisma DMMF representation of the schema. Go give it a star!
- Lots of inspiration from other generators, such as
  [prisma-kysely](https://github.com/valtyr/prisma-kysely),
  [zod-prisma-types](https://github.com/chrishoermann/zod-prisma-types/tree/master),
  and more, so thanks for creating awesome generators for Prisma!
