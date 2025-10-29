import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Association } from './association/entity';
import { AssociationModule } from './association/module';
import { AuthModule } from './auth/module';
import { DomainModule } from './domain/module';
import { Patient } from './patient/entity';
import { PatientModule } from './patient/module';
import { Therapist } from './therapist/entity';
import { TherapistModule } from './therapist/module';
import { TherapistComment } from './comment/therapist-comment.entity';

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
            entities: [Therapist, Patient, Association, TherapistComment],
            //todo set this to false before production
            synchronize: true,
        }),
    ],
})
export class AppModule {}
