// import { MeiliConfig } from '@/modules/meilisearch/types';

import { createMeiliConfig } from '@/modules/meilisearch/config';

// export const meili = (): MeiliConfig => [
//     {
//         name: 'default',
//         host: 'http://localhost:7700',
//     },
// ];

export const meili = createMeiliConfig((configure) => [
    {
        name: 'default',
        host: 'http://localhost:7700',
    },
]);
