import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/module';
import { TherapistController } from './controller';
import { Patient } from '../patient/entity';
import { Association } from 'src/association/entity';
import { Therapist } from './entity';
import { AssociationModule } from 'src/association/module';
import { TherapistCRUDService } from '../domain/therapist.crud.service';
import { TherapistWorkflowService } from './worfklow.service';
import { DomainModule } from 'src/domain/module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Patient, Therapist, Association]),
        DomainModule,
        AuthModule,
        AssociationModule
    ],
    controllers: [TherapistController],
    providers: [TherapistCRUDService, TherapistWorkflowService],
    exports: [TherapistCRUDService]
})
export class TherapistModule {}
