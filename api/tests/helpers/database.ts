import { beforeEach, afterEach } from 'vitest';
import prisma from '../../src/database';

let tableNameList: string[] | undefined;

function formatTableNameToPrismaName(tableName: string) {
  return tableName.charAt(0).toLowerCase() + tableName.slice(1);
}

const getTableNames = async () => {
  if (typeof tableNameList !== 'undefined') {
    return tableNameList;
  }
  const tableNames = (
    await prisma.$queryRaw<{ name: string }[]>`SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';`
  );
  tableNameList = tableNames.map((table) => formatTableNameToPrismaName(table.name));
  return tableNameList;
};

export function cleanDatabase() {
  const clean = async () => {
    const tablenames = await getTableNames();
    await tablenames.slice(1).reduce(async (acc, tableName) => {
      const table: any = prisma[tableName as any];
      return acc.then(() => table.deleteMany());
    }, (prisma[tablenames[0] as any] as any).deleteMany() as Promise<void>); // can't type properly tablenames received via raw query.
  };
  beforeEach(async () => {
    await clean();
  });
  afterEach(async () => {
    await clean();
  });
}
