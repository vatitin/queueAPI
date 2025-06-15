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
import { StatusType } from 'src/association/entity';
import { AssociationService } from 'src/domain/association.service';
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
        private associationService: AssociationService,
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
        @Body() patientDTO: LocalPatientDTO,
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
    ): Promise<Patient[]> {
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
    async updatePatient(
        @Param('id') patientId: string,
        @Param('status', new StatusTypeValidationPipe(false))
        status: StatusType,
        @Body() localPatientDTO: LocalPatientDTO,
        @AuthenticatedUser() user: KeycloakUserDTO,
    ) {
        await this.therapistWorkflowService.updateNonRegisteredPatient({
            patientId,
            localPatientDTO,
            therapistKeycloakId: user.sub,
            status,
        });
    }

    @Delete('removePatient/:id')
    async removePatient(
        @Param('id') patientId: string,
        @AuthenticatedUser() user: KeycloakUserDTO,
    ) {
        await this.therapistWorkflowService.removeNonRegisteredPatient(
            patientId,
            user.sub,
        );
    }
}
