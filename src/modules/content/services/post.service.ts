import { Injectable } from '@nestjs/common';

import { IsNull, Not, SelectQueryBuilder } from 'typeorm';

import { QueryHook } from '@/modules/database/types';

import { PostOrderType } from '../constants';
import { PostEntity } from '../entities/post.entity';
import { PostRepository } from '../repositories';

@Injectable()
export class PostService {
    constructor(protected respository: PostRepository) {}

    // async paginate(options: PaginateOptions, callback?: QueryHook<PostEntity>) {
    //     const qb = await this.
    // }

    /**
     * 构建文章列表查询器
     * @param qb
     * @param options
     * @param callback
     */
    protected async buildListQuery(
        qb: SelectQueryBuilder<PostEntity>,
        options: Record<string, any>,
        callback?: QueryHook<PostEntity>,
    ) {
        const { orderBy, isPublished } = options;
        let newQb = qb;
        if (typeof isPublished === 'boolean') {
            newQb = isPublished
                ? newQb.where({ publishedAt: Not(IsNull()) })
                : newQb.where({ publishedAt: IsNull() });
        }
        newQb = this.queryOrderBy(newQb, orderBy);
        if (callback) return callback(newQb);
        return newQb;
    }

    /**
     * 对文章进行排序的Query构建
     * @param qb
     * @param orderBy
     */
    protected async queryOrderBy(qb: SelectQueryBuilder<PostEntity>, orderBy?: PostOrderType) {
        switch (orderBy) {
            case PostOrderType.CREATED:
                return qb.orderBy('post.createdAt', 'DESC');
            case PostOrderType.UPDATED:
                return qb.orderBy('post.updateAt', 'DESC');
            case PostOrderType.PUBLISHED:
                return qb.orderBy('post.publishedAt', 'DESC');
            case PostOrderType.CUSTOM:
                return qb.orderBy('post.customOrder', 'DESC');
            default:
                return qb
                    .orderBy('post.createdAt', 'DESC')
                    .addOrderBy('post.updatedAt', 'DESC')
                    .addOrderBy('post.publishedAt', 'DESC');
        }
    }
}
