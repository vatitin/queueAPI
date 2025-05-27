import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';

import { AuthenticatedUser, AuthGuard } from 'nest-keycloak-connect';
import { Patient } from 'src/therapist/entity/Patient.entity';
import { StatusType } from 'src/therapist/entity/PatientTherapist.entity';
import { PatientService } from '../../therapist/services/therapist/patient.service';
import { TherapistService } from '../../therapist/services/therapist/therapist.service';

@UseGuards(AuthGuard)
@Controller('patient')
export class PatientController {
    constructor(private patientService: PatientService, private therapistService: TherapistService) {}

    @Get('locations')
    async getAllTherapistLocations() {
    return this.therapistService.getAllLocations();
  }
}
