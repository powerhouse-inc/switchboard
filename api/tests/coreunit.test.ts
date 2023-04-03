import { test, expect } from 'vitest';
import builder from 'gql-query-builder';
import { CoreUnit } from '@prisma/client';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { executeGraphQlQuery } from './helpers/server';
import prisma from '../src/database';

cleanDatabaseBeforeAfterEachTest();

test('Core Unit: get all', async () => {
  await prisma.coreUnit.create({
    data: {
      code: 'asdf',
      shortCode: 'a',
      name: 'name',
      imageSource: '',
      descriptionSentence: '',
      descriptionParagraph: '',
      descriptionParagraphImageSource: '',
    },
  });
  const query = builder.query({
    operation: 'coreUnits',
    fields: ['code', 'shortCode', 'name'],
  });
  const response = await executeGraphQlQuery(query) as { coreUnits: CoreUnit[] };
  expect(response.coreUnits).toHaveLength(1);
  expect(response.coreUnits[0].code).toBe('asdf');
  expect(response.coreUnits[0].shortCode).toBe('a');
  expect(response.coreUnits[0].name).toBe('name');
});

test('Core Unit: get by id', async () => {
  const created = await prisma.coreUnit.create({
    data: {
      code: 'asdf',
      shortCode: 'a',
      name: 'name',
      imageSource: '',
      descriptionSentence: '',
      descriptionParagraph: '',
      descriptionParagraphImageSource: '',
    },
  });
  const query = builder.query({
    operation: 'coreUnit',
    variables: {
      id: {
        value: created.id,
        type: 'String!',
      },
    },
    fields: ['id'],
  });
  const response = await executeGraphQlQuery(query) as { coreUnit: CoreUnit };
  expect(response.coreUnit.id).toBe(created.id);
});

test('Core Unit: get by id without id field throws', async () => {
  const query = builder.query({
    operation: 'coreUnit',
    fields: ['id'],
  });
  const response = await executeGraphQlQuery(query) as { errors: Record<string, unknown>[] };
  expect(response.errors[0].message).toBe('Field "coreUnit" argument "id" of type "String!" is required, but it was not provided.');
});
