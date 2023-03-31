import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import RelayPlugin from "@pothos/plugin-relay";
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import {Session, User} from '@prisma/client';
import { DateTimeResolver } from 'graphql-scalars';

import type PrismaTypes from '@pothos/plugin-prisma/generated';
import prisma from '../database'
const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes,
  Scalars: {
    DateTime: {
      Output: Date;
      Input: Date;
    }
  },
  Context: {
    getSession: () => Promise<Session & {creator: User}>;
  }
}>({
  plugins: [PrismaPlugin, RelayPlugin, SimpleObjectsPlugin],
  prisma: {
    client: prisma,
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
  },
  relayOptions: {
    clientMutationId: 'omit',
    cursorType: 'String',
  }
})

builder.queryType()
builder.mutationType()
builder.addScalarType('DateTime', DateTimeResolver, {});

export default builder;
