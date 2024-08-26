import * as path from 'path';
// eslint-disable-next-line import/extensions
import { applyMiddleware } from 'graphql-middleware';
import { validationPlugin } from 'nexus-validation-plugin';
import nexus from 'nexus/dist/index.js';
import { getExtraResolvers } from '../../../importedModules';
import * as accountSnapshotResolver from '../../../modules/account-snapshot';
import * as budgetStatement from '../../../modules/budget-statement';
import * as documentResolver from '../../../modules/document';
import * as driveResolver from '../../../modules/document-drive/drive-resolver';
import * as driveStateResolver from '../../../modules/document-drive/resolvers';
import * as rwaDocumentResolver from '../../../modules/real-world-assets';
import * as scopeFramework from '../../../modules/scope-framework';
import * as systemResolver from '../../../modules/system';

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
    ...systemResolver,
    ...driveStateResolver,
    ...driveResolver,
    ...documentResolver,
    ...rwaDocumentResolver,
    ...accountSnapshotResolver,
    ...budgetStatement,
    ...scopeFramework,
    ...getExtraResolvers()
  },
  plugins: [
    nexus.fieldAuthorizePlugin({
      formatError: authConfig => authConfig.error
    }),
    nexus.connectionPlugin({
      cursorFromNode(node: any) {
        return node.id;
      }
    }),
    validationPlugin()
  ],
  outputs: {
    schema: path.join(dirname, '../generated/drive/schema.graphql'),
    typegen: path.join(dirname, '../generated/drive/nexus.ts')
  },
  contextType: {
    module: path.join(dirname, 'context.ts'),
    export: 'Context'
  }
});

export const schemaWithMiddleware = applyMiddleware(schema);
