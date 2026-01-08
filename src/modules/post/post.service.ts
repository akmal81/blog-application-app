import { rateLimitSchema } from "better-auth/db";
import { commentStatus, Post, postStatus } from "../../../generated/prisma/client";

import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";

const createPost = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })

    return result
}


// 

const getAllPost = async (payload: {
    search?: string | undefined,
    tags: string[] | [],
    isFeatured: boolean | undefined,
    status: postStatus | undefined,
    authorId: string | undefined,
    page: number,
    limit: number,
    skip: number,
    sortBy: string,
    sortOrder: string
}) => {

    const andConditions: PostWhereInput[] = []

    if (payload.search) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: payload.search as string,
                        mode: "insensitive"
                    }
                },
                {
                    content: {
                        contains: payload.search as string,
                        mode: "insensitive"
                    }

                },
                {
                    tags: {
                        has: payload.search as string,
                    }
                }
            ],
        },
        )
    }

    if (payload.tags.length > 0) {
        andConditions.push({
            tags: {
                hasEvery: payload.tags as string[]
            }
        })
    }

    if (typeof payload.isFeatured === 'boolean') {

        const { isFeatured } = payload
        andConditions.push(
            {
                isFeatured
            }
        )
    }


    if (payload.status) {
        const { status } = payload
        andConditions.push(
            {
                status
            }
        )
    }

    if (payload.authorId) {
        const { authorId } = payload
        andConditions.push(
            {
                authorId
            }
        )
    }

    // pagination
    const { page, limit } = payload;

    const allPost = await prisma.post.findMany({
        take: payload.limit,
        skip: payload.skip,

        where: {

            AND: andConditions
        },

        orderBy: payload.sortBy && payload.sortOrder ? {
            [payload.sortBy]: payload.sortOrder
        } : { createdAt: "desc" },

        include: {
            _count: {
                select: { comment: true }
            }
        }

    });

    const total = await prisma.post.count(
        {
            where: {
                AND: andConditions
            }
        }
    )

    return {
        data: allPost,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}



// single post by id 

const getPostbyId = async (postId: string) => {

    const result = await prisma.$transaction(async (tx) => {
        const updateViewCount = await tx.post.update(
            {
                where: {
                    id: postId
                },
                data: {
                    views: {
                        increment: 1
                    }
                }
            }
        )

        const postData = await tx.post.findUnique(
            {
                where: {
                    id: postId
                },
                include: {
                    comment: {
                        where: {
                            parentId: null
                        },
                        orderBy: {
                            createdAt: "desc"
                        },
                        include: {
                            replies: {
                                where: {
                                    status: commentStatus.APPROVED
                                },
                                orderBy: {
                                    createdAt: "asc"
                                },
                                include: {
                                    replies: {
                                        where: {
                                            status: commentStatus.APPROVED
                                        },
                                        orderBy: {
                                            createdAt: "asc"
                                        },

                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: { comment: true }
                    }
                }
            }
        )
        return postData
    })

    return result
}


const getMyPost = async (authorId: string) => {


    await prisma.user.findUniqueOrThrow(
        {
            where: {
                id: authorId,
                status: "ACTIVE"
            },
            select: {
                id: true
            }
        }
    )
    const result = await prisma.post.findMany(
        {
            where: {
                authorId

            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: {
                        comment: true
                    }
                }
            }
        }
    );

    const total = await prisma.post.count(
        {
            where: {
                authorId
            },
        }
    )
    return {
        data: result,
        total
    }
}


const updatePost = async (postId: string, data: Partial<Post>, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow(
        {
            where: {
                id: postId
            },
            select: {
                id: true,
                authorId: true
            }
        }
    )

    if (!isAdmin && postData.authorId !== authorId) {
        throw new Error("Yor are not the owner of the post");
    }

    //  user can not delete isFeatured. to do this deleter the isfeatured field from payload
    if (!isAdmin) {
        delete data.isFeatured
    }

    const result = prisma.post.update(
        {
            where: {
                id: postData.id
            },
            data
        }
    )
    return result;
}

/* 5. delete post
    -- user can delete won post
    -- admin can delete all post */
const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow(
        {
            where: {
                id: postId
            },
            select: {
                id: true,
                authorId: true
            }
        }
    )


    if (!isAdmin && postData.authorId !== authorId) {
        throw new Error("Yor are not the owner of the post");
    }


    return await prisma.post.delete(
        {
            where: {
                id: postId
            }
        }
    )
}


const getStats = async () => {
    //STATISTIC: post count totoal publish post draftPost total comments total views

    return await prisma.$transaction(async (tx) => {

        const [totalPost, publishedPost, draftPost, archivedPost, totalCommnets, approveComment, totalUser, adminCount, userCount, totalViews] = await Promise.all([
            await tx.post.count(),
            await tx.post.count({ where: { status: postStatus.PUBLISHED } }),
            await tx.post.count({ where: { status: postStatus.DRAFT } }),
            await tx.post.count({ where: { status: postStatus.ARCHIVED } }),
            await tx.comment.count(),
            await tx.comment.count({ where: { status: commentStatus.APPROVED } }),
            await tx.user.count(),
            await tx.user.count({ where: { role: UserRole.ADMIN } }),
            await tx.user.count({ where: { role: UserRole.USER } }),
            await tx.post.aggregate(
                {
                    _sum:{views:true}
                }
            )
        ])
        return {
            totalPost,
            publishedPost,
            draftPost,
            archivedPost,
            totalCommnets,
            approveComment,
            totalUser, 
            adminCount, 
            userCount,
            totalViews:totalViews._sum.views
        }
    }
    )
}


export const postService = {
    createPost,
    getAllPost,
    getPostbyId,
    getMyPost,
    updatePost,
    deletePost,
    getStats,

}