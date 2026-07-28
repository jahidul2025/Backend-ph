import 'dotenv/config';
import app from "./app";




const bootstrap = () => {
    try {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT}`);
        })
    } catch (error) {
        console.error('failed to start server', error)
    }
}

bootstrap();