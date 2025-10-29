import { IsString, Length } from 'class-validator';

export class CreateTherapistCommentDto {
  @IsString()
  @Length(1, 5000)
  text: string;
}
