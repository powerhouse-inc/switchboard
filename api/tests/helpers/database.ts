import { beforeEach, afterEach } from 'vitest';
import prisma from '../../src/database';

let tableNameList: string[] | undefined;

const formatTableNameToPrismaName = (tableName: string) => tableName.charAt(0).toLowerCase() + tableName.slice(1);

const getTableNames = async () => {
  if (typeof tableNameList !== 'undefined') {
    return tableNameList;
  }
  const tableNames = await prisma.$queryRaw<{ name: string }[]>`SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';`;
  tableNameList = tableNames.map((table) => formatTableNameToPrismaName(table.name));
  return tableNameList;
};

export function cleanDatabase() {
  const clean = async () => {
    const tablenames = await getTableNames();
    for (const tableName of tablenames) {
      const table: any = prisma[tableName as any];
      await table.deleteMany();
    }
  };
  beforeEach(async () => {
    await clean();
  });
  afterEach(async () => {
    await clean();
  });
}
