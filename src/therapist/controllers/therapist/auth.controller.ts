import {
    Body,
    Controller,
    Post,
} from '@nestjs/common';
import { RegisterDTO } from './RegisterDTO.entity';
import { AuthService } from 'src/therapist/services/therapist/auth.service';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('register')
        async register(@Body() body: RegisterDTO) {
        const keycloakId = await this.authService.registerUser(body);
        // Optionally save app-specific data in your DB
        // therapistService.create({ name: dto.name, address: dto.address, keycloakId })

        return { message: 'User registered successfully', keycloakId };
    }


}