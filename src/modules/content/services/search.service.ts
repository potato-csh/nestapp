import { ForbiddenException, Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';

import { isNil, omit, pick } from 'lodash';

import MeiliSearch from 'meilisearch';

import { SelectTrashMode } from '@/modules/database/constants';

import { MeiliService } from '@/modules/meilisearch/meili.service';

import { PostEntity } from '../entities';
import { CategoryRepository, CommentRepository } from '../repositories';

interface SearchOption {
    trashed?: SelectTrashMode;
    isPublished?: boolean;
    page?: number;
    limit?: number;
}

async function getPostData(
    catRepo: CategoryRepository,
    cmtRepo: CommentRepository,
    post: PostEntity,
) {
    const categories = [
        ...(await catRepo.findAncestors(post.category)).map((item) => ({
            id: item.id,
            name: item.name,
        })),
        { id: post.category.id, name: post.category.name },
    ];
    const comments = (
        await cmtRepo.find({
            relations: ['post'],
            where: { post: { id: post.id } },
        })
    ).map((item) => ({
        id: item.id,
        body: item.body,
    }));

    return [
        {
            ...pick(instanceToPlain(post), [
                'id',
                'title',
                'body',
                'summary',
                'commentCount',
                'deletedAt',
                'publishedAt',
                'createdAt',
                'updatedAt',
            ]),
            categories,
            tags: post.tags.map((item) => ({ id: item.id, name: item.name })),
            comments,
        },
    ];
}

@Injectable()
export class SearchService {
    index = 'content';

    protected _client: MeiliSearch;

    constructor(
        protected meiliService: MeiliService,
        protected categoryRepository: CategoryRepository,
        protected commentRepository: CommentRepository,
    ) {
        this._client = this.meiliService.getClient();
    }

    get client() {
        if (isNil(this._client)) throw new ForbiddenException('Has not any meilisearch client');
        return this._client;
    }

    async search(text: string, param: SearchOption = {}) {
        await this.client.index(this.index).addDocuments([]);
        this.client.index(this.index).updateFilterableAttributes(['deletedAt', 'publishedAt']);
        this.client.index(this.index).updateSortableAttributes(['updatedAt', 'commentCount']);
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
        console.log('res:', result);
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
            .addDocuments(await getPostData(this.categoryRepository, this.commentRepository, post));
    }

    async update(posts: PostEntity[]) {
        return this.client
            .index(this.index)
            .updateDocuments(
                await Promise.all(
                    posts.map((post) =>
                        getPostData(this.categoryRepository, this.commentRepository, post),
                    ),
                ),
            );
    }

    async delete(ids: string[]) {
        return this.client.index(this.index).deleteDocuments(ids);
    }
}
