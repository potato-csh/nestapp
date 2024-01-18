import { Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsOptional, IsUUID, MaxLength, ValidateIf } from 'class-validator';

export class CreateCommentDto {
    @MaxLength(1000, { message: '评论内容长度不得大于$constraint1个字' })
    @IsNotEmpty({ groups: ['create'], message: '评论内容不得为空' })
    body: string;

    @IsUUID(undefined, { message: 'ID格式错误' })
    @IsDefined({ message: 'ID必须制定' })
    post: string;

    @IsUUID(undefined, { always: true, message: 'ID格式错误' })
    @ValidateIf(({ value }) => value.parent !== null && value.parent)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value.parent === 'null' ? null : value))
    parent?: string;
}
