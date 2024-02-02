export interface ContentConfig {
    searchType?: SearchType;
}

/**
 * 全文搜索模式
 */
export type SearchType = 'like' | 'against' | 'meili';
