import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'nest-keycloak-connect';
import { Association } from 'src/association/entity';
import { AssociationModule } from 'src/association/module';
import { AuthModule } from 'src/auth/module';
import { DomainModule } from 'src/domain/module';
import { PatientAuthGuard } from 'src/patient/patient-auth.guard';
import { Therapist } from 'src/therapist/entity';
import { PatientCRUDService } from '../domain/patient.crud.service';
import { PatientController } from './controller';
import { Patient } from './entity';
import { PatientWorkflowService } from './workflow.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Patient, Therapist, Association]),
        AuthModule,
        AssociationModule,
        DomainModule,
    ],
    controllers: [PatientController],
    providers: [
        PatientWorkflowService,
        PatientCRUDService,
        AuthGuard,
        PatientAuthGuard,
    ],
    exports: [PatientCRUDService],
})
export class PatientModule {}
