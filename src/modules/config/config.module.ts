import { DynamicModule, Module } from '@nestjs/common';

import { Configure } from './configure';

@Module({})
export class ConfigModule {
    static forRoot(configure: Configure): DynamicModule {
        return {
            module: ConfigModule,
            global: true,
            providers: [
                {
                    provide: Configure,
                    useValue: configure,
                },
            ],
            exports: [Configure],
        };
    }
}
