import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/module';
import { Patient } from './patient/entity';
import { Association } from './association/entity';
import { Therapist } from './therapist/entity';
import { TherapistModule } from './therapist/module';
import { PatientModule } from './patient/module';
import { AssociationModule } from './association/module';
import { DomainModule } from './domain/module';

@Module({
    imports: [
        TherapistModule,
        PatientModule,
        AssociationModule,
        DomainModule,
        AuthModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'myuser',
            password: 'mypass',
            database: 'platformDB',
            entities: [Therapist, Patient, Association],
            //todo set this to false before production
            synchronize: true,
        }),
    ],
})
export class AppModule {}
