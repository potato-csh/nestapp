import { Type } from '@nestjs/common/interfaces';
import { ExternalDocumentationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * 标签选项
 */
export interface TagOption {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
}

/**
 * 总配置，版本，路由中用于swagger的选项
 */
export interface ApiDocSource {
    title?: string;
    description?: string;
    auth?: boolean;
    tags?: (string | TagOption)[];
}

/**
 * API配置
 */
export interface ApiConfig extends ApiDocSource {
    docurl?: string;
    default: string;
    enabled: string[];
    versions: Record<string, VersionOption>;
}

/**
 * 版本配置
 */
export interface VersionOption extends ApiDocSource {
    routes?: RouteOption[];
}

/**
 * 路由配置
 */
export interface RouteOption {
    name: string;
    path: string;
    controllers: Type<any>[];
    children?: RouteOption[];
    doc?: ApiDocSource;
}

/**
 * swagger选项
 */
export interface SwaggerOption extends ApiDocSource {
    version: string;
    path: string;
    // 该文档包含的路由模块
    include: Type<any>[];
}

/**
 * API与Swagger整合的选项
 */
export interface ApiDocOption {
    default?: SwaggerOption;
    routes?: { [key: string]: SwaggerOption };
}
