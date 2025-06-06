import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class LocationQueryDto {
  @IsNumberString()
  lng: number;

  @IsNumberString()
  lat: number;

  @IsNumberString()
  distance: number;

  @IsOptional()
  @IsString({ each: true })
  //todo use enum for categories instead of string[]
  categories?: string[];
}
