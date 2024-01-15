import { Module } from '@nestjs/common';

import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';

@Module({
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService],
})
export class ContentModule {}
