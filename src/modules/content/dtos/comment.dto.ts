import { PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';

import { toNumber } from 'lodash';

import { IsDataExist } from '@/modules/core/constraints';
import { DtoValidation } from '@/modules/core/decorators';
import { PaginateOptions } from '@/modules/database/types';

import { CommentEntity } from '../entities';

@DtoValidation({ type: 'query' })
export class QueryCommentDto implements PaginateOptions {
    @IsUUID(undefined, { message: 'ID格式错误' })
    @IsOptional()
    post?: string;

    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    page = 1;

    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '每页显示数据页必须大于1' })
    @IsNumber()
    @IsOptional()
    limit = 10;
}

/**
 * 评论树查询
 */
export class QueryCommentTreeDto extends PickType(QueryCommentDto, ['post']) {}

@DtoValidation()
export class CreateCommentDto {
    @MaxLength(1000, { message: '评论内容长度不得大于$constraint1个字' })
    @IsNotEmpty({ groups: ['create'], message: '评论内容不得为空' })
    body: string;

    @IsUUID(undefined, { message: 'ID格式错误' })
    @IsDefined({ message: 'ID必须制定' })
    post: string;

    @IsDataExist(CommentEntity, {
        message: '父评论不存在',
    })
    @IsUUID(undefined, { always: true, message: 'ID格式错误' })
    @ValidateIf(({ value }) => value.parent !== null && value.parent)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value.parent === 'null' ? null : value))
    parent?: string;
}
