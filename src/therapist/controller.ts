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
import { Association, StatusType } from 'src/association/entity';
import { KeycloakUserDTO } from 'src/keycloak-user.dto';
import { LocalPatientDTO } from 'src/patient/create-local.dto';
import { Patient } from 'src/patient/entity';
import { StatusTypeValidationPipe } from './statusType.validation.pipe';
import { TherapistFormDTO } from './TherapistFormDTO.entity';
import { TherapistWorkflowService } from './worfklow.service';

@UseGuards(AuthGuard)
@Controller('therapist')
export class TherapistController {
    constructor(
        private therapistWorkflowService: TherapistWorkflowService,
    ) {}

    @Get('myProfile')
    async getProfile(@AuthenticatedUser() therapist: KeycloakUserDTO) {
        return await this.therapistWorkflowService.getProfile(therapist);
    }

    @Get('hasLocalTherapist')
    async hasLocalTherapist(@AuthenticatedUser() therapist: KeycloakUserDTO) {
        return await this.therapistWorkflowService.hasLocalTherapist(therapist);
    }

    @Post('createTherapist')
    async createTherapist(
        @AuthenticatedUser() therapist: KeycloakUserDTO,
        @Body() therapistForm: TherapistFormDTO,
    ) {
        return await this.therapistWorkflowService.createTherapist(
            therapist,
            therapistForm,
        );
    }

    @Post('createPatient/:status')
    @UsePipes(ValidationPipe)
    async createPatient(
        @Param('status', new StatusTypeValidationPipe()) status: StatusType,
        @AuthenticatedUser() user: KeycloakUserDTO,
        @Body() patientDTO: LocalPatientDTO
    ) {
        await this.therapistWorkflowService.addPatientToTherapist(
            patientDTO,
            user.sub,
            status,
        );
    }

    @Get('getPatientsByStatus/:status')
    async getPatientsFromTherapist(
        @Param('status', new StatusTypeValidationPipe()) status: StatusType,
        @AuthenticatedUser() user: KeycloakUserDTO,
    ): Promise<Association[]> {
        const patients =
            await this.therapistWorkflowService.getPatientsFromTherapist(
                user.sub,
                status,
            );
        return patients;
    }

    @Get('getPatientById/:id')
    async getPatient(
        @Param('id') id: string,
        @AuthenticatedUser() user: KeycloakUserDTO,
    ): Promise<Patient> {
        const patient =
            await this.therapistWorkflowService.getPatientWithAssociation({
                patientId: id,
                therapistKeycloakId: user.sub,
            });
        return patient;
    }

    @Patch('updatePatient/:id/:status')
    @UsePipes(ValidationPipe)
    async updateLocalPatient(
        @Param('id') patientId: string,
        @Param('status', new StatusTypeValidationPipe(false))
        @Body() localPatientDTO: LocalPatientDTO,
        @AuthenticatedUser() user: KeycloakUserDTO,
    ) {
        await this.therapistWorkflowService.updateLocalPatient({
            patientId,
            localPatientDTO,
            therapistKeycloakId: user.sub,
        });
    }

    @Patch('updatePatientStatus/:id/:newStatus')
    @UsePipes(ValidationPipe)
    async updatePatientStatus(
        @Param('id') patientId: string,
        @Param('newStatus', new StatusTypeValidationPipe(false))
        newStatus: StatusType,
        @AuthenticatedUser() user: KeycloakUserDTO,
    ) {
        await this.therapistWorkflowService.updatePatientStatus({
            patientId,
            therapistKeycloakId: user.sub,
            newStatus,
        });
    }

    @Delete('removePatient/:id')
    async removePatient(
        @Param('id') patientId: string,
        @AuthenticatedUser() user: KeycloakUserDTO,
    ) {
        console.log('removePatient');
        await this.therapistWorkflowService.removeNonRegisteredPatient(
            patientId,
            user.sub,
        );
    }
}
