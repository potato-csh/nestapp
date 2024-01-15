import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    ValidationPipe,
} from '@nestjs/common';

import { CreatePostDto } from '../dtos/create-post.dto';
import { UpdatePostDto } from '../dtos/update-post.dto';
import { PostService } from '../services/post.service';

// const posts: PostEntity[] = [
//     { title: '第一篇文章标题', body: '第一篇文章内容' },
//     { title: '第二篇文章标题', body: '第二篇文章内容' },
//     { title: '第三篇文章标题', body: '第三篇文章内容' },
//     { title: '第四篇文章标题', body: '第四篇文章内容' },
//     { title: '第五篇文章标题', body: '第五篇文章内容' },
//     { title: '第六篇文章标题', body: '第六篇文章内容' },
// ].map((v, id) => ({ ...v, id }));

@Controller('posts')
export class PostController {
    constructor(private postService: PostService) {}

    @Get()
    async index() {
        return this.postService.findAll();
    }

    @Get(':id')
    async show(@Param('id', new ParseIntPipe()) id: number) {
        return this.postService.findOne(id);
    }

    @Post()
    async store(
        @Body(
            new ValidationPipe({
                transform: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
                validationError: { target: false },
                groups: ['create'],
            }),
        )
        data: CreatePostDto,
    ) {
        return this.postService.create(data);
    }

    @Patch()
    async update(
        @Body(
            new ValidationPipe({
                transform: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
                validationError: { target: false },
                groups: ['update'],
            }),
        )
        data: UpdatePostDto,
    ) {
        return this.postService.update(data);
    }

    @Delete(':id')
    async delete(@Param('id', new ParseIntPipe()) id: number) {
        return this.postService.delete(id);
    }
}
