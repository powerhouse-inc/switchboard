import { setup as setupUserCounter } from 'module-example';

import prismaCore from '../database';

const SETUP_FUNCTIONS = [
  setupUserCounter,
];

let prismaModded = prismaCore;
let pluggedTypes: Record<string, any> = {};
let setupComplete = false;

export function setupAllModules() {
  const types: any = [];
  SETUP_FUNCTIONS.forEach((setup) => {
    const { types: extraTypes, prisma: extraPrisma } = setup(prismaModded);
    prismaModded = extraPrisma;
    types.push(extraTypes);
  });
  pluggedTypes = Object.assign({}, ...types);
  setupComplete = true;
}

export function getPrisma() {
  if (!setupComplete) {
    throw new Error('setupAll() must be called before getPrisma()');
  }
  return prismaModded;
}

export function getTypes() {
  if (!setupComplete) {
    throw new Error('setupAll() must be called before getTypes()');
  }
  return pluggedTypes;
}
