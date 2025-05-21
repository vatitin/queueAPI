import { IsBoolean, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { GenderType } from 'src/therapist/entity/Patient.entity';

export class RegisterDTO {
    @IsString()
    email: string;

    //todo change to isStrong padssword
    //@IsStrongPassword()
    @IsString()
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    @IsOptional()
    gender: GenderType;
}
