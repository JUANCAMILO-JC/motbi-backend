import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService')

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService, 

  ) {}

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto

      const user = this.userRepository.create( {
        ...userData,
        password: bcrypt.hashSync( password, 10)
      } );

      await this.userRepository.save( user )
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id, email: user.email })
      }
      // TODO: Retonar JWT de acceso

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login( loginUserDto: LoginUserDto) {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true }
    });

    if ( !user )
      throw new UnauthorizedException('Credentials are not valid')
    
    if ( !bcrypt.compareSync( password, user.password) )
      throw new UnauthorizedException('Credentials are not valid')

    return {
      ...user,
      token: this.getJwtToken({ id: user.id, email: user.email })
    }
    // TODO: Retonar JWT de acceso

  }

  async checkAuthStatus( user: User ){

    return {
      ...user,
      token: this.getJwtToken({ id: user.id, email: user.email })
    };

  }


  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }

  private getJwtToken( payload: JwtPayload ) {

    const token = this.jwtService.sign( payload );

    return token;

  }

  private handleDBErrors( error: any ): never {


    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail );

    console.log(error)

    throw new InternalServerErrorException('Please check server logs');

  }
}
