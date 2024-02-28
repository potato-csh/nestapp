import { Controller, Get, SerializeOptions, Query, Post, Body, Delete } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { Depends } from '@/modules/restful/decorators/depends.decorator';
import { DeleteDto } from '@/modules/restful/dtos/delete.dto';

import { ContentModule } from '../content.module';
import { QueryCommentTreeDto, QueryCommentDto, CreateCommentDto } from '../dtos';
import { CommentService } from '../services';

@ApiTags('评论操作')
@Depends(ContentModule)
@Controller('comments')
export class CommentController {
    constructor(protected service: CommentService) {}

    @Get('tree')
    @SerializeOptions({ groups: ['comment-tree'] })
    async tree(
        @Query()
        query: QueryCommentTreeDto,
    ) {
        return this.service.findTrees(query);
    }

    @Get()
    @SerializeOptions({ groups: ['comment-list'] })
    async list(
        @Query()
        query: QueryCommentDto,
    ) {
        return this.service.paginate(query);
    }

    @Post()
    @SerializeOptions({ groups: ['comment-detail'] })
    async store(
        @Body()
        data: CreateCommentDto,
    ) {
        return this.service.create(data);
    }

    @Delete()
    @SerializeOptions({ groups: ['comment-list'] })
    async delete(
        @Body()
        data: DeleteDto,
    ) {
        const { ids } = data;
        return this.service.delete(ids);
    }
}
