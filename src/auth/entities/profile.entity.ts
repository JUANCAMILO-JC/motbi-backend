import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('profiles')
export class Profile {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    //user_id 
    //city_id

    first_name: string;

    last_name: string;

    phone_number: number;
    
    //address 
    profile_picture: string;
    
}
