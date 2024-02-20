import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDefined,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';
import { toNumber } from 'lodash';

import { DtoValidation } from '@/modules/core/decorators';
import { SelectTrashMode } from '@/modules/database/constants';
import { PaginateOptions } from '@/modules/database/types';

@DtoValidation({ type: 'query' })
export class QueryTagDto implements PaginateOptions {
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    page = 1;

    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    limit = 10;

    @IsEnum(SelectTrashMode)
    @IsOptional()
    trashed?: SelectTrashMode;
}

@DtoValidation({ groups: ['create'] })
export class CreateTagDto {
    @MaxLength(255, {
        always: true,
        message: '标签名长度不得大于$constranit1',
    })
    @IsNotEmpty({ groups: ['create'], message: '标签名必须填写' })
    @IsOptional({ groups: ['update'] })
    name: string;

    @MaxLength(500, {
        always: true,
        message: '标签描述长度不得大于$constranit1',
    })
    @IsOptional({ always: true })
    description?: string;
}

@DtoValidation({ groups: ['update'] })
export class UpdateTagDto extends PartialType(CreateTagDto) {
    @IsUUID(undefined, {
        groups: ['update'],
        message: 'ID格式错误',
    })
    @IsDefined({ groups: ['update'], message: 'ID必须制定' })
    id: string;
}
