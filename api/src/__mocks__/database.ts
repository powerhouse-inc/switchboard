import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { XPrisma } from '../database';

const prisma = mockDeep<XPrisma>();

beforeEach(() => {
  mockReset(prisma);
});

export default prisma;
