let apiOrigin: string;
interface Crud {
  getUserCrud: any;
  getSessionCrud: any;
}
let crud: Crud;
let intilized = false;

export const setup = (config: {crud: Crud; apiOrigin: string}) => {
  apiOrigin = apiOrigin;
  crud = config.crud;
  intilized = true;
}

export const getModuleConfig = (): {apiOrigin: string; crud: Crud} => {
  if (!intilized) {
    throw new Error('setup() was not called')
  }
  return {apiOrigin, crud};
};
