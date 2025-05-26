import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Patient } from './therapist/entity/Patient.entity';
import { PatientTherapist } from './therapist/entity/PatientTherapist.entity';
import { Therapist } from './therapist/entity/Therapist.entity';
import { TherapistModule } from './therapist/therapist.module';

@Module({
    imports: [
        TherapistModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'myuser',
            password: 'myuserpass',
            database: 'mydatabase',
            entities: [Therapist, Patient, PatientTherapist],
            //todo set this to false before production
            synchronize: true,
        }),
        AuthModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
