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
import { RestoreDto } from '@/modules/restful/dtos/restore.dto';

import { ContentModule } from '../content.module';
import { CreateTagDto, UpdateTagDto } from '../dtos';
import { TagService } from '../services';

@ApiTags('标签操作')
@Depends(ContentModule)
@Controller('tags')
export class TagController {
    constructor(protected service: TagService) {}

    @Get()
    @SerializeOptions({})
    async list(
        @Query()
        options: PaginateDto,
    ) {
        return this.service.paginate(options);
    }

    @Get(':id')
    @SerializeOptions({})
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id);
    }

    @Post()
    @SerializeOptions({})
    async store(
        @Body()
        data: CreateTagDto,
    ) {
        return this.service.create(data);
    }

    @Patch()
    @SerializeOptions({})
    async update(
        @Body()
        data: UpdateTagDto,
    ) {
        return this.service.update(data);
    }

    @Delete()
    @SerializeOptions({})
    async delete(
        @Body()
        data: DeleteWithTrashDto,
    ) {
        const { ids, trash } = data;
        return this.service.delete(ids, trash);
    }

    @Patch('restore')
    @SerializeOptions({})
    async restore(
        @Body()
        data: RestoreDto,
    ) {
        const { ids } = data;
        return this.service.restore(ids);
    }
}
