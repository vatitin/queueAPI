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
import { TherapistWorkflowService } from './worfklow.service';
import { TherapistFormDTO } from './TherapistFormDTO.entity';
import { AssociationService } from 'src/domain/association.service';
import { StatusTypeValidationPipe } from './statusType.validation.pipe';
import { StatusType } from 'src/association/entity';
import { PatientDTO } from 'src/patient/create.dto';
import { Patient } from 'src/patient/entity';

@UseGuards(AuthGuard)
@Controller('therapist')
export class TherapistController {

    constructor(private therapistWorkflowService: TherapistWorkflowService, private associationService: AssociationService) {}

    @Get('myProfile')
    async getProfile(@AuthenticatedUser() therapist: KeycloakUser) {
        return await this.therapistWorkflowService.getProfile(therapist);
    }


    @Get('hasLocalTherapist')
    async hasLocalTherapist(@AuthenticatedUser() therapist: KeycloakUser) {
        return await this.therapistWorkflowService.hasLocalTherapist(therapist);
    }

    @Post('createTherapist')
    async createTherapist(@AuthenticatedUser() therapist: KeycloakUser, @Body() therapistForm: TherapistFormDTO) {
        return await this.therapistWorkflowService.createTherapist(therapist, therapistForm);
    }

    @Post('createPatient/:status')
    @UsePipes(ValidationPipe)
    async createPatient(
        @Param('status', new StatusTypeValidationPipe()) status: StatusType,
        @AuthenticatedUser() user: KeycloakUser,
        @Body() patientDTO: PatientDTO,
    ) {
        await this.therapistWorkflowService.addPatientToTherapist(patientDTO, user.sub, status);
    }
    
    @Get('getPatientsByStatus/:status')
    async getPatientsFromTherapist(
        @Param('status', new StatusTypeValidationPipe()) status: StatusType,
        @AuthenticatedUser() user: KeycloakUser,
    ): Promise<Patient[]> {
        const patients = await this.therapistWorkflowService.getPatientsFromTherapist(
            user.sub,
            status,
        );
        return patients;
    }

    @Get('getPatientById/:id')
    async getPatient(
        @Param('id') id: string,
        @AuthenticatedUser() user: KeycloakUser,
    ): Promise<Patient> {
        const patient = await this.therapistWorkflowService.getPatientWithAssociation({patientId: id, therapistKeycloakId: user.sub});
        return patient;
    }

    @Patch('updatePatient/:id/:status')
    @UsePipes(ValidationPipe)
    async updatePatient(
        @Param('id') patientId: string,
        @Param('status', new StatusTypeValidationPipe(false))
        status: StatusType,
        @Body() patientDTO: PatientDTO,
        @AuthenticatedUser() user: KeycloakUser,
    ) {
        await this.therapistWorkflowService.updateNonRegisteredPatient({patientId, patientDTO, therapistKeycloakId: user.sub, status});
    }

    @Delete('removePatient/:id')
    async removePatient(
        @Param('id') patientId: string,
        @AuthenticatedUser() user: KeycloakUser,
    ) {
        await this.therapistWorkflowService.removeNonRegisteredPatient(patientId, user.sub)
    }
}
