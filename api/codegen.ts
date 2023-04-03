import type { CodegenConfig } from '@graphql-codegen/cli';
import { printSchema } from 'graphql';
import { schema } from './src/modules';

const config: CodegenConfig = {
  schema: printSchema(schema),
  generates: {
    'schema.graphql': {
      plugins: ['schema-ast'],
    },

  },
  config: {
    scalars: {
      DateTime: 'Date',
    }
  }
};

export default config;
