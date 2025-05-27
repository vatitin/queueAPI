import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';

import { AuthenticatedUser, AuthGuard } from 'nest-keycloak-connect';
import { Patient } from 'src/patient/entity';
import { StatusType } from 'src/association/entity';
import { PatientWorkflowService } from './workflow.service';
import { AssociationService } from 'src/domain/association.service';
import { StatusTypeValidationPipe } from 'src/therapist/statusType.validation.pipe';
import { PatientDTO } from './create.dto';
import { TherapistCRUDService } from 'src/domain/therapist.crud.service';

@UseGuards(AuthGuard)
@Controller('patient')
export class PatientController {

    constructor(private patientWorkflowService: PatientWorkflowService, private therapistCRUDService: TherapistCRUDService) {}

    @Get('locations')
      async getAllTherapistLocations() {
      return this.patientWorkflowService.getAllTherapistLocations()
    }

}
