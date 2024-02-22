import { ModuleMetadata, PipeTransform, Type } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { Configure } from '../config/configure';
import { ConfigStorageOption, ConfigureFactory } from '../config/types';

/**
 * APP 对象类型
 */
export type App = {
    // 应用容器实例
    container?: NestFastifyApplication;
    // 配置类实例
    configure: Configure;
};

/**
 * 创建应用的选项参数
 */
export interface CreateOptions {
    /**
     * 返回值为需要导入的模块
     */
    modules: (configure: Configure) => Promise<Required<ModuleMetadata['imports']>>;
    /**
     * 应用构建器
     */
    builder: ContainerBuilder;
    /**
     * 全局配置
     */
    globals?: {
        /**
         * 全局管道，默认为AppPipe, 设置为null则不添加
         * @param configure
         */
        pipe?: (configure: Configure) => PipeTransform<any> | null;
        /**
         * 全局拦截器，默认为AppInterceptor, 设置为null则不添加
         */
        interceptor?: Type<any> | null;
        /**
         * 全局过滤器,默认AppFilter,设置为null则不添加
         */
        filter?: Type<any> | null;
    };

    providers?: ModuleMetadata['providers'];

    /**
     * 配置选项
     */
    config: {
        /**
         * 初始配置集
         */
        factories: Record<string, ConfigureFactory<Record<string, any>>>;
        /**
         * 配置服务的动态存储选项
         */
        storage: ConfigStorageOption;
    };
}

/**
 * 应用构建器
 */
export interface ContainerBuilder {
    (params: { configure: Configure; BootModule: Type<any> }): Promise<NestFastifyApplication>;
}
