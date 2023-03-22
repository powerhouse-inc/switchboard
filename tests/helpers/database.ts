import { beforeEach, afterEach } from 'vitest';
import { getPrisma } from '../../src/database';

export function cleanDatabase() {
  const clean = async () => {
    const prisma = getPrisma();
    await prisma.coreUnit.deleteMany();
    await prisma.user.deleteMany();
  };
  beforeEach(async () => {
    await clean();
  });
  afterEach(async () => {
    await clean();
  });
}
