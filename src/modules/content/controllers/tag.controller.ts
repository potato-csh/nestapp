import {
    Controller,
    Get,
    SerializeOptions,
    Query,
    Param,
    ParseUUIDPipe,
    Post,
    Body,
    Patch,
    Delete,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { Depends } from '@/modules/restful/decorators/depends.decorator';
import { DeleteWithTrashDto } from '@/modules/restful/dtos/delete-with-trash.dto';

import { PaginateDto } from '@/modules/restful/dtos/paginate.dto';

import { ContentModule } from '../content.module';
import { CreateTagDto, UpdateTagDto } from '../dtos';
import { TagService } from '../services';

@ApiTags('标签操作')
@Depends(ContentModule)
@Controller('tags')
export class TagController {
    constructor(protected service: TagService) {}

    /**
     * 查询标签列表
     * @param options
     */
    @Get()
    @SerializeOptions({})
    async list(
        @Query()
        options: PaginateDto,
    ) {
        return this.service.paginate(options);
    }

    /**
     * 查询标签详情
     * @param id
     */
    @Get(':id')
    @SerializeOptions({})
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id);
    }

    /**
     * 新增标签
     * @param data
     */
    @Post()
    @SerializeOptions({})
    async store(
        @Body()
        data: CreateTagDto,
    ) {
        return this.service.create(data);
    }

    /**
     * 更新标签
     * @param data
     */
    @Patch()
    @SerializeOptions({})
    async update(
        @Body()
        data: UpdateTagDto,
    ) {
        return this.service.update(data);
    }

    /**
     * 删除标签
     * @param data
     */
    @Delete()
    @SerializeOptions({})
    async delete(
        @Body()
        data: DeleteWithTrashDto,
    ) {
        const { ids, trash } = data;
        return this.service.delete(ids, trash);
    }
}
