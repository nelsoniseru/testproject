import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class SubscribeDto {
  @IsNotEmpty()
  id:number;
  @IsNotEmpty()
  package_id: string;
  @IsNotEmpty()
  @IsString()
  plan_type: string;
}