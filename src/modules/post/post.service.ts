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
    authorId: string | undefined
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

    if( payload.authorId){
        const {authorId} = payload
        andConditions.push(
            {
               authorId
            }
        )
    }


    const allPost = await prisma.post.findMany({
        where: {

            AND: andConditions


        }

    });
    return allPost
}

export const postService = {
    createPost,
    getAllPost
}