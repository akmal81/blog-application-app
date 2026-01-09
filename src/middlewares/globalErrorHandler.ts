import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    let statusCode = 500;
    let errorMessage = "Internal Server Error";
    let errorDetails = err;

    // PrismaClientValidationError
    if (err instanceof Prisma.PrismaClientValidationError) {

        statusCode = 400;
        errorMessage = "You provide incorrect field type or mission fields!"
    }
    // PrismaClientKnownRequestError
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
            statusCode = 400;
            errorMessage = "Operation failed data not found "
        }
        else if (err.code === "P2002") {
            statusCode = 400;
            errorMessage = "Duplicate key error"
        }
        else if (err.code === "P2003") {
            statusCode = 400;
            errorMessage = "Foreign Key failed"
        }
    }

    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 500;
        errorMessage = "Error occurred during query execution"
    }
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        if (err.errorCode === "P1000") {
            statusCode = 401;
            errorMessage = "Authentication failed."
        }
        else if (err.errorCode === 'P1001') {
            statusCode = 400;
            errorMessage = "Can't reach database server"
        }
    }


    res.status(statusCode)
    res.json(
        {
            message: errorMessage,
            error: err
        }
    )
}

export default errorHandler;