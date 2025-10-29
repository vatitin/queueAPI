import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';

import { AuthenticatedUser, AuthGuard } from 'nest-keycloak-connect';
import { KeycloakUserDTO } from 'src/keycloak-user.dto';
import { PatientAuthGuard } from 'src/patient/patient-auth.guard';
import { TherapistResponseDTO } from 'src/therapist/therapist-response.dto';
import { PatientFormDTO } from './create-form.dto';
import { LocationQueryDto } from './locationQuery.dto';
import { PatientWorkflowService } from './workflow.service';

@Controller('patient')
export class PatientController {
    constructor(private patientWorkflowService: PatientWorkflowService) {}

    @Post('createPatient')
    @UseGuards(AuthGuard)
    @UsePipes(ValidationPipe)
    async createPatient(
        @AuthenticatedUser() keycloakUser: KeycloakUserDTO,
        @Body() patientFormDTO: PatientFormDTO,
    ) {
        console.log("enter createPatient controller")
        await this.patientWorkflowService.createPatient(
            patientFormDTO,
            keycloakUser,
        );
    }

    @Get('getTherapist/:therapistId')
    async getTherapist(@Param('therapistId') therapistId: string) {
        return await this.patientWorkflowService.getTherapist(therapistId);
    }

    @Post('applyTo/:therapistId')
    @UseGuards(PatientAuthGuard)
    async applyToTherapist(
        @AuthenticatedUser() keycloakUser: KeycloakUserDTO,
        @Param('therapistId') therapistId: string,
        @Body() body: { applicationText: string },
    ) {
      console.log("applyToTherapist controller")
        return await this.patientWorkflowService.applyToTherapist(
            keycloakUser,
            therapistId,
            body.applicationText
        );
    }

    @Get('getProfile')
    @UseGuards(PatientAuthGuard) 
    async getProfile(
      @AuthenticatedUser() keycloakUser: KeycloakUserDTO
    ) {
        console.log("getProfile controller-----------------------")
      return await this.patientWorkflowService.getProfile(keycloakUser)
    }

    @Get('hasLocalPatient')
    @UseGuards(AuthGuard)
    async hasLocalPatient(@AuthenticatedUser() keycloakUser: KeycloakUserDTO) {
      console.log("hasLocalPatient")
        return await this.patientWorkflowService.hasLocalPatient(keycloakUser);
    }

    @Get('locations')
    async getTherapistLocations(
        @Query(new ValidationPipe({ transform: true, whitelist: true }))
        query: LocationQueryDto,
    ): Promise<TherapistResponseDTO[]> {
        const therapistLocations =
            await this.patientWorkflowService.getTherapistLocations({
                lng: query.lng,
                lat: query.lat,
                distance: query.distance,
                //categories,
            });
        console.log(
            'Therapist Locations:',
            therapistLocations[0]?.location?.coordinates[0] ??
                'No coordinates found',
        );
        return therapistLocations;
    }
}
