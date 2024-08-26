import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces';
import { Response } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { validate as isUUID } from 'uuid';


@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService, 

  ) {

  }

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto

      const user = this.userRepository.create( {
        ...userData,
        password: bcrypt.hashSync( password, 10)
      } );

      await this.userRepository.save( user )
      delete user.password;

      const response: Response = {
        success: true,
        message: 'User created successfully',
        object: {
          ...user,
          token: this.getJwtToken({ id: user.id, email: user.email })
        }
      }
      return response;
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

    const response: Response = {
      success: true,
      message: 'User created successfully',
      object: {
        ...user,
        token: this.getJwtToken({ id: user.id, email: user.email })
      }
    }

    return response
    // TODO: Retonar JWT de acceso

  }

  async checkAuthStatus( user: User ){

    return {
      ...user,
      token: this.getJwtToken({ id: user.id, email: user.email })
    };

  }


  async findAll() {
    const users = await this.userRepository.find();
    return users;
  }

  async findOne(id: string) {
    // Verificar si el ID es válido
    if (!isUUID(id)) {
      throw new BadRequestException(`El ${id} no es ID valido`);
    }
  
    const user = await this.userRepository.findOneBy({ id });
  
    // Si el usuario no existe, lanzar una excepción
    if (!user) {
      throw new BadRequestException(`Usuario con ${id} no encontrado`);
    }
  
    // Eliminar la contraseña antes de devolver el objeto
    delete user.password;
  
    return user;
  }
  

  async update(id: string, updateUserDto: CreateUserDto) {
    // Verificar si el ID es válido
    if (!isUUID(id)) {
      throw new BadRequestException(`El ${id} no es ID valido`);
    }
  
    const user = await this.userRepository.findOneBy({ id });
  
    // Si el usuario no existe, lanzar una excepción
    if (!user) {
      throw new BadRequestException(`Usuario con ${id} no encontrado`);
    }
  
    try {
      // Mezcla los datos actualizados con los existentes
      const updatedUser = this.userRepository.merge(user, updateUserDto);
  
      // Si se proporciona una nueva contraseña, hashearla
      if (updateUserDto.password) {
        updatedUser.password = bcrypt.hashSync(updateUserDto.password, 10);
      }
  
      // Guardar los cambios en la base de datos
      await this.userRepository.save(updatedUser);
  
      // Remover la contraseña antes de devolver el objeto
      delete updatedUser.password;
  
      const response: Response = {
        success: true,
        message: `El usuario con ${id} ha sido actualizado exitosamente`,
        object: updatedUser,
      };
  
      return response;
  
    } catch (error) {
      this.handleDBErrors(error);
    }
  }
  

async delete(id: string) {
  // Verificar si el ID es válido
  if (!isUUID(id)) {
    throw new BadRequestException(`El ${id} no es ID valido`);
  }

  const user = await this.userRepository.findOneBy({ id });

  // Si el usuario no existe, lanzar una excepción
  if (!user) {
    throw new BadRequestException(`Usuario con ${id} no encontrado`);
  }

  try {
    await this.userRepository.remove(user);

    const response: Response = {
      success: true,
      message: `El usuario con ${id} ha sido eliminado exitosamente`,
      object: user,
    };

    return response;

  } catch (error) {
    this.handleDBErrors(error);
  }
}

async remove(id: string) {
  // Verificar si el ID es válido
  if (!isUUID(id)) {
    throw new BadRequestException(`El ${id} no es ID valido`);
  }

  const user = await this.userRepository.findOneBy({ id });

  // Si el usuario no existe, lanzar una excepción
  if (!user) {
    throw new BadRequestException(`Usuario con ${id} no encontrado`);
  }

  // Cambiar isActive a false
  user.isActive = false;

  try {
    // Guardar los cambios en la base de datos
    await this.userRepository.save(user);

    const response: Response = {
      success: true,
      message: `El usuario con ${id} ha sido eliminado exitosamente`,
      object: user,
    };

    return response;

  } catch (error) {
    this.handleDBErrors(error);
  }
}
  

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
