import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Entity,
    OneToMany,
    PrimaryColumn,
    Relation,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';

import { PostEntity } from './post.entity';

@Exclude()
@Tree('materialized-path')
@Entity('content_categories')
export class CategoryEntity extends BaseEntity {
    @Expose()
    @PrimaryColumn({ type: 'varchar', generated: 'uuid', length: 36 })
    id: string;

    @Expose()
    @PrimaryColumn({ comment: '分类名称' })
    name: string;

    @Expose({ groups: ['category-tree', 'category-list', 'category-detail'] })
    @PrimaryColumn({ comment: '分类排序', default: 0 })
    customOrder: number;

    @OneToMany(() => PostEntity, (post) => post.category, {
        cascade: true,
    })
    posts: Relation<PostEntity[]>;

    @Expose({ groups: ['category-list'] })
    depth = 0;

    @Expose({ groups: ['category-list', 'category-detail'] })
    @TreeParent({ onDelete: 'NO ACTION' })
    @Type(() => CategoryEntity)
    parent: Relation<CategoryEntity> | null;

    @Expose({ groups: ['category-tree'] })
    @TreeChildren({ cascade: true })
    @Type(() => CategoryEntity)
    children: Relation<CategoryEntity>[];
}