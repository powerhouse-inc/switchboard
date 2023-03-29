import { beforeEach, afterEach } from 'vitest';
import prisma from '../../src/database';

export function cleanDatabase() {
  const clean = async () => {
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
