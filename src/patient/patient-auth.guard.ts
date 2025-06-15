import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard, AuthenticatedUser } from 'nest-keycloak-connect';
import { PatientCRUDService } from '../domain/patient.crud.service';

@Injectable()
export class PatientAuthGuard implements CanActivate {
  constructor(
    private readonly keycloakGuard: AuthGuard,
    private readonly patientCrud: PatientCRUDService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // 1) Run the standard Keycloak checks
    const allowed = (await this.keycloakGuard.canActivate(ctx)) as boolean;
    if (!allowed) {
      throw new ForbiddenException('Not authenticated');
    }

    // 2) Grab the user off of the request
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub: string };

    // 3) Enforce your “must-exist” business rule
    const patient = await this.patientCrud.getPatientByKeycloakId(user.sub);
    if (!patient) {
      throw new NotFoundException(`No patient found for ${user.sub}`);
    }

    // 4) All good → allow access  
    return true;
  }
}