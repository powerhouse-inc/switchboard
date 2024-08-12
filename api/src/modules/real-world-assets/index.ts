import { SwitchboardModule } from '../types';
import { options, transmit } from './listener';

export * from './model';
export * from './resolvers';

export const module: SwitchboardModule = {
  transmitter: {
    transmit,
    options
  }
};
