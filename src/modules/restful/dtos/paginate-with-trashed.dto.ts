import { IsEnum, IsOptional } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { SelectTrashMode } from '@/modules/database/constants';

import { PaginateDto } from './paginate.dto';

/**
 * 带软删除的分页数据查询验证
 */
@DtoValidation({ type: 'query' })
export class PaginateWithTrashedDto extends PaginateDto {
    /**
     * 根据软删除状态查询
     */
    @IsEnum(SelectTrashMode)
    @IsOptional()
    trashed?: SelectTrashMode;
}
