import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    KeycloakConnectModule,
    PolicyEnforcementMode,
    TokenValidation,
} from 'nest-keycloak-connect';
import { Patient } from 'src/therapist/entity/Patient.entity';
import { PatientTherapist } from 'src/therapist/entity/PatientTherapist.entity';
import { Therapist } from 'src/therapist/entity/Therapist.entity';
import { TherapistService } from 'src/therapist/services/therapist/therapist.service';

@Module({
    imports: [
        //todo set appropriate token lifetime regarding Offline token validation
        KeycloakConnectModule.register({
            authServerUrl: 'http://localhost:8080',
            realm: 'patient-therapist-platform',
            clientId: 'backend-client',
            secret: 'HQRcZCbVoN8mKd6puDNyOYWTULauM7Vo', //todo change secret and use in env
            //todo change permissive to sth else
            policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
            //todo maybe user ONLINE, needs to be checked
            tokenValidation: TokenValidation.ONLINE,
        }),
        TypeOrmModule.forFeature([Patient, Therapist, PatientTherapist]),
    ],
    providers: [
        TherapistService,
    ],
    exports: [KeycloakConnectModule],
    controllers: [],
})
export class AuthModule {}
