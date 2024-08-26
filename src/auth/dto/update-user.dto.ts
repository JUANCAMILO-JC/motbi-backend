import { IsEmail, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class UpdateUserDto {
    
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    username: string

    @IsString()
    nickname: string;

    @IsOptional()
    profile_picture: string;


}