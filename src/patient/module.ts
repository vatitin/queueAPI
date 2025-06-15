import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/module';
import { Patient } from './entity';
import { Association } from 'src/association/entity';
import { Therapist } from 'src/therapist/entity';
import { PatientController } from './controller';
import { PatientCRUDService } from '../domain/patient.crud.service';
import { PatientWorkflowService } from './workflow.service';
import { TherapistModule } from 'src/therapist/module';
import { AssociationModule } from 'src/association/module';
import { DomainModule } from 'src/domain/module';
import { PatientAuthGuard } from 'src/patient/patient-auth.guard';
import { AuthGuard } from 'nest-keycloak-connect';

@Module({
    imports: [
        TypeOrmModule.forFeature([Patient, Therapist, Association]),
        AuthModule,
        AssociationModule,
        DomainModule,
    ],
    controllers: [PatientController],
    providers: [PatientWorkflowService, PatientCRUDService, AuthGuard, PatientAuthGuard],
    exports: [PatientCRUDService],  
})
export class PatientModule {}
