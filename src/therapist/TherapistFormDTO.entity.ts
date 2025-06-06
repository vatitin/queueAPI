import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { GeoPointDto } from './create-geoPoint.dto';

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

    @ValidateNested()
    @Type(() => GeoPointDto)
    @IsNotEmpty()
    location: GeoPointDto;
}
