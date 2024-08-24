import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env', // Asegúrate de que el archivo .env esté en la raíz y sea referenciado correctamente
      isGlobal: true, // Esto asegura que las variables de entorno estén disponibles globalmente
    }),

    AuthModule,

    /* ssl: process.env.STAGE === 'prod' ? true : false,
    extra: {
      ssl: process.env.STAGE === 'prod' ? { rejectUnauthirized: false } : null
    }, */
    // Log para verificar el valor de DB_HOST
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_PORT:', process.env.DB_PORT);
        console.log('DB_NAME:', process.env.DB_NAME);
        console.log('DB_USERNAME:', process.env.DB_USERNAME);
        console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT,
          database: process.env.DB_NAME,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
