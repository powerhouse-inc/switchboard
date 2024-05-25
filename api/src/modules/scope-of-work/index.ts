import { SwitchboardModule } from "../types";
import { options, transmit } from './listener';

export const module: SwitchboardModule = {
    transmitter: {
        transmit,
        options,
    },
};