import { setup as setupUserCounter } from 'module-example';

import prismaCore from '../database';

const SETUP_FUNCTIONS = [
  setupUserCounter,
];

let prismaModded = prismaCore;
const setupComplete = false;

export function setupAll() {
  const types: any = [];
  SETUP_FUNCTIONS.forEach((setup) => {
    const { types: extraTypes, prisma: extraPrisma } = setup(prismaModded);
    prismaModded = extraPrisma;
    types.push(extraTypes);
  });
  return Object.assign({}, ...types);
}

export function getPrisma() {
  if (!setupComplete) {
    throw new Error('setupAll() must be called before getPrisma()');
  }
  return prismaModded;
}
