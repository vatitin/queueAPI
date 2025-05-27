import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/patient/entity';
import { Therapist } from 'src/therapist/entity';
import { PatientCRUDService } from 'src/domain/patient.crud.service';
import { TherapistCRUDService } from 'src/domain/therapist.crud.service';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Therapist])],
  providers: [PatientCRUDService, TherapistCRUDService],
  exports: [PatientCRUDService, TherapistCRUDService],
})
export class DomainModule {}