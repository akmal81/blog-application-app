import { Request, RequestHandler, Response } from "express";
import { postService } from "./post.service";
import { postStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middlewares/auth";

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
        const authorId = req.query.authorId as string

        // paginition
        /* const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);
        const skip = (page-1)* limit;

        // sort 

        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = req.query.sortOrder as string | undefined; */

        // sorting and pagination by utils function

        const options = paginationSortingHelper(req.query)
        const { page, limit, skip, sortBy, sortOrder } = options


        const result = await postService.getAllPost({
            search: searchString,
            tags,
            isFeatured,
            status,
            authorId,
            page,
            limit,
            skip,
            sortBy,
            sortOrder
        });


        res.status(201).json(
            result
        )
    } catch (e) {
        res.status(400).json(
            {
                error: "Post feached failed",
                details: e
            }
        )
    }
}



const getPostbyId = async (req: Request, res: Response) => {
    try {

        const { postId } = req.params;

        if (!postId) {
            throw new Error("Post Id is required!!")
        }

        const result = await postService.getPostbyId(postId);
        res.status(200).json(result)

    } catch (e) {

        res.status(400).json(
            {
                error: "Post 2222 featched failed",
                details: e
            }
        )
    }
}


const getMyPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("You are unauthorize please login");

        }
        const result = await postService.getMyPost(user.id)
        res.status(200).json(result)
     
    } catch (e) {
        
        res.status(400).json(
            {
                error: "Post 111 featched failed",
                details: e
            }
        )
    }
}


const updatePost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("You are unauthorize please login");

        }
        const {postId}= req.params;

        // check user admin or not

        const isAdmin = user.role === UserRole.ADMIN


        const result = await postService.updatePost(postId as string, req.body, user.id, isAdmin)
        res.status(200).json(result)
      


    } catch (e) {
       const errorMessage= (e instanceof Error)? e.message:"Post update failed"
        res.status(400).json(
            
            {
                error:errorMessage,
                details: e
            }
        )
    }
}
const deletePost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("You are unauthorize please login");

        }
        const {postId}= req.params;

        // check user admin or not

        const isAdmin = user.role === UserRole.ADMIN


        const result = await postService.deletePost(postId as string, user.id, isAdmin)
        res.status(200).json(result)
      


    } catch (e) {
       const errorMessage= (e instanceof Error)? e.message:"Post update failed"
        res.status(400).json(
            
            {
                error:errorMessage,
                details: e
            }
        )
    }
}


const getStats=async (req: Request, res: Response) => {
     try {
       


        const result = await postService.getStats()
        res.status(200).json(result)
      


    } catch (e) {
       const errorMessage= (e instanceof Error)? e.message:"Post update failed"
        res.status(400).json(
            
            {
                error:errorMessage,
                details: e
            }
        )
    }
}

export const PostController = {
    createPost,
    getAllPost,
    getPostbyId,
    getMyPost,
    updatePost,
    deletePost,
    getStats
}