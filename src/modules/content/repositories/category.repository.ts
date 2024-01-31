import { pick, unset } from 'lodash';
import { FindOptionsUtils, FindTreeOptions, TreeRepository } from 'typeorm';

import { CustomRepository } from '@/modules/database/decorators';

import { CategoryEntity } from '../entities';

@CustomRepository(CategoryEntity)
export class CategoryRepository extends TreeRepository<CategoryEntity> {
    buildBaseQB() {
        return this.createQueryBuilder('category').leftJoinAndSelect('category.parent', 'parent');
    }

    /**
     * 树形结构查询
     * @param options
     */
    async findTrees(
        options?: FindTreeOptions & {
            onlyTrashed?: boolean;
            withTrashed?: boolean;
        },
    ) {
        const roots = await this.findRoots(options);
        await Promise.all(roots.map((root) => this.findDescendantsTree(root, options)));
        return roots;
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

    /**
     * 打开并展开树
     * @param trees
     * @param depth
     * @param parent
     */
    async toFlatTrees(trees: CategoryEntity[], depth = 0, parent: CategoryEntity | null = null) {
        const data: Omit<CategoryEntity, 'children'>[] = [];
        for (const item of trees) {
            item.depth = depth;
            item.parent = parent;
            const { children } = item;
            unset(item, 'children');
            data.push(item);
            data.push(...(await this.toFlatTrees(children, depth + 1, item)));
        }
        return data as CategoryEntity[];
    }
}
