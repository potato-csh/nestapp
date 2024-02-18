import { isNil, unset } from 'lodash';
import {
    EntityManager,
    EntityTarget,
    FindOptionsUtils,
    FindTreeOptions,
    ObjectLiteral,
    QueryRunner,
    SelectQueryBuilder,
    TreeRepository,
    TreeRepositoryUtils,
} from 'typeorm';

import { OrderType, TreeChildrenResolve } from '../constants';
import { getOrderByQuery } from '../helpers';
import { OrderQueryType, QueryParams } from '../types';

/**
 * 基本树形存储类
 */
export abstract class BaseTreeRepository<E extends ObjectLiteral> extends TreeRepository<E> {
    /**
     * 构建查询时默认的模型对应的查询名称
     */
    protected abstract _qbName: string;

    /**
     * 查询器名称
     */
    protected _qbName = 'treeEntity';

    /**
     * 删除父分类后提升子分类的等级
     */
    protected _childrenResolve?: TreeChildrenResolve;

    /**
     * 默认排序规则，可以通过每个方法的orderBy选项进行覆盖
     */
    protected orderBy?: string | { name: string; order: `${OrderType}` };

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(target: EntityTarget<E>, manager: EntityManager, queryRunner?: QueryRunner) {
        super(target, manager, queryRunner);
    }

    /**
     * 返回查询器名称
     */
    get qbName() {
        return this._qbName;
    }

    /**
     * 返回子分类的等级
     */
    get childrenResolve() {
        return this._childrenResolve;
    }

    /**
     * 构建基础查询器
     */
    buildBaseQB(qb?: SelectQueryBuilder<E>): SelectQueryBuilder<E> {
        const queryBuilder = qb ?? this.createQueryBuilder(this.qbName);
        return queryBuilder.leftJoinAndSelect(`${this.qbName}.parent`, 'parent');
    }

    /**
     * 生成排序的QueryBuilder
     * @param qb
     * @param orderBy
     */
    addOrderByQuery(qb: SelectQueryBuilder<E>, orderBy?: OrderQueryType) {
        const orderByQuery = orderBy ?? this.orderBy;
        return !isNil(orderBy) ? getOrderByQuery(qb, this.qbName, orderByQuery) : qb;
    }

    /**
     * 查询树形分类
     * @param options
     */
    async findTrees(options?: FindTreeOptions & QueryParams<E>) {
        const roots = await this.findRoots(options);
        await Promise.all(roots.map((root) => this.findDescendantsTree(root, options)));
        return roots;
    }

    /**
     * 查询后代树
     * @param entity
     * @param options
     */
    async findDescendantsTree(entity: E, options?: FindTreeOptions & QueryParams<E>) {
        const { addQuery, orderBy, withTrashed, onlyTrashed } = options ?? {};
        let qb = this.buildBaseQB(
            this.createDescendantsQueryBuilder(this.qbName, 'treeClosure', entity),
        );
        qb = addQuery
            ? await addQuery(this.addOrderByQuery(qb, orderBy))
            : this.addOrderByQuery(qb, orderBy);
        if (withTrashed) {
            qb.withDeleted();
            if (onlyTrashed) qb.where(`${this.qbName}.deletedAt IS NOT NULL`);
        }
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);

        const entities = await qb.getRawAndEntities();
        const relationMaps = TreeRepositoryUtils.createRelationMaps(
            this.manager,
            this.metadata,
            this.qbName,
            entities.raw,
        );
        TreeRepositoryUtils.buildChildrenEntityTree(
            this.metadata,
            entity,
            entities.entities,
            relationMaps,
            {
                depth: -1,
                ...options,
            },
        );

        return entity;
    }

    /**
     * 打平并展开树
     */
    async toFlatTrees(trees: E[], depth = 0, parent: E | null = null) {
        const data: Omit<E, 'children'>[] = [];
        for (const item of trees) {
            (item as any).depth = depth;
            (item as any).parent = parent;
            const { children } = item;
            unset(item, 'children');
            data.push(item);
            data.push(...(await this.toFlatTrees(children, depth + 1, item)));
        }
        return data as E[];
    }
}
