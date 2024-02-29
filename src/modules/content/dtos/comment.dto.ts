import { PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsOptional, IsUUID, MaxLength, ValidateIf } from 'class-validator';

import { IsDataExist } from '@/modules/core/constraints';
import { DtoValidation } from '@/modules/core/decorators';

import { PaginateDto } from '@/modules/restful/dtos/paginate.dto';

import { CommentEntity } from '../entities';

/**
 * 评论分页查询验证
 */
@DtoValidation({ type: 'query' })
export class QueryCommentDto extends PaginateDto {
    /**
     * 所属文章ID
     */
    @IsUUID(undefined, { message: 'ID格式错误' })
    @IsOptional()
    post?: string;
}

/**
 * 评论树查询
 */
export class QueryCommentTreeDto extends PickType(QueryCommentDto, ['post']) {}

/**
 * 新增评论验证
 */
@DtoValidation()
export class CreateCommentDto {
    /**
     * 评论内容
     */
    @MaxLength(1000, { message: '评论内容长度不得大于$constraint1个字' })
    @IsNotEmpty({ groups: ['create'], message: '评论内容不得为空' })
    body: string;

    /**
     * 所属文章ID
     */
    @IsUUID(undefined, { message: 'ID格式错误' })
    @IsDefined({ message: 'ID必须制定' })
    post: string;

    /**
     * 上级评论ID
     */
    @IsDataExist(CommentEntity, {
        message: '父评论不存在',
    })
    @IsUUID(undefined, { always: true, message: 'ID格式错误' })
    @ValidateIf((value) => value.parent !== null && value.parent)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value === 'null' ? null : value))
    parent?: string;
}
