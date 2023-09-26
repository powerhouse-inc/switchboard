import {setup as setupUserCounter} from 'module-example'

import prismaCore from '../database';

const SETUP_FUNCTIONS = [
  setupUserCounter
]

let prismaModded = prismaCore;

export function setupAll() {
  const types: any = [];
  SETUP_FUNCTIONS.forEach(setup => {
    const {types: extraTypes, prisma: extraPrisma} = setup(prismaModded);
    prismaModded = extraPrisma;
    types.push(extraTypes);
  });
  return Object.assign({}, ...types);
}

export function getPrisma() {return prismaModded};
