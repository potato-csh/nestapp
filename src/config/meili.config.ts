import { MeiliConfig } from '@/modules/meilisearch/types';

export const meili = (): MeiliConfig => [
    {
        name: 'default',
        host: 'http://localhost:7700',
    },
];
