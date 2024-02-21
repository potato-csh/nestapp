import { Env } from './env';
import { ConfigStorage } from './storage';
import { ConfigStorageOption, ConfigureFactory } from './types';

/**
 * 设置配置的存储选项
 */
interface SetStorageOption {
    /**
     * 是否存储配置
     */
    enabled?: boolean;
    /**
     * 用于指定如果该配置已经存在在config.yaml中时要不要更改
     */
    change?: boolean;
}

/**
 * 配置类
 */
export class Configure {
    /**
     * 配置是否初始化
     */
    protected inited = false;

    /**
     * 配置构建函数对象
     */
    protected factories: Record<string, ConfigureFactory<Record<string, any>>> = {};

    /**
     * 生成的配置
     */
    protected config: Record<string, any> = {};

    /**
     * 环境变量操作实例
     */
    protected _env: Env;

    /**
     * 存储配置操作实例
     */
    protected storage: ConfigStorage;

    /**
     * 初始化配置类
     */
    async initilize(configs: Record<string, any> = {}, option: ConfigStorageOption = {}) {
        if (this.inited) return this;
        this._env = new Env();
        await this._env.load();
        const { enabled, filePath } = option;
        this.storage = new ConfigStorage(enabled, filePath);
        for (const key in configs) {
            this.add(key, configs[key]);
        }
        await this.sync();
        this.inited = true;
        return this;
    }
}
