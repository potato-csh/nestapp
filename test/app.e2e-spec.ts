/* eslint-disable jest/expect-expect */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { Configure } from '@/modules/config/configure';
import { createBootModule } from '@/modules/core/helpers/app';
import { createOptions } from '@/options';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const configure = new Configure();
        const { config, modules } = createOptions;
        configure.initilize(config.factories, config.storage);
        const BootModule = await createBootModule(configure, {
            modules,
        });

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [BootModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/ (GET)', () => {
        return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
    });
});
