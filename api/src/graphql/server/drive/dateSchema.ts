import { scalarType } from 'nexus/dist';

export const GQLDateBase = scalarType({
  name: 'Date',
  asNexusMethod: 'date',
  description: 'Date custom scalar type',
  serialize(value: any) {
    return value.toISOString();
  },
  parseValue(value: unknown) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return null;
  },
});
