import { createConnectionOptions } from '../config/helpers';
import { ConfigureFactory, ConfigureRegister } from '../config/types';

import { MeiliConfig } from './types';

export const createMeiliConfig: (
    register: ConfigureRegister<RePartial<MeiliConfig>>,
) => ConfigureFactory<MeiliConfig, MeiliConfig> = (register) => ({
    register,
    hook: (configure, value) => createConnectionOptions(value),
});
