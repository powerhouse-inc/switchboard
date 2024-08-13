import { afterEach, beforeEach } from 'vitest';
import prisma from '../../src/database';

export function cleanDatabase() {
  const clean = async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.coreUnit.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.syncronizationUnit.deleteMany();
    await prisma.operation.deleteMany();
    await prisma.listener.deleteMany();
    await prisma.document.deleteMany();
  };
  beforeEach(async () => {
    await clean();
  });
  afterEach(async () => {
    await clean();
  });
}
