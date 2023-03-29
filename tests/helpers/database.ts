import { beforeEach, afterEach } from 'vitest';
import prisma from '../../src/database';

export function cleanDatabase() {
  const clean = async () => {
    await prisma.coreUnit.deleteMany();
    await prisma.user.deleteMany();
    await prisma.session.deleteMany();
  };
  beforeEach(async () => {
    await clean();
  });
  afterEach(async () => {
    await clean();
  });
}
