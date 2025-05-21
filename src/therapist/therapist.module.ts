import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { TherapistController } from './controllers/therapist/therapist.controller';
import { Patient } from './entity/Patient.entity';
import { PatientTherapist } from './entity/PatientTherapist.entity';
import { Therapist } from './entity/Therapist.entity';
import { TherapistService } from './services/therapist/therapist.service';
import { AuthService } from './services/therapist/auth.service';
import { AuthController } from './controllers/therapist/auth.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Patient, Therapist, PatientTherapist]),
        AuthModule,
    ],
    controllers: [TherapistController, AuthController],
    providers: [TherapistService, AuthService],
})
export class TherapistModule {}
