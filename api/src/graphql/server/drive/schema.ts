import * as path from 'path';
import { connectionPlugin, fieldAuthorizePlugin, makeSchema } from 'nexus/dist';
import { validationPlugin } from 'nexus-validation-plugin';
import { applyMiddleware } from 'graphql-middleware';
import * as driveResolver from '../../../modules/document-drive/drive-resolver';
import * as systemResolver from '../../../modules/system';
import * as documentResolver from '../../../modules/document';
import * as rwaDocumentResolver from '../../../modules/real-world-assets';
import { getExtraResolvers } from '../../../importedModules';

/* istanbul ignore next @preserve */
export const schema = makeSchema({
  types: {
    ...systemResolver,
    ...rwaDocumentResolver,
    ...driveResolver,
    // ...documentResolver,
    ...getExtraResolvers(),
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
    schema: path.join(__dirname, '../../generated/drive/schema.graphql'),
    typegen: path.join(__dirname, '../../generated/drive/nexus.ts'),
  },
  contextType: {
    module: path.join(__dirname, './context.ts'),
    export: 'Context',
  },
});

export const schemaWithMiddleware = applyMiddleware(schema);
