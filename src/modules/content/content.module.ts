import { Module, ModuleMetadata } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Configure } from '../config/configure';
import { DatabaseModule } from '../database/database.module';

import { defaultContentConfig } from './config';
import * as controllers from './controllers';
import * as entities from './entities';
import * as repositories from './repositories';
import * as services from './services';
import { PostService } from './services/post.service';
import { PostSubscriber } from './subscribers';

@Module({})
export class ContentModule {
    static async forRoot(configure: Configure) {
        const config = await configure.get('content', defaultContentConfig);
        const providers: ModuleMetadata['providers'] = [
            ...Object.values(services),
            PostSubscriber,
            {
                provide: PostService,
                inject: [
                    repositories.PostRepository,
                    repositories.CategoryRepository,
                    services.CategoryService,
                    repositories.TagRepository,
                    { token: services.SearchService, optional: true },
                ],
                useFactory(
                    postRepository: repositories.PostRepository,
                    categoryRepository: repositories.CategoryRepository,
                    categoryService: services.CategoryService,
                    tagRepository: repositories.TagRepository,
                    searchService: services.SearchService,
                ) {
                    return new PostService(
                        postRepository,
                        categoryRepository,
                        categoryService,
                        tagRepository,
                        searchService,
                        config.searchType,
                    );
                },
            },
        ];
        const exports: ModuleMetadata['exports'] = [
            ...Object.values(services),
            DatabaseModule.forRepository(Object.values(repositories)),
            PostService,
        ];

        if (config.htmlEnabled) {
            providers.push(services.SanitizeService);
            exports.push(services.SanitizeService);
        }

        if (config.searchType === 'meili') {
            providers.push(services.SearchService);
            exports.push(services.SearchService);
        }

        return {
            module: ContentModule,
            imports: [
                TypeOrmModule.forFeature(Object.values(entities)),
                DatabaseModule.forRepository(Object.values(repositories)),
            ],
            controllers: Object.values(controllers),
            providers,
            exports,
        };
    }

    // static forRoot1(configRegister?: () => ContentConfig): DynamicModule {
    //     const config: Required<ContentConfig> = {
    //         searchType: 'mysql',
    //         ...(configRegister ? configRegister() : {}),
    //     };
    //     const providers: ModuleMetadata['providers'] = [
    //         ...Object.values(services),
    //         PostSubscriber,
    //         services.SanitizeService,
    //         {
    //             provide: PostService,
    //             inject: [
    //                 repositories.PostRepository,
    //                 repositories.CategoryRepository,
    //                 services.CategoryService,
    //                 repositories.TagRepository,
    //                 { token: services.SearchService, optional: true },
    //             ],
    //             useFactory(
    //                 postRepository: repositories.PostRepository,
    //                 categoryRepository: repositories.CategoryRepository,
    //                 categoryService: services.CategoryService,
    //                 tagRepository: repositories.TagRepository,
    //                 searchService: services.SearchService,
    //             ) {
    //                 return new PostService(
    //                     postRepository,
    //                     categoryRepository,
    //                     categoryService,
    //                     tagRepository,
    //                     searchService,
    //                     config.searchType,
    //                 );
    //             },
    //         },
    //     ];
    //     if (config.searchType === 'meili') providers.push(services.SearchService);
    //     return {
    //         module: ContentModule,
    //         imports: [
    //             TypeOrmModule.forFeature(Object.values(entities)),
    //             DatabaseModule.forRepository(Object.values(repositories)),
    //         ],
    //         controllers: Object.values(controllers),
    //         providers,
    //         exports: [
    //             ...Object.values(services),
    //             DatabaseModule.forRepository(Object.values(repositories)),
    //             PostService,
    //         ],
    //     };
    // }
}
