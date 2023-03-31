import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";

import type PrismaTypes from '@pothos/plugin-prisma/generated';
import prisma from '../database'
const builder = new SchemaBuilder<{PrismaTypes: PrismaTypes}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
  }
})

export default builder;
