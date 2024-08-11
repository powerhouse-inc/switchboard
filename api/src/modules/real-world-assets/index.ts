import { SwitchboardModule } from '../types';
import { options, transmit } from './listener';

export * from './resolvers';
export * from './model';

export const module: SwitchboardModule = {
    transmitter: {
        transmit,
        options,
    },
};
