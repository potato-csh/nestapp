/**
 * 全文搜索模式
 */
// export type SearchType = 'like' | 'against' | 'meili';
export type SearchType = 'mysql' | 'meili';

export interface ContentConfig {
    searchType?: SearchType;
}
