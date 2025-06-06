import { Type } from "class-transformer";
import { IsUUID, ValidateNested } from "class-validator";
import { GeoPointDto } from "./create-geoPoint.dto";

export class TherapistLocationDto {
  @IsUUID()
  therapistId: string;

  @ValidateNested()
  @Type(() => GeoPointDto)
  location: GeoPointDto;
}