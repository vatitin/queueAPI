import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/patient/entity';
import { Association } from 'src/association/entity';
import { Therapist } from 'src/therapist/entity';
import { AssociationService } from '../domain/association.service';
import { PatientModule } from 'src/patient/module';
import { DomainModule } from 'src/domain/module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Patient, Therapist, Association]),
        DomainModule
    ],
    providers: [AssociationService],
    exports: [AssociationService],
})
export class AssociationModule {}
