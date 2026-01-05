import { commentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createComment = async (paylod: {
    content: string;
    authorId: string;
    postId: string;
    parentId?: string
}) => {

    await prisma.post.findUniqueOrThrow(
        {
            where: {
                id: paylod.postId
            }
        }
    )

    if (paylod.parentId) {
        await prisma.comment.findUniqueOrThrow(
            {
                where: {
                    id: paylod.parentId
                }
            }
        )
    }

    return await prisma.comment.create(
        {
            data: paylod
        }
    )
}


const getCommentById = async (id: string) => {
    return await prisma.comment.findUnique(
        {
            where: {
                id
            },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        }
    )
};


const getCommentsByAuthor = async (authorId: string) => {

    return await prisma.comment.findMany(
        {
            where: {
                authorId
            },
            orderBy:
            {
                createdAt: "desc"
            },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                _count: { select: { replies: true } }

            },

        }
    )
}


const deleteComment = async (commentId: string, authorId: string) => {
    const commentData = await prisma.comment.findFirst(
        {
            where: {
                id: commentId,
                authorId
            },
            select: {
                id: true
            }
        }
    )

    if (!commentData) {
        throw new Error("Your provided input is invalid")
    }

    return await prisma.comment.delete(
        {
            where: {
                id: commentData?.id
            }
        }
    )

}


// authorId, commentId, updatedData
const updateComment = async (commentId: string, data: { content?: string, status?: commentStatus }, authorId: string) => {
    const commentData = await prisma.comment.findFirst(
        {
            where: {
                id: commentId,
                authorId
            },
            select: {
                id: true
            }
        }
    )
    if (!commentData) {
        throw new Error("Your provided input is invalid")
    }


    return await prisma.comment.update(
        {
            where: {
                id: commentId,
                authorId
            },
            data
        }
    )
}

export const commentService = {
    createComment,
    getCommentById,
    getCommentsByAuthor,
    deleteComment,
    updateComment
}