// import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { toNumber } from 'lodash';

import { createDbConfig } from '@/modules/database/config';

// export const database = (): TypeOrmModuleOptions => ({
//     // 以下为mysql配置
//     charset: 'utf8mb4',
//     logging: ['error'],
//     type: 'mysql',
//     host: '127.0.0.1',
//     port: 3306,
//     username: 'root',
//     password: 'password',
//     database: '3r',
//     // 以下为sqlite配置
//     // type: 'better-sqlite3',
//     // database: resolve(__dirname, '../../database.db'),
//     synchronize: true,
//     autoLoadEntities: true,
// });

// src/config/database.config.ts
export const database = createDbConfig((configure) => ({
    common: {
        synchronize: true,
    },
    connections: [
        {
            // 以下为mysql配置
            type: 'mysql',
            host: configure.env.get('DB_HOST', '127.0.0.1'),
            port: configure.env.get('DB_PORT', (v) => toNumber(v), 3306),
            username: configure.env.get('DB_USERNAME', 'root'),
            password: configure.env.get('DB_PASSWORD', 'password'),
            database: configure.env.get('DB_NAME', '3r'),
        },
        // {
        // 以下为sqlite配置
        // type: 'better-sqlite3',
        // database: resolve(__dirname, configure.env.get('DB_PATH', '../../database.db')),
        // },
    ],
}));
