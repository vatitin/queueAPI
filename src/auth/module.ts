import { Module } from '@nestjs/common';
import {
    KeycloakConnectModule,
    PolicyEnforcementMode,
    TokenValidation,
} from 'nest-keycloak-connect';

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
    ],
    exports: [KeycloakConnectModule],
})
export class AuthModule {}
