import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    SerializeOptions,
} from '@nestjs/common';

import { DeleteWithTrashDto } from '@/modules/restful/dtos/delete-with-trash.dto';

import { RestoreDto } from '@/modules/restful/dtos/restore.dto';

import {
    CreateCategoryDto,
    QueryCategoryDto,
    QueryCategoryTreeDto,
    UpdateCategoryDto,
} from '../dtos';
import { CategoryService } from '../services/category.service';

@Controller('categories')
export class CategoryController {
    constructor(protected service: CategoryService) {}

    @Get('tree')
    @SerializeOptions({ groups: ['category-tree'] })
    async tree(
        @Query()
        options: QueryCategoryTreeDto,
    ) {
        return this.service.findTrees(options);
    }

    @Get()
    @SerializeOptions({ groups: ['category-list'] })
    async list(
        @Query()
        options: QueryCategoryDto,
    ) {
        return this.service.paginate(options);
    }

    @Get(':id')
    @SerializeOptions({ groups: ['category-detail'] })
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id);
    }

    @Post()
    @SerializeOptions({ groups: ['category-detail'] })
    async store(
        @Body()
        data: CreateCategoryDto,
    ) {
        return this.service.create(data);
    }

    @Patch()
    @SerializeOptions({ groups: ['category-detail'] })
    async update(
        @Body()
        data: UpdateCategoryDto,
    ) {
        return this.service.update(data);
    }

    @Delete()
    @SerializeOptions({ groups: ['category-detail'] })
    async delete(
        @Body()
        data: DeleteWithTrashDto,
    ) {
        const { ids, trash } = data;
        return this.service.delete(ids, trash);
    }

    @Patch('restore')
    async restore(
        @Body()
        data: RestoreDto,
    ) {
        const { ids } = data;
        return this.service.restore(ids);
    }
}
