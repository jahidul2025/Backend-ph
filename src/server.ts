import 'dotenv/config';
import app from "./app";
import { envVars } from './config/env';




const bootstrap = () => {
    try {
        app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        })
    } catch (error) {
        console.error('failed to start server', error)
    }
}

bootstrap();