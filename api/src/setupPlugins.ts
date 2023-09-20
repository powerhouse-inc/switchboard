import { setup } from 'powerhouse-switchboard-plugin-demo';
import { getUserCrud } from './modules/User'
import { getSessionCrud } from './modules/Session'
import {API_ORIGIN} from './env'

export const setupAll = () => {
  setup({
    apiOrigin: API_ORIGIN,
    crud: {
      getUserCrud,
      getSessionCrud
    }
  });
}
