import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TherapistFormDTO {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    addressLine1: string;

    @IsString()
    @IsOptional()
    addressLine2: string;
    
    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    postalCode: string;
}
