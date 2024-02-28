import { PartialType } from '@nestjs/swagger';
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

import { IsDataExist } from '@/modules/core/constraints/data.exist.constraint';
import { IsTreeUniqueExist } from '@/modules/core/constraints/tree.exist.contraint';
import { IsTreeUnique } from '@/modules/core/constraints/tree.unique.constraint';
import { DtoValidation } from '@/modules/core/decorators';

import { CategoryEntity } from '../entities/category.entity';

/**
 * 新增分类验证
 */
@DtoValidation({ groups: ['create'] })
export class CreateCategoryDto {
    /**
     * 分类名称
     */
    @IsTreeUnique(CategoryEntity, {
        groups: ['create'],
        message: '分类名称重复',
    })
    @IsTreeUniqueExist(CategoryEntity, {
        groups: ['update'],
        message: '名称重复',
    })
    @MaxLength(25, {
        always: true,
        message: '分类名称不得大于$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '分类必须填写' })
    @IsOptional({ groups: ['update'] })
    name: string;

    /**
     * 父分类ID
     */
    @IsDataExist(CategoryEntity, { always: true, message: '父分类不存在' })
    @IsUUID(undefined, { always: true, message: '父分类ID格式错误' })
    @ValidateIf((value) => value.parent !== null && value.parent)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value === 'null' ? null : value))
    parent?: string;

    /**
     * 自定义排序
     */
    @Transform(({ value }) => toNumber(value))
    @Min(0, { always: true, message: '排序值必须大于0' })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    customOrder = 0;
}

/**
 * 更新分类验证
 */
@DtoValidation({ groups: ['update'] })
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    /**
     * 待更新ID
     */
    @IsUUID(undefined, { groups: ['update'], message: 'ID格式错误' })
    @IsDefined({ groups: ['update'], message: 'ID必须指定' })
    id: string;
}
