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

import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { PostService } from '../services/post.service';

@Controller('posts')
export class PostController {
    constructor(protected postService: PostService) {}

    @Get()
    @SerializeOptions({ groups: ['post-list'] })
    async list(
        @Query()
        options: QueryPostDto,
    ) {
        return this.postService.paginate(options);
    }

    @Get(':id')
    @SerializeOptions({ groups: ['post-detail'] })
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.postService.detail(id);
    }

    @Post()
    @SerializeOptions({ groups: ['post-detail'] })
    async store(
        @Body()
        data: CreatePostDto,
    ) {
        return this.postService.create(data);
    }

    @Patch()
    @SerializeOptions({ groups: ['post-detail'] })
    async update(
        @Body()
        data: UpdatePostDto,
    ) {
        return this.postService.update(data);
    }

    @Delete()
    @SerializeOptions({ groups: ['post-list'] })
    async delete(
        @Body()
        data: DeleteWithTrashDto,
    ) {
        const { ids, trash } = data;
        return this.postService.delete(ids, trash);
    }

    @Patch('restore')
    @SerializeOptions({ groups: ['post-list'] })
    async restore(
        @Body()
        data: RestoreDto,
    ) {
        const { ids } = data;
        return this.postService.restore(ids);
    }
}
