import { isNil } from 'lodash';
import { FindTreeOptions, SelectQueryBuilder } from 'typeorm';

import { BaseTreeRepository } from '@/modules/database/base/tree.repository';
import { CustomRepository } from '@/modules/database/decorators';

import { QueryParams } from '@/modules/database/types';

import { CommentEntity } from '../entities';

type FindCommentTreeOptions = FindTreeOptions & {
    addQuery?: (query: SelectQueryBuilder<CommentEntity>) => SelectQueryBuilder<CommentEntity>;
};

@CustomRepository(CommentEntity)
export class CommentRepository extends BaseTreeRepository<CommentEntity> {
    protected _qbName = 'comment';

    protected orderBy = 'createdAt';

    /**
     * 构建基础查询器
     * @param qb
     */
    buildBaseQB(qb: SelectQueryBuilder<CommentEntity>): SelectQueryBuilder<CommentEntity> {
        return super.buildBaseQB(qb).leftJoinAndSelect(`${this.qbName}.post`, 'post');
    }

    /**
     * 查询树
     * @param options
     */
    async findTrees(
        options: FindCommentTreeOptions & QueryParams<CommentEntity> & { post?: string } = {},
    ) {
        return super.findTrees({
            ...options,
            addQuery: async (qb) => {
                return isNil(options.post) ? qb : qb.where('post.id = :id', { id: options.post });
            },
        });
    }
}
