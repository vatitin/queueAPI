import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsLatitude, IsLongitude, IsNumber } from 'class-validator';

export class GeoPointDto {
  @IsIn(['Point'])
  type: 'Point';

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  //todo use object with lat and lng instead of array
  coordinates: [number, number];

}