import { BadGatewayException, Type } from '@nestjs/common';

import { useContainer } from 'class-validator';

import { Configure } from '@/modules/config/configure';

import { App, CreateOptions } from '../types';

// app实例常量
export const app: App = { configure: new Configure() };

export const createApp = (option: CreateOptions) => async (): Promise<App> => {
    const { config, builder } = option;
    // 初始化配置实例
    await app.configure.initilize(config.factories, config.storage);
    // 如果没有app配置则使用默认配置
    if (!app.configure.has('app')) {
        throw new BadGatewayException('App config not exists!');
    }
    // 创建启动模块
    const BootModule = await createBootModule();
    // 创建app的容器实例
    app.container = await builder({
        configure: app.configure,
        BootModule,
    });
    // 设置api前缀
    if (app.configure.has('app.prefix')) {
        app.container.setGlobalPrefix(await app.configure.get<string>('app.prefix'));
    }
    // 为class-validator添加容器以便在自定义约束中可以注入dataSource等依赖
    useContainer(app.container.select(BootModule), {
        fallbackOnErrors: true,
    });
    return app;
};

/**
 * 构建一个启动模块
 * @param configure
 * @param options
 */
export async function createBootModule(
    configure: Configure,
    options: Pick<CreateOptions, 'globals' | 'providers' | 'modules'>,
): Promise<Type<any>> {}
