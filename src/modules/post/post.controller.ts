import { Request, RequestHandler, Response } from "express";
import { postService } from "./post.service";
import { postStatus } from "../../../generated/prisma/enums";

const createPost = async (req: Request, res: Response) => {
    try {
        const user = req.user
        if (!user) {
            return res.status(400).json(
                {
                    error: "unauthorized",

                }
            )
        }
        const result = await postService.createPost(req.body, user.id as string)

        res.status(201).json(result)
    } catch (e) {
        res.status(400).json(
            {
                error: "Post creation failed",
                details: e
            }
        )
    }
}

// 

const getAllPost = async (req: Request, res: Response) => {
    try {
        // search
        const { search } = req.query;
        const searchString = typeof search === 'string' ? search : undefined

        // tags
        const tags = req.query.tags ? (req.query.tags as string).split(",") : [];


        // isFeatured
        const isFeatured = req.query.isFeatured
            ? req.query.isFeatured === 'true'
                ? true
                : req.query.isFeatured === 'false'
                    ? false 
                    : undefined
            : undefined;

        // status
        const status = req.query.status as postStatus | undefined

        // authorId
        const authorId = req.query.authorId 

        const result = await postService.getAllPost({ search: searchString, tags, isFeatured, status, authorId })
        res.status(201).json(
            result
        )
    } catch (e) {
        res.status(400).json(
            {
                error: "Post creation failed",
                details: e
            }
        )
    }
}

export const PostController = {
    createPost,
    getAllPost
}