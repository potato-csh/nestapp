import { ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';

import { isNil, omit } from 'lodash';

import MeiliSearch from 'meilisearch';

import { SelectTrashMode } from '@/modules/database/constants';

import { MeiliService } from '@/modules/meilisearch/meili.service';

import { PostEntity } from '../entities';
import { getSearchData, getSearchItem } from '../helpers';
import { CategoryRepository, CommentRepository, PostRepository } from '../repositories';

interface SearchOption {
    trashed?: SelectTrashMode;
    isPublished?: boolean;
    page?: number;
    limit?: number;
}

@Injectable()
export class SearchService implements OnModuleInit {
    index = 'content';

    protected _client: MeiliSearch;

    constructor(
        protected meiliService: MeiliService,
        protected categoryRepository: CategoryRepository,
        protected postRepository: PostRepository,
        protected commentRepository: CommentRepository,
        // private moduleRef: ModuleRef,
    ) {
        this._client = this.meiliService.getClient();
    }

    async onModuleInit() {
        await this.client.deleteIndex('content');
        this.client.index(this.index).updateFilterableAttributes(['deletedAt', 'publishedAt']);
        this.client.index(this.index).updateSortableAttributes(['updatedAt', 'commentCount']);
        const posts = await this.postRepository.buildBaseQB().withDeleted().getMany();
        await this.client
            .index(this.index)
            .addDocuments(
                await getSearchData(posts, this.categoryRepository, this.commentRepository),
            );
    }

    get client() {
        if (isNil(this._client)) throw new ForbiddenException('Has not any meilisearch client');
        return this._client;
    }

    async search(text: string, param: SearchOption = {}) {
        const options = { page: 1, limit: 10, trashed: SelectTrashMode.NONE, ...param };
        const limit = isNil(options.limit) || options.limit < 1 ? 1 : options.limit;
        const page = isNil(options.page) || options.page < 1 ? 1 : options.page;
        let filter = ['deletedAt IS NULL'];
        if (options.trashed === SelectTrashMode.ALL) {
            filter = [];
        } else if (options.trashed === SelectTrashMode.ONLY) {
            filter = ['deletedAt NOT IS NULL'];
        }
        if (options.isPublished) {
            filter.push('published IS NOT NULL');
        }
        const result = await this.client.index(this.index).search(text, {
            page,
            limit,
            sort: ['updatedAt:desc', 'commentCount:desc'],
            filter,
        });
        return {
            items: result.hits,
            currentPage: result.page,
            perPage: result.hitsPerPage,
            totalItems: result.estimatedTotalHits,
            itemCount: result.totalHits,
            ...omit(result, ['hits', 'page', 'hitsPerPage', 'estimatedTotalHits', 'totalHits']),
        };
    }

    async create(post: PostEntity) {
        return this.client
            .index(this.index)
            .addDocuments(
                await getSearchItem(this.categoryRepository, this.commentRepository, post),
            );
    }

    async update(posts: PostEntity[]) {
        return this.client
            .index(this.index)
            .updateDocuments(
                await getSearchData(posts, this.categoryRepository, this.commentRepository),
            );
    }

    async delete(ids: string[]) {
        return this.client.index(this.index).deleteDocuments(ids);
    }
}
