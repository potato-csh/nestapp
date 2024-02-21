import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { ensureFileSync } from 'fs-extra';
import { has, isNil, omit, set } from 'lodash';
import YAML from 'yaml';

/**
 * 存储配置
 */
export class ConfigStorage {
    /**
     * 是否开启存储配置功能
     */
    protected _enabled = false;

    /**
     * yaml文件配置路径
     */
    protected _path = resolve(__dirname, '../../..', 'config.yaml');

    /**
     * 存储在yaml中的配置路径
     */
    protected _config: Record<string, any> = {};

    get enabled() {
        return this._enabled;
    }

    get path() {
        return this._path;
    }

    get config() {
        return this._config;
    }

    /**
     * 构造函数
     * @param enabled
     * @param filePath
     */
    constructor(enabled?: boolean, filePath?: string) {
        this._enabled = isNil(enabled) ? this._enabled : enabled;
        if (this._enabled) {
            if (!isNil(filePath)) this._path = filePath;
            ensureFileSync(this._path);
            const config = YAML.parse(readFileSync(this._path, 'utf-8'));
            this._config = isNil(config) ? {} : config;
        }
    }

    /**
     * 设置存储配置
     * @param key
     * @param value
     */
    set<T>(key: string, value: T) {
        ensureFileSync(this.path);
        set(this._config, key, value);
        writeFileSync(this.path, JSON.stringify(this._config, null, 4));
    }

    /**
     * 删除存储配置
     * @param key
     */
    remove(key: string) {
        this._config = omit(this._config, [key]);
        if (has(this._config, key)) omit(this._config, [key]);
        writeFileSync(this.path, JSON.stringify(this._config, null, 4));
    }
}
