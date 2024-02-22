import { ContentConfig } from '@/modules/content/types';

export const content = (): ContentConfig => ({
    // searchType: 'against', // 启用
    searchType: 'meili',
    // searchType: 'mysql',
    htmlEnabled: false,
});
