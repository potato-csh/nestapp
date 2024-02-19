import { Optional } from '@nestjs/common';
import { DataSource, EventSubscriber } from 'typeorm';

import { BaseSubscriber } from '@/modules/database/base/subcriber';

import { PostBodyType } from '../constants';
import { PostEntity } from '../entities/post.entity';
import { PostRepository } from '../repositories';
import { SanitizeService } from '../services';

@EventSubscriber()
export class PostSubscriber extends BaseSubscriber<PostEntity> {
    protected entity = PostEntity;

    constructor(
        protected dataSource: DataSource,
        protected postRepository: PostRepository,
        @Optional() protected sanitizeService?: SanitizeService,
    ) {
        super(dataSource);
    }

    listenTo() {
        return PostEntity;
    }

    /**
     * 加载文章数据的处理
     * @param entity
     */
    async afterLoad(entity: PostEntity) {
        if (entity.type === PostBodyType.HTML) {
            entity.body = this.sanitizeService.sanitize(entity.body);
        }
    }
}
