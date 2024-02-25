import { DynamicModule, Module, ModuleMetadata, Provider, Type } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions, getDataSourceToken } from '@nestjs/typeorm';

import { DataSource, ObjectType } from 'typeorm';

import { Configure } from '../config/configure';
import { DataExistConstraint } from '../core/constraints';

import { UniqueTreeExistConstraint } from '../core/constraints/tree.exist.contraint';
import { UniqueTreeConstraint } from '../core/constraints/tree.unique.constraint';

import { UniqueConstraint } from '../core/constraints/unique.constraint';
import { UniqueExistConstraint } from '../core/constraints/unique.exist.constraint';
import { panic } from '../core/helpers/command';

import { CUSTOM_REPOSITORY_METADETA } from './constants';
import { DbOptions } from './types';

@Module({})
export class DatabaseModule {
    static async forRoot(configure: Configure) {
        if (!configure.has('database')) {
            panic({ message: 'Database config not exists or not right!' });
        }
        const { connections } = await configure.get<DbOptions>('database');
        const imports: ModuleMetadata['imports'] = [];
        for (const dbOption of connections) {
            imports.push(TypeOrmModule.forRoot(dbOption as TypeOrmModuleOptions));
        }
        const providers: ModuleMetadata['providers'] = [
            DataExistConstraint,
            UniqueConstraint,
            UniqueExistConstraint,
            UniqueTreeConstraint,
            UniqueTreeExistConstraint,
        ];
        return {
            module: DatabaseModule,
            global: true,
            imports,
            providers,
        };
    }

    static forRepository<T extends Type<any>>(
        repositories: T[],
        dataSourceName?: string,
    ): DynamicModule {
        const providers: Provider[] = [];

        for (const Repo of repositories) {
            const entity = Reflect.getMetadata(CUSTOM_REPOSITORY_METADETA, Repo);

            if (!entity) {
                continue;
            }

            providers.push({
                inject: [getDataSourceToken(dataSourceName)],
                provide: Repo,
                useFactory: (dataSource: DataSource): InstanceType<typeof Repo> => {
                    const base = dataSource.getRepository<ObjectType<any>>(entity);
                    return new Repo(base.target, base.manager, base.queryRunner);
                },
            });
        }

        return {
            exports: providers,
            module: DatabaseModule,
            providers,
        };
    }
}
