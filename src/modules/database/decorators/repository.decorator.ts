import { SetMetadata } from '@nestjs/common';

import { ObjectType } from 'typeorm';

import { CUSTOM_REPOSITORY_METADETA } from '../constants';

export const CustomRepository = <T>(enetity: ObjectType<T>): ClassDecorator =>
    SetMetadata(CUSTOM_REPOSITORY_METADETA, enetity);
