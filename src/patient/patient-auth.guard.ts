import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from 'nest-keycloak-connect';
import { PatientCRUDService } from '../domain/patient.crud.service';

@Injectable()
export class PatientAuthGuard implements CanActivate {
    constructor(
        private readonly keycloakGuard: AuthGuard,
        private readonly patientCrud: PatientCRUDService,
    ) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {

        const allowed = (await this.keycloakGuard.canActivate(ctx)) as boolean;
        if (!allowed) {
            throw new ForbiddenException('Not authenticated');
        }

        const req = ctx.switchToHttp().getRequest();
        const user = req.user as { sub: string };

        const patient = await this.patientCrud.getPatientByKeycloakId(user.sub);
        if (!patient) {
            throw new NotFoundException(`No patient found for ${user.sub}`);
        }

        return true;
    }
}
