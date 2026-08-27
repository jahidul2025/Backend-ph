import 'dotenv/config';
import app from "./app";
import { envVars } from './config/env';
import { seedSuperAdmin } from './app/utils/seed';
import { Server } from 'http';


let server: Server

const bootstrap = async () => {
    try {
        await seedSuperAdmin()
        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        })
    } catch (error) {
        console.error('failed to start server', error)
    }
}

// SIGTERM
process.on("SIGTERM", () => {
    console.log("SIGTERM received... shutting down gracefully");
    if (server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

// SIGINT
process.on('SIGINT', () => {
    console.log("SIGINT received... shutting down gracefully");
    if (server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

// unCaught Exception Handled here
process.on('uncaughtException', error => {
    console.log("unCaught Exception detected.... shutting down the server", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
})

// Unhandled Rejection Handled here
process.on('unhandledRejection', error => {
    console.log("unhandled Rejection detected.... shutting down the server", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
})

bootstrap();