import { rateLimitSchema } from "better-auth/db";
import { Post, postStatus } from "../../../generated/prisma/client";

import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

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
    const { page, limit, skip, sortBy, sortOrder }=payload;

    const allPost = await prisma.post.findMany({
        take: payload.limit,
        skip:payload.skip,

        where: {

            AND: andConditions
        },

        orderBy: payload.sortBy && payload.sortOrder ? {
            [payload.sortBy]: payload.sortOrder
        }:{createdAt:"desc"}

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
        pagination:{
            total,
            page,
            limit,
            totalPages: Math.ceil(total/limit)
        }
    }
}



// single post by id 

const getPostbyId = async (postId: string) => {

const result = await prisma.$transaction(async (tx) => {
    const updateViewCount = await tx.post.update(
        {
            where:{
                id:postId
            },
            data:{
                views:{
                    increment:1
                }
            }
        }
    )

    const postData = await tx.post.findUnique(
        {
            where:{
                id:postId
            }
        }
    )
    return postData
})

return result
} 



export const postService = {
    createPost,
    getAllPost,
    getPostbyId
}