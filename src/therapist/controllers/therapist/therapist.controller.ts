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
import { TherapistService } from '../../services/therapist/therapist.service';
import { PatientDTO } from './DTO/PatientDTO.entity';
import { StatusTypeValidationPipe } from './statusType.validation.pipe';
import { TherapistFormDTO } from './DTO/TherapistFormDTO.entity';

@UseGuards(AuthGuard)
@Controller('therapist')
export class TherapistController {
    constructor(private therapistService: TherapistService) {}

    @Patch('updatePatient/:id/:status')
    @UsePipes(ValidationPipe)
    updatePatient(
        @Param('id') id: string,
        @Param('status', new StatusTypeValidationPipe(false))
        status: StatusType,
        @Body() patientDTO: PatientDTO,
        @AuthenticatedUser() user: KeycloakUser,
    ) {
        return this.therapistService.updatePatient(
            id,
            patientDTO,
            user.sub,
            status,
        );
    }

    @Delete('removePatient/:id')
    @UsePipes(ValidationPipe)
    async removePatient(
        @Param('id') id: string,
        @AuthenticatedUser() user: KeycloakUser,
    ) {
        return await this.therapistService.removePatient(id, user.sub);
    }

    @Post('createPatient/:status')
    @UsePipes(ValidationPipe)
    async createPatient(
        @Param('status', new StatusTypeValidationPipe()) status: StatusType,
        @AuthenticatedUser() user: KeycloakUser,
        @Body() patientDTO: PatientDTO,
    ) {
        return await this.therapistService.createPatient(
            patientDTO,
            user.sub,
            status,
        );
    }

    @Get('myProfile')
    async getProfile(@AuthenticatedUser() therapist: KeycloakUser) {
        return await this.therapistService.getProfile(therapist);
    }

    @Get('patients/:status')
    async getPatientsFromTherapist(
        @Param('status', new StatusTypeValidationPipe()) status: StatusType,
        @AuthenticatedUser() user: KeycloakUser,
    ): Promise<Patient[]> {
        const patients = await this.therapistService.getPatientsFromTherapist(
            user.sub,
            status,
        );

        return patients;
    }

    @Get('patients/byId/:id')
    async getPatient(
        @Param('id') id: string,
        @AuthenticatedUser() user: KeycloakUser,
    ): Promise<Patient> {
        const userId = user.sub;
        const { patient } = await this.therapistService.getPatient(id, userId);
        return patient;
    }

    @Get('hasLocalTherapist')
    async hasLocalTherapist(@AuthenticatedUser() therapist: KeycloakUser) {
        return await this.therapistService.hasLocalTherapist(therapist);
    }

    @Post('createTherapist')
    async createTherapist(@AuthenticatedUser() therapist: KeycloakUser, therapistForm: TherapistFormDTO) {
        return await this.therapistService.createTherapist(therapist, therapistForm);
    }
}
