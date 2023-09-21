import {setup} from 'module-example'

export function setupAll() {
  const modTypes = [
    setup()
  ]
  return Object.assign({}, ...modTypes)
}
