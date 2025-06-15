import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientCRUDService } from 'src/domain/patient.crud.service';
import { TherapistCRUDService } from 'src/domain/therapist.crud.service';
import { Patient } from 'src/patient/entity';
import { Therapist } from 'src/therapist/entity';

@Module({
    imports: [TypeOrmModule.forFeature([Patient, Therapist])],
    providers: [PatientCRUDService, TherapistCRUDService],
    exports: [PatientCRUDService, TherapistCRUDService],
})
export class DomainModule {}
