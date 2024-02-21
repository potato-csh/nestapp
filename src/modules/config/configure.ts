import { get, has, isArray, isFunction, isNil, isObject, omit, set } from 'lodash';

import { deepMerge, isAsyncFn } from '../core/helpers';

import { Env } from './env';
import { ConfigStorage } from './storage';
import { ConfigStorageOption, ConfigureFactory, ConfigureRegister } from './types';

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

    get env() {
        return this._env;
    }

    /**
     * 获取所有配置
     */
    all() {
        return this.config;
    }

    /**
     * 判断配置是否存在
     * @param key
     */
    has(key: string) {
        return has(this.config, key);
    }

    /**
     * 获取配置值
     * @param key
     * @param defaultValue
     */
    async get<T>(key: string, defaultValue?: T): Promise<T> {
        if (!has(this.config, key) && defaultValue === undefined && has(this.factories, key)) {
            await this.syncFactory(key);
            return this.get(key, defaultValue);
        }
        return get(this.config, key, defaultValue) as T;
    }

    /**
     * 设置配置项
     * 如果storage是一个布尔值，则只用于确定是否存储该配置，如果该配置已存在在config.yaml中则不更改
     * 如果storage是一个对象时，那么其中的enabled用于设置是否存储该配置，change用于指定如果该配置中存在在config.yaml中时要不要更改
     * @param key
     * @param value
     * @param storage
     * @param append
     */
    async set<T>(
        key: string,
        value: T,
        storage: SetStorageOption | boolean = false,
        append = false,
    ) {
        const storageEnable = typeof storage === 'boolean' ? storage : !!storage.enabled;
        const storageChange = typeof storage === 'boolean' ? false : !!storage.change;
        if (storageEnable && this.storage.enabled) {
            this.changeStorageValue(key, value, storageChange, append);
        } else {
            set(this.config, key, value);
        }
        return this;
    }

    /**
     * 添加一个新配置集
     * @param key
     * @param register
     */
    add<T extends Record<string, any>>(
        key: string,
        register: ConfigureRegister<T> | ConfigureFactory<T>,
    ) {
        if (!isFunction(register) && 'register' in register) {
            this.factories[key] = register as any;
        } else if (isFunction(register)) {
            this.factories[key] = { register };
        }
        return this;
    }

    /**
     * 删除配置项
     * 如果不是存储配置为临时删除，重启用户后该配置依然存在
     * @param key
     */
    remove(key: string) {
        if (has(this.storage.config, key) && this.storage.enabled) {
            this.storage.remove(key);
            this.config = deepMerge(this.config, this.storage.config, 'replace');
        } else if (has(this.config, key)) {
            this.config = omit(this.config, [key]);
        }
        return this;
    }

    /**
     * 手动存储一个配置
     * @param key
     * @param change
     * @param append
     */
    async store(key: string, change = false, append = false) {
        if (!this.storage.enabled) throw new Error('Must enable storage at first!');
        this.changeStorageValue(key, await this.get(key, null), change, append);
        return this;
    }

    /**
     * 同步配置
     * 添加一个配置构造器后需用使用此方法同步到配置中
     * @param name
     */
    async sync(name?: string) {
        if (!isNil(name)) await this.syncFactory(name);
        else {
            for (const key in this.factories) {
                await this.syncFactory(key);
            }
        }
    }

    /**
     * 同步配置构造器
     * @param key
     */
    protected async syncFactory(key: string) {
        if (has(this.config, key) || !has(this.factories, key)) return this;
        const { register, defaultRegister, storage, hook, append } = this.factories[key];
        let defaultValue = {};
        let value = isAsyncFn(register) ? await register(this) : register(this);
        if (!isNil(defaultRegister)) {
            defaultValue = isAsyncFn(defaultRegister)
                ? await defaultRegister(this)
                : defaultRegister(this);
            value = deepMerge(defaultValue, value, 'replace');
        }
        if (!isNil(hook)) {
            value = isAsyncFn(hook) ? await hook(this, value) : hook(this, value);
        }
        if (this.storage.enabled) {
            value = deepMerge(value, get(this.storage.config, key, isArray(value) ? [] : {}));
        }
        this.set(key, value, storage && isNil(await this.get(key, null)), append);
        return this;
    }

    protected async changeStorageValue<T>(key: string, value: T, change = false, append = false) {
        if (change || !has(this.storage.config, key)) {
            this.storage.set(key, value);
        } else if (isObject(get(this.storage.config, key))) {
            this.storage.set(
                key,
                deepMerge(value, get(this.storage.config, key), append ? 'merge' : 'replace'),
            );
        }
        this.config = deepMerge(this.config, this.storage.config, append ? 'merge' : 'replace');
    }
}
