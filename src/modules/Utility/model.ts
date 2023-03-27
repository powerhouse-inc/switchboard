import { scalarType } from 'nexus/dist';

export const GQLDateBase = scalarType({
  name: 'GQLDateBase',
  asNexusMethod: 'date',
  description: 'Date custom scalar type',
  parseValue(value) {
    return new Date(value as unknown as string);
  },
  serialize(value: any) {
    return value.toISOString();
  },
});
