import { Config } from 'meilisearch';

// MeiliSearch模块的配置
export type MeiliConfig = MelliOption[];

// MeiliSearch的连接节点配置
export type MelliOption = Config & { name: string };
