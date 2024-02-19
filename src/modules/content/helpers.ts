import { instanceToPlain } from 'class-transformer';
import { isNil, pick } from 'lodash';

import { PostEntity } from './entities';
import { CategoryRepository, CommentRepository } from './repositories';

export async function getSearchItem(
    catRepo: CategoryRepository,
    cmtRepo: CommentRepository,
    post: PostEntity,
) {
    const categories = isNil(post.category)
        ? []
        : (await catRepo.flatAncestorsTree(post.category)).map((item) => ({
              id: item.id,
              name: item.name,
          }));
    const comments = (
        await cmtRepo.find({
            relations: ['post'],
            where: { post: { id: post.id } },
        })
    ).map((item) => ({
        id: item.id,
        body: item.body,
    }));

    return [
        {
            ...pick(instanceToPlain(post), [
                'id',
                'title',
                'body',
                'summary',
                'commentCount',
                'deletedAt',
                'publishedAt',
                'createdAt',
                'updatedAt',
            ]),
            categories,
            // tags: post.tags.map((item) => ({ id: item.id, name: item.name })),
            tags: post.tags ? post.tags.map((item) => ({ id: item.id, name: item.name })) : [],
            comments,
        },
    ];
}

export const getSearchData = async (
    posts: PostEntity[],
    catRepo: CategoryRepository,
    cmtRepo: CommentRepository,
) =>
    (await Promise.all(posts.map(async (post) => getSearchItem(catRepo, cmtRepo, post)))).reduce(
        (o, n) => [...o, ...n],
        [],
    );
