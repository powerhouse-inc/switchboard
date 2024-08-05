// import moduleExample from 'module-example';
import prismaCore from './database';
// Add your main setup function to the list of all setup functions
// Note that order of the modules in the array matters:
// the latest would receive more extended prisma client
const importedModules: Function[] = [];

// Below is the functionality to iterate over all importedModules
// and run their setup logic iteratevely
let fullyExtendedPrisma = prismaCore;
const importedResolvers = [] as any;
let setupComplete = false;

export function setupAllModules() {
  if (setupComplete) {
    return;
  }
  importedModules.forEach(importedModule => {
    const exported = importedModule(fullyExtendedPrisma);
    if (typeof exported !== 'object') {
      throw new Error(
        'function exported from a module should always return an object'
      );
    }
    if ('extendedPrisma' in exported) {
      fullyExtendedPrisma = exported.extendedPrisma;
    }
    if ('resolvers' in exported) {
      importedResolvers.push(exported.resolvers);
    }
  });
  setupComplete = true;
}

export function getExtendedPrisma() {
  setupAllModules();
  return fullyExtendedPrisma;
}

export function getExtraResolvers() {
  setupAllModules();
  return importedResolvers;
}

export default importedModules;
