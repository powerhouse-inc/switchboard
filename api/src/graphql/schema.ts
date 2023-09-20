import * as path from 'path';
import { connectionPlugin, fieldAuthorizePlugin, makeSchema } from 'nexus/dist';
import { validationPlugin } from 'nexus-validation-plugin';
import { applyMiddleware } from 'graphql-middleware';
import * as types from '../modules';
import { GQLDateBase } from './dateSchema';
import * as demoTypes from 'powerhouse-switchboard-plugin-demo';

/* istanbul ignore next @preserve */
export const schema = makeSchema({
  types: { GQLDateBase, ...types, ...demoTypes },
  plugins: [
    fieldAuthorizePlugin({
      formatError: (authConfig) => authConfig.error,
    }),
    connectionPlugin({
      cursorFromNode(node: any) {
        return node.id;
      },
    }),
    validationPlugin(),
  ],
  outputs: {
    schema: path.join(__dirname, '../generated/schema.graphql'),
    typegen: path.join(__dirname, '../generated/nexus.ts'),
  },
  contextType: {
    module: path.join(__dirname, './context.ts'),
    export: 'Context',
  },
});
export const schemaWithMiddleware = applyMiddleware(schema);
