import { createConnectionOptions } from '../config/helpers';
import { ConfigureFactory, ConfigureRegister } from '../config/types';
import { deepMerge } from '../core/helpers/utils';

import { DbConfig, DbOptions, TypeormOption } from './types';

/**
 * 数据库配置构造器创建
 * @param register
 */
export const createDbConfig: (
    register: ConfigureRegister<RePartial<DbConfig>>,
) => ConfigureFactory<DbConfig, DbOptions> = (register) => ({
    register,
    hook: (configure, value) => createDbOptions(value),
    defaultRegister: () => ({
        common: {
            charset: 'utf8mb4',
            logging: ['error'],
        },
        connections: [],
    }),
});

/**
 * 创建数据库配置
 * @param options 自定义配置
 */
export const createDbOptions = (options: DbConfig) => {
    const newOptions: DbOptions = {
        common: deepMerge(
            {
                charset: 'utf8mb4',
                logging: ['error'],
            },
            options.common ?? {},
            'replace',
        ),
        connections: createConnectionOptions(options.connections ?? []),
    };
    newOptions.connections = newOptions.connections.map((connection) => {
        const entities = connection.entities ?? [];
        const newOption = { ...connection, entities };
        return deepMerge(
            newOptions.common,
            {
                ...newOption,
                autoLoadEntities: true,
            } as any,
            'replace',
        ) as TypeormOption;
    });
    return newOptions;
};
