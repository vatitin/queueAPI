import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
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
import { GeoPointDto } from 'src/therapist/create-geoPoint.dto';
import { LocationQueryDto } from './locationQuery.dto';
import { TherapistLocationDto } from 'src/therapist/therapistLocation.dto';
import { TherapistResponseDTO } from 'src/therapist/therapist-response.dto';

//@UseGuards(AuthGuard)
@Controller('patient')
export class PatientController {

    constructor(private patientWorkflowService: PatientWorkflowService, private therapistCRUDService: TherapistCRUDService) {}


  @Get('locations')
  async getTherapistLocations(
      @Query(new ValidationPipe({ transform: true, whitelist: true }))
      query: LocationQueryDto
  ): Promise<TherapistResponseDTO[]> {

    const therapistLocations = await this.patientWorkflowService.getTherapistLocations({
      lng: query.lng,
      lat: query.lat,
      distance: query.distance,
      //categories,
    });
    console.log('Therapist Locations:', therapistLocations[0]?.location?.coordinates[0] ?? "nada");
    return therapistLocations;
  }

}

