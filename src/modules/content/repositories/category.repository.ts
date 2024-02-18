import { isNil, pick, unset } from 'lodash';
import { FindOptionsUtils, FindTreeOptions } from 'typeorm';

import { BaseTreeRepository } from '@/modules/database/base/tree.repository';
import { OrderType, TreeChildrenResolve } from '@/modules/database/constants';
import { CustomRepository } from '@/modules/database/decorators';

import { CategoryEntity } from '../entities';

@CustomRepository(CategoryEntity)
export class CategoryRepository extends BaseTreeRepository<CategoryEntity> {
    protected _qbName = 'category';

    protected orderBy = { name: 'customOrder', order: OrderType.ASC };

    protected _childrenResolve = TreeChildrenResolve.UP;

    async flatAncestorsTree(item: CategoryEntity) {
        let data: Omit<CategoryEntity, 'children'>[] = [];
        const category = await this.findAncestorsTree(item);
        const { parent } = category;
        unset(category, 'children');
        unset(category, 'parent');
        data.push(item);
        if (!isNil(parent)) data = [...(await this.flatAncestorsTree(parent)), ...data];
        return data as CategoryEntity[];
    }

    /**
     * 查询顶级分类
     * @param options
     */
    findRoots(
        options?: FindTreeOptions & {
            onlyTrashed?: boolean;
            withTrashed?: boolean;
        },
    ) {
        // 防止sql注入攻击
        const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);

        // 获取树状结构的父子关系的连接列信息
        const joinColumn = this.metadata.treeParentRelation!.joinColumns[0];
        // 获取父节点属性的名称，可能是数据库的列名
        const parentPropertyName = joinColumn.givenDatabaseName || joinColumn.databaseName;

        // 构建基本的查询器，并安装'category.customOrder' 升序排序
        const qb = this.buildBaseQB().orderBy('category.customOrder', 'ASC');
        qb.where(`${escapeAlias('category')}.${escapeColumn(parentPropertyName)} IS NULL`);
        // 将树状查询选项应用于查询构建器
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, pick(options, ['relations', 'depth']));
        if (options?.withTrashed) {
            qb.withDeleted();
            if (options?.onlyTrashed) qb.where(`category.deteledAt IS NOT NULL`);
        }
        return qb.getMany();
    }

    /**
     * 查询后代分类
     * @param entities
     * @param options
     */
    findDescendants(
        entity: CategoryEntity,
        options?: FindTreeOptions & {
            onlyTrashed?: boolean;
            withTrashed?: boolean;
        },
    ) {
        const qb = this.createDescendantsQueryBuilder('category', 'treeClosure', entity);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        qb.orderBy('category.customOrder', 'ASC');
        if (options?.withTrashed) {
            qb.withDeleted();
            if (options?.onlyTrashed) qb.where(`category.deletedAt IS NOT NULL`);
        }
        return qb.getMany();
    }

    /**
     * 查询祖先分类
     * @param entity
     * @param options
     */
    findAncestors(
        entity: CategoryEntity,
        options?: FindTreeOptions & {
            onlyTrashed?: boolean;
            withTrashed?: boolean;
        },
    ) {
        const qb = this.createAncestorsQueryBuilder('category', 'treeClosure', entity);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        qb.orderBy('category.customOrder', 'ASC');
        if (options?.withTrashed) {
            qb.withDeleted();
            if (options?.onlyTrashed) qb.where(`category.deletedAt IS NOT NULL`);
        }

        return qb.getMany();
    }

    /**
     * 统计后代元素的数量
     * @param entity
     * @param options
     */
    async countDescendants(
        entity: CategoryEntity,
        options?: { withTrashed?: boolean; onlyTrashed?: boolean },
    ) {
        const qb = this.createDescendantsQueryBuilder('category', 'treeClosure', entity);
        if (options?.withTrashed) {
            qb.withDeleted();
            if (options?.onlyTrashed) qb.where(`category.deletedAt IS NOT NULL`);
        }
        return qb.getCount();
    }

    async countAncestors(
        entity: CategoryEntity,
        options?: { withTrashed?: boolean; onlyTrashed?: boolean },
    ) {
        const qb = this.createAncestorsQueryBuilder('category', 'treeClosure', entity);
        if (options?.withTrashed) {
            qb.withDeleted();
            if (options?.onlyTrashed) qb.where(`category.deletedAt IS NOT NULL`);
        }
        return qb.getCount();
    }
}
