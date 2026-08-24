import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'نام ضروری ہے' })
  name: string;

  @IsEmail({}, { message: 'ای میل درست نہیں ہے' })
  email: string;

  @MinLength(6, { message: 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے' })
  password: string;
}
