import { DynamicModule, Module } from '@nestjs/common';

import { createMeiliOptions } from './helpers';
import { MeiliService } from './meili.service';
import { MeiliConfig } from './types';

@Module({})
export class MeiliModule {
    static forRoot(configRegister: () => MeiliConfig): DynamicModule {
        return {
            global: true,
            module: MeiliModule,
            providers: [
                {
                    provide: MeiliService,
                    useFactory: async () => {
                        const service = new MeiliService(
                            await createMeiliOptions(configRegister()),
                        );
                        service.createClients();
                        return service;
                    },
                },
            ],
            exports: [MeiliService],
        };
    }
}
