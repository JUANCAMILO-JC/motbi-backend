import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: any, ctx: ExecutionContext) => {

        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if( !user )
            throw new InternalServerErrorException('User not found in req.');


        console.log("GetUser", user)
        return ( !user ) ? user : user[data];
    }
);