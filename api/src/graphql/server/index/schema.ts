import * as path from 'path';
// eslint-disable-next-line import/extensions
import nexus from 'nexus/dist/index.js';
import { validationPlugin } from 'nexus-validation-plugin';
import { applyMiddleware } from 'graphql-middleware';
import * as systemResolver from '../../../modules/system';
import * as drivesResolver from '../../../modules/document-drive/drives-resolver';
import { getExtraResolvers } from '../../../importedModules';

export const dirname = (() => {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  if (import.meta.dirname) {
    return import.meta.dirname;
  }
  return process.cwd();
})();

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
    schema: path.join(dirname, '../generated/index/schema.graphql'),
    typegen: path.join(dirname, '../generated/index/nexus.ts'),
  },
  contextType: {
    module: path.join(dirname, 'context.ts'),
    export: 'Context',
  },
});

export const schemaWithMiddleware = applyMiddleware(schema);
