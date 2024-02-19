import { Optional } from '@nestjs/common';
import { isNil } from 'lodash';
import {
    DataSource,
    EntitySubscriberInterface,
    EntityTarget,
    EventSubscriber,
    InsertEvent,
    ObjectLiteral,
    ObjectType,
    RecoverEvent,
    RemoveEvent,
    SoftRemoveEvent,
    TransactionCommitEvent,
    TransactionRollbackEvent,
    TransactionStartEvent,
    UpdateEvent,
} from 'typeorm';

import { getCustomRepository } from '../helpers';
import { RepositoryType } from '../types';

type SubscriberEvent<E extends ObjectLiteral> =
    | InsertEvent<E>
    | UpdateEvent<E>
    | SoftRemoveEvent<E>
    | RemoveEvent<E>
    | RecoverEvent<E>
    | TransactionStartEvent
    | TransactionCommitEvent
    | TransactionRollbackEvent;

/**
 * 基础模型观察者
 */
@EventSubscriber()
export abstract class BaseSubscriber<E extends ObjectLiteral>
    implements EntitySubscriberInterface<E>
{
    /**
     * 监听的模型
     */
    protected abstract entity: ObjectType<E>;

    /**
     * 构造函数
     * @param dataSource
     */
    constructor(@Optional() protected dataSource?: DataSource) {
        if (!isNil(this.dataSource)) this.dataSource.subscribers.push(this);
    }

    protected getDataSource(event: SubscriberEvent<E>) {
        return this.dataSource ?? event.connection;
    }

    protected getManage(event: SubscriberEvent<E>) {
        return this.dataSource ? this.dataSource.manager : event.manager;
    }

    listenTo() {
        return this.entity;
    }

    async afterLoad(entity: any) {
        // 是否启用树形
        if ('parent' in entity && isNil(entity.depth)) entity.depth = 0;
    }

    protected getRepository<
        C extends ClassType<T>,
        T extends RepositoryType<E>,
        A extends EntityTarget<ObjectLiteral>,
    >(event: SubscriberEvent<E>, repository?: C, entity?: A) {
        return isNil(repository)
            ? this.getDataSource(event).getRepository(entity ?? this.entity)
            : getCustomRepository<T, E>(this.getDataSource(event), repository);
    }

    /**
     * 判断某个字段是否被更新
     * @param column
     * @param event
     */
    protected isUpdated(column: keyof E, event: UpdateEvent<E>) {
        return !!event.updatedColumns.find((item) => item.propertyName === column);
    }
}
