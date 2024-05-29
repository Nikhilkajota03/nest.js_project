import { IsNotEmpty, IsString, IsEmail, Length } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  public password: string;
}
