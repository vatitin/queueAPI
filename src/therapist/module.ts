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
import { TherapistCommentService } from 'src/domain/therapist-comment.service';
import { TherapistComment } from 'src/comment/therapist-comment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Patient, Therapist, TherapistComment, Association]),
        DomainModule,
        AuthModule,
        AssociationModule,
    ],
    controllers: [TherapistController],
    providers: [TherapistCRUDService, TherapistWorkflowService, TherapistCommentService],
    exports: [TherapistCRUDService],
})
export class TherapistModule {}
