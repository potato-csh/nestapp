import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { isNil } from 'lodash';
import { In, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { SelectTrashMode, TreeChildrenResolve } from '../constants';
import { paginate, treePaginate } from '../helpers';
import { PaginateOptions, QueryHook, ServiceListQueryOption } from '../types';

import { BaseRepository } from './repository';
import { BaseTreeRepository } from './tree.repository';

/**
 * CRUD操作服务
 */
export abstract class BaseService<
    E extends ObjectLiteral,
    R extends BaseRepository<E> | BaseTreeRepository<E>,
    P extends ServiceListQueryOption<E> = ServiceListQueryOption<E>,
> {
    /**
     * 服务默认存储类
     */
    protected repository: R;

    /**
     * 是否开启软删除功能
     */
    protected enableTrash = false;

    constructor(repository: R) {
        this.repository = repository;
        if (
            !(
                this.repository instanceof BaseRepository ||
                this.repository instanceof BaseTreeRepository
            )
        ) {
            throw new Error(
                'Repository must instanceof BaseRepository or BaseTreeRepository in DataService!',
            );
        }
    }

    /**
     * 获取数据列表
     * @param options
     * @param callback
     */
    async list(options?: P, callback?: QueryHook<E>) {
        const { trashed: isTrashed = false } = options ?? {};
        const trashed = isTrashed || SelectTrashMode.NONE;
        if (this.repository instanceof BaseTreeRepository) {
            const withTrashed =
                this.enableTrash &&
                (trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY);
            const onlyTrashed = this.enableTrash && trashed === SelectTrashMode.NONE;
            const tree = await this.repository.findTrees({ ...options, withTrashed, onlyTrashed });
            return this.repository.toFlatTrees(tree);
        }
        const qb = await this.buildListQB(this.repository.buildBaseQB(), options, callback);
        return qb.getMany();
    }

    /**
     * 获取分页数据
     * @param options
     * @param callback
     */
    async paginate(options?: PaginateOptions & P, callback?: QueryHook<E>) {
        const queryOptions = (options ?? {}) as P;
        if (this.repository instanceof BaseTreeRepository) {
            const data = await this.list(queryOptions, callback);
            return treePaginate(options, data);
        }
        const qb = await this.buildListQB(this.repository.buildBaseQB(), options, callback);
        return paginate(qb, options);
    }

    /**
     * 获取数据详情
     * @param id
     * @param callback
     */
    async detail(id: string, callback?: QueryHook<E>) {
        const qb = await this.buildItemQB(id, this.repository.buildBaseQB(), callback);
        const item = qb.getOne();
        if (!item) throw new NotFoundException(`${this.repository.qbName} ${id} not exist!`);
        return item;
    }

    /**
     * 批量删除数据
     * @param ids
     * @param trash
     */
    async delete(ids: string[], trash?: boolean) {
        let items: E[] = [];
        if (this.repository instanceof BaseTreeRepository) {
            items = await this.repository.find({
                where: { id: In(ids) as any },
                withDeleted: this.enableTrash ? true : undefined,
                relations: ['parent', 'children'],
            });
            if (this.repository.childrenResolve === TreeChildrenResolve.UP) {
                for (const item of items) {
                    if (isNil(item.children) || item.children.length <= 0) continue;
                    const nchildren = [...item.children].map((c) => {
                        c.parent = item.parent;
                        return item;
                    });
                    await this.repository.save(nchildren);
                }
            }
        } else {
            items = await this.repository.find({
                where: { id: In(ids) as any },
                withDeleted: this.enableTrash ? true : undefined,
            });
        }
        if (this.enableTrash && trash) {
            const directs = items.filter((item) => !isNil(item.deletedAt));
            const softs = items.filter((item) => isNil(item.deletedAt));
            return [
                ...(await this.repository.remove(directs)),
                ...(await this.repository.softRemove(softs)),
            ];
        }
        return this.repository.remove(items);
    }

    /**
     * 批量恢复回收站中的数据
     * @param ids
     */
    async restore(ids: string[]) {
        if (!this.enableTrash) {
            throw new ForbiddenException(
                `Can not restore ${this.repository.qbName}, because trash not enabled!`,
            );
        }
        const items = await this.repository.find({
            where: { id: In(ids) as any },
            withDeleted: true,
        });
        const trashed = items.filter((item) => !isNil(item)).map((item) => item.id);
        if (trashed.length < 1) return [];
        this.repository.restore(trashed);
        const qb = await this.buildListQB(
            this.repository.buildBaseQB(),
            undefined,
            async (builder) => builder.andWhereInIds(trashed),
        );
        return qb.getMany();
    }

    /**
     * 创建数据，如果子类没有实现则抛出404错误
     * @param data
     * @param others
     */
    create(data: any, ...others: any[]) {
        throw new ForbiddenException(`Can not to create ${this.repository.qbName}!`);
    }

    /**
     * 更新数据，如果子类没有实现则抛出404错误
     * @param data
     * @param others
     */
    update(data: any, ...others: any[]) {
        throw new ForbiddenException(`Can not to update ${this.repository.qbName}!`);
    }

    /**
     * 查询获取单个项目的QueryBuilder
     * @param id
     * @param qb
     * @param callback
     */
    protected async buildItemQB(id: string, qb: SelectQueryBuilder<E>, callback?: QueryHook<E>) {
        qb.where(`${this.repository.qbName}.id = :id`, { id });
        if (callback) return callback(qb);
        return qb;
    }

    /**
     * 查询获取数据列表的QueryBuilder
     * @param qb
     * @param options
     * @param callback
     */
    protected async buildListQB(qb: SelectQueryBuilder<E>, options?: P, callback?: QueryHook<E>) {
        const { trashed } = options ?? {};
        const qureyName = this.repository.qbName;
        // 是否查询回收站
        if (
            this.enableTrash &&
            (trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY)
        ) {
            qb.withDeleted();
            if (trashed === SelectTrashMode.ONLY) qb.where(`${qureyName}.deletedAt IS NOT  NUll`);
        }
        if (callback) return callback(qb);
        return qb;
    }
}
