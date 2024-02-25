import { Module } from '@nestjs/common';

import { Configure } from '../config/configure';

import { panic } from '../core/helpers/command';

import { MeiliService } from './meili.service';

@Module({})
export class MeiliModule {
    static async forRoot(configure: Configure) {
        if (!configure.has('meili')) {
            panic({ message: 'MeiliSearch config not exists or not right!' });
        }
        return {
            global: true,
            module: MeiliModule,
            providers: [
                {
                    provide: MeiliService,
                    useFactory: async () => {
                        const service = new MeiliService(await configure.get('meili'));
                        service.createClients();
                        return service;
                    },
                },
            ],
            exports: [MeiliService],
        };
    }

    // static forRoot1(configRegister: () => MeiliConfig): DynamicModule {
    //     return {
    //         global: true,
    //         module: MeiliModule,
    //         providers: [
    //             {
    //                 provide: MeiliService,
    //                 useFactory: async () => {
    //                     const service = new MeiliService(
    //                         await createMeiliOptions(configRegister()),
    //                     );
    //                     service.createClients();
    //                     return service;
    //                 },
    //             },
    //         ],
    //         exports: [MeiliService],
    //     };
    // }
}
