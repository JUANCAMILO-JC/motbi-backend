import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    username: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column('text', {
        array: true,
        default: ['user']
    })
    rolls: string[]
    
    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @Column('bool', {
        default: false
    })
    email_verified : boolean;
    
    // last_login:
    
    @Column('int', {
        default: 0
    })
    failed_login_attempts: number

    //locked_until 
    @Column('text', {
        unique: true
    })
    email: string;

    //fullName: string;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate() 
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }
    
}
