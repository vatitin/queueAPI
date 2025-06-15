import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Association } from 'src/association/entity';
import { AssociationModule } from 'src/association/module';
import { AuthModule } from 'src/auth/module';
import { DomainModule } from 'src/domain/module';
import { TherapistCRUDService } from '../domain/therapist.crud.service';
import { Patient } from '../patient/entity';
import { TherapistController } from './controller';
import { Therapist } from './entity';
import { TherapistWorkflowService } from './worfklow.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Patient, Therapist, Association]),
        DomainModule,
        AuthModule,
        AssociationModule,
    ],
    controllers: [TherapistController],
    providers: [TherapistCRUDService, TherapistWorkflowService],
    exports: [TherapistCRUDService],
})
export class TherapistModule {}
