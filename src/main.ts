import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    //todo check if actually to use validation pipe globally
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'"],
                },
            },
        }),
    );

    //app.setGlobalPrefix('api');

    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:5174'], // todo adjust for production
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: ['content-type', 'authorization'],
        credentials: true,
    });

    await app.listen(3001);
}

bootstrap();
