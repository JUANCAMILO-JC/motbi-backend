import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { Auth, GetUser, RowHeader } from './decorators';
import { ValidRoles } from './interfaces';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus( user );
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RowHeader() rawHeaders: string[]
  ) {

    return {
      status: true,
      message: 'ok',
      user
    }
  }


  @Get()
  @Auth()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  @Auth( ValidRoles.user)
  findOne(@Param('id', ParseUUIDPipe ) id: string) {
    return this.authService.findOne(id);
  }

  @Patch(':id')
  @Auth( ValidRoles.user)
  update(@Param('id', ParseUUIDPipe ) id: string, @Body() updateUserDto: CreateUserDto) {
    return this.authService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Auth( ValidRoles.admin)
  delete(@Param('id', ParseUUIDPipe ) id: string) {
    return this.authService.delete( id );
  }

  @Delete('remove/:id')
  @Auth( ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe ) id: string) {
    return this.authService.remove( id );
  }
}
