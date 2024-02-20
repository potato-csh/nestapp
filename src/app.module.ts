import { Module } from '@nestjs/common';

import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { content, database, meili } from './config';
import { ContentModule } from './modules/content/content.module';
import { CoreModule } from './modules/core/core.module';
import { AppIntercepter, AppPipe } from './modules/core/providers';
import { AppFilter } from './modules/core/providers/app.filter';
import { DatabaseModule } from './modules/database/database.module';
import { MeiliModule } from './modules/meilisearch/meili.moule';

@Module({
    imports: [
        ContentModule.forRoot(content),
        CoreModule.forRoot(),
        DatabaseModule.forRoot(database),
        MeiliModule.forRoot(meili),
    ],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new AppPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
                validationError: { target: false },
            }),
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: AppIntercepter,
        },
        {
            provide: APP_FILTER,
            useClass: AppFilter,
        },
    ],
})
export class AppModule {}
