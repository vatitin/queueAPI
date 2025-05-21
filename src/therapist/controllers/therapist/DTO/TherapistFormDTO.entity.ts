import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TherapistFormDTO {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    address: string;
}
