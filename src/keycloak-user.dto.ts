import { IsNotEmpty, IsString } from "class-validator";

export class KeycloakUserDTO {
    @IsNotEmpty()
    @IsString()
    sub: string;

    @IsNotEmpty()
    @IsString()
    email: string;  
}
