import * as path from 'path';
import nexus from 'nexus';
import { validationPlugin } from 'nexus-validation-plugin';
import { applyMiddleware } from 'graphql-middleware';
import * as systemResolver from '../../../modules/system';
import * as drivesResolver from '../../../modules/document-drive/drives-resolver';
import { getExtraResolvers } from '../../../importedModules';

/* istanbul ignore next @preserve */
export const schema = nexus.makeSchema({
  types: {
    ...systemResolver, ...drivesResolver, ...getExtraResolvers(),
  },
  plugins: [
    nexus.fieldAuthorizePlugin({
      formatError: (authConfig) => authConfig.error,
    }),
    nexus.connectionPlugin({
      cursorFromNode(node: any) {
        return node.id;
      },
    }),
    validationPlugin(),
  ],
  outputs: {
    schema: path.join(import.meta.dirname, '../../generated/index/schema.graphql'),
    typegen: path.join(import.meta.dirname, '../../generated/index/nexus.ts'),
  },
  contextType: {
    module: path.resolve(import.meta.dirname, '../src/graphql/server/drive/context.ts'),
    export: 'Context',
  },
});

export const schemaWithMiddleware = applyMiddleware(schema);
