import moduleExample from 'module-example';
import prismaCore from './database';

// Add your main setup function to the list of all setup functions
// Note that order of the modules in the array matters:
// the latest would receive more extended prisma client
const importedModules = [
  moduleExample,
];

// Below is the functionality to iterate over all importedModules
// and run their setup logic iteratevely
let fullyExtendedPrisma = prismaCore;
const importedResolvers = [] as any;
let setupComplete = false;

export function setupAllModules() {
  if (setupComplete) {
    return;
  }
  importedModules.forEach((importedModule) => {
    const { resolvers, extendedPrisma } = importedModule(fullyExtendedPrisma);
    fullyExtendedPrisma = extendedPrisma;
    importedResolvers.push(resolvers);
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
