import { Request, Response } from "express";
import { commentService } from "./comment.service";
import { prisma } from "../../lib/prisma";

const createComment = async (req: Request, res: Response) => {

    try {

        //  get user info from req.usr setted in auth middleware
        const user = req.user;


        // set authorId in req.body
        req.body.authorId = user?.id;


        const result = await commentService.createComment(req.body)
        res.status(201).json(result)

    } catch (e) {
        res.status(400).json(
            {
                error: 'Comment create failed',
                detail: e
            }
        )
    }
};


const getCommentById = async (req: Request, res: Response) => {

    try {

        //  get user info from req.usr setted in auth middleware
        const { commentId } = req.params;

        // if (!commentId){
        //     throw new Error("id not found")
        // }

        const result = await commentService.getCommentById(commentId as string)
        res.status(200).json(result)

    } catch (e) {
        res.status(400).json(
            {
                error: 'Comment retriv  failed',
                detail: e
            }
        )
    }
}



const getCommentsByAuthor = async (req: Request, res: Response) => {

    try {

        const { authorId } = req.params;

        const result = await commentService.getCommentsByAuthor(authorId as string)
        res.status(200).json(result)

    } catch (e) {
        res.status(400).json(
            {
                error: 'Comment retriv  failed',
                detail: e
            }
        )
    }
}

// delete comment
// 1. nijar comment delete korte parbe
// 2. login thake hobe
// 3. nijer comment kina check kina 
const deleteComment = async (req: Request, res: Response) => {

    try {

        const user = req.user;
        const { commentId } = req.params;
        const result = await commentService.deleteComment(commentId as string, user?.id as string);


        res.status(200).json(result);

    } catch (e) {
        res.status(400).json(
            {
                error: 'Comment delete  failed',
                detail: e
            }
        )
    }
}


const updateComment = async (req: Request, res: Response) => {

    try {

        const user = req.user;
        const { commentId } = req.params;
        const result = await commentService.updateComment(commentId as string, req.body, user?.id as string);


        res.status(200).json(result);

    } catch (e) {
        res.status(400).json(
            {
                error: 'Comment update  failed',
                detail: e
            }
        )
    }
}
const moderateComment = async (req: Request, res: Response) => {


    try {

        const commentId = req.params.commentId;
        const result = await commentService.moderateComment(commentId as string, req.body );


        res.status(200).json(result);

    } catch (e) {
        const errorMessage = (e instanceof Error)? e.message :'Comment update  failed'
        res.status(400).json(
            {
                error: errorMessage,
                detail: e
            }
        )
    }
}



export const commentController = {
    createComment,
    getCommentById,
    getCommentsByAuthor,
    deleteComment,
    updateComment,
    moderateComment

}