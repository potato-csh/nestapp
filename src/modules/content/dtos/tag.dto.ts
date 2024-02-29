import { PartialType } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

import { IsUnique } from '@/modules/core/constraints/unique.constraint';
import { IsUniqueExist } from '@/modules/core/constraints/unique.exist.constraint';
import { DtoValidation } from '@/modules/core/decorators';

import { TagEntity } from '../entities';

/**
 * 新增标签验证
 */
@DtoValidation({ groups: ['create'] })
export class CreateTagDto {
    /**
     * 标签名称
     */
    @IsUnique(TagEntity, {
        groups: ['create'],
        message: '标签名称重复',
    })
    @IsUniqueExist(TagEntity, {
        groups: ['update'],
        message: '标签名称重复',
    })
    @MaxLength(255, {
        always: true,
        message: '标签名长度不得大于$constranit1',
    })
    @IsNotEmpty({ groups: ['create'], message: '标签名必须填写' })
    @IsOptional({ groups: ['update'] })
    name: string;

    /**
     * 标签详情
     */
    @MaxLength(500, {
        always: true,
        message: '标签描述长度不得大于$constranit1',
    })
    @IsOptional({ always: true })
    description?: string;
}

/**
 * 更新标签验证
 */
@DtoValidation({ groups: ['update'] })
export class UpdateTagDto extends PartialType(CreateTagDto) {
    /**
     * 待更新ID
     */
    @IsUUID(undefined, {
        groups: ['update'],
        message: 'ID格式错误',
    })
    @IsDefined({ groups: ['update'], message: 'ID必须制定' })
    id: string;
}
