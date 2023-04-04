import { generate } from '@genql/cli';
import fs from 'fs';
import path from 'path';

generate({
  schema: fs.readFileSync(path.join(__dirname, '..', 'generated', 'schema.graphql')).toString(),
  output: path.join(__dirname, '..', 'generated'),
  scalarTypes: {
    DateTime: 'Date',
  },
}).catch(
  // eslint-disable-next-line no-console
  console.error,
);
