import { scalarType } from 'nexus/dist';

export const GQLDateBase = scalarType({
  name: 'GQLDateBase',
  asNexusMethod: 'date',
  description: 'Date custom scalar type',
  serialize(value: any) {
    return value.toISOString();
  },
});
