let apiOrigin: string;
interface Crud {
  getUserCrud: any;
  getSessionCrud: any;
}
let crud: Crud;
let prisma: any;
let intilized = false;

export const setup = (config: {prisma: unknown; crud: Crud}) => {
  apiOrigin = 'asdlfal';
  crud = config.crud;
  prisma = config.prisma;
  intilized = true;
}

export const getModuleConfig = (): {apiOrigin: string; crud: Crud; prisma: any} => {
  if (!intilized) {
    throw new Error('setup() was not called')
  }
  return {apiOrigin, crud, prisma};
};
