import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Association } from 'src/association/entity';
import { DomainModule } from 'src/domain/module';
import { Patient } from 'src/patient/entity';
import { Therapist } from 'src/therapist/entity';
import { AssociationService } from '../domain/association.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Patient, Therapist, Association]),
    ],
    providers: [AssociationService],
    exports: [AssociationService],
})
export class AssociationModule {}
