import * as path from 'path';
import { connectionPlugin, fieldAuthorizePlugin, makeSchema } from 'nexus/dist';
import { validationPlugin } from 'nexus-validation-plugin';
import { applyMiddleware } from 'graphql-middleware';
import * as systemResolver from '../../../modules/system';
import * as drivesResolver from '../../../modules/document-drive/drives-resolver';
import { getExtraResolvers } from '../../../importedModules';

/* istanbul ignore next @preserve */
export const schema = makeSchema({
  types: {
    ...systemResolver, ...drivesResolver, ...getExtraResolvers(),
  },
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
    schema: path.join(__dirname, '../../generated/index/schema.graphql'),
    typegen: path.join(__dirname, '../../generated/index/nexus.ts'),
  },
  contextType: {
    module: path.join(__dirname, './context.ts'),
    export: 'Context',
  },
});

export const schemaWithMiddleware = applyMiddleware(schema);
