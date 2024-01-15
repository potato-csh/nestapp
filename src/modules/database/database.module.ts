import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({})
export class DatabaseModule {
    static forRoot(configRegister: () => TypeOrmModuleOptions): DynamicModule {
        return {
            module: DatabaseModule,
            global: true,
            imports: [TypeOrmModule.forRoot(configRegister())],
        };
    }
}
