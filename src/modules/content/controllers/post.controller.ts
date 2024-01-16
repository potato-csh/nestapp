import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';

import { PaginateOptions } from '@/modules/database/types';

import { PostService } from '../services/post.service';

@Controller('posts')
export class PostController {
    constructor(private postService: PostService) {}

    @Get()
    async list(
        @Query()
        options: PaginateOptions,
    ) {
        return this.postService.paginate(options);
    }

    @Get(':id')
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.postService.detail(id);
    }

    @Post()
    async store(
        @Body()
        data: Record<string, any>,
    ) {
        return this.postService.create(data);
    }

    @Patch()
    async update(
        @Body()
        data: Record<string, any>,
    ) {
        return this.postService.update(data);
    }

    @Delete(':id')
    async delete(
        @Param('id', new ParseIntPipe())
        id: string,
    ) {
        return this.postService.delete(id);
    }
}
