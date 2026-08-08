import express, { Application, Request, Response } from "express";
import { indexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middlewere/globalErrorHandler";
import { notFound } from "./app/middlewere/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";


const app: Application = express();

app.use("/api/auth", toNodeHandler(auth) )
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cookieParser())

app.use("/api/v1/", indexRoutes);


// Basic route
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'api is working',
    })
});

app.use(notFound);
app.use(globalErrorHandler);


export default app;