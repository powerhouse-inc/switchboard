import { test, expect } from 'vitest';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import prisma from '../src/database';
import { ctx } from './helpers/server';
import { GenqlError } from '../generated';

cleanDatabaseBeforeAfterEachTest();

const listCoreUnits = async () => ctx.client.query({
  coreUnits: {
    code: true,
    shortCode: true,
    name: true,
    id: true,
  },
});

const getCoreUnit = async (id: string) => ctx.client.query({
  coreUnit: {
    code: true,
    shortCode: true,
    name: true,
    id: true,
    __args: {
      id,
    },
  },
});

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
  const response = await listCoreUnits();
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
  const response = await getCoreUnit(created.id);
  expect(response.coreUnit.id).toBe(created.id);
});

test('Core Unit: get by id of unexistant throws', async () => {
  const response: GenqlError = await getCoreUnit('asdf').catch((e) => e);
  expect(response.errors[0].message).toBe('Unit not found');
});
