import express, { Application } from "express"
import { postRouter } from "./modules/post/post.router";

const app: Application = express();

app.use(express.json())

app.get("/", (req, res)=>{
    res.send("Hello World")
});

app.use('/posts', postRouter)

export default app