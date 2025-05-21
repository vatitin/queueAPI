import { Injectable } from '@nestjs/common';
import { RegisterDTO } from 'src/therapist/controllers/therapist/DTO/RegisterDTO.entity';
import { ConfigService } from '@nestjs/config';
import { KeycloakAdminClient } from '@s3pweb/keycloak-admin-client-cjs';

@Injectable()
export class AuthService {

  private keycloakAdminClient: KeycloakAdminClient;

  constructor(private configService: ConfigService) {
    this.keycloakAdminClient = new KeycloakAdminClient({
      baseUrl: this.configService.get<string>('KEYCLOAK_BASE_URL'),
      realmName: this.configService.get<string>('KEYCLOAK_REALM_NAME'),
    });
  }

  async initAdminClient() {
    
    try {
      const clientId = this.configService.get<string>('KEYCLOAK_BACKEND_CLIENT_ID')?? '';
      const clientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET')?? '';

      await this.keycloakAdminClient.auth({
        grantType: 'client_credentials',
        clientId: clientId,
        clientSecret: clientSecret,
      });
    } catch (error) {
      throw error;
    }
  }

  async registerUser(dto: RegisterDTO) {
    await this.initAdminClient();

    const createdUser = await this.keycloakAdminClient.users.create({
      // realm is typically not needed here as it's set in the client config
      username: dto.email, // Often good to set username, can be same as email
      email: dto.email,
      enabled: true,
      emailVerified: false, // You might want to set this based on your flow
      credentials: [
        {
          type: 'password',
          value: dto.password,
          temporary: false, // Set to true if you want the user to change password on first login
        },
      ],
    });

    //login user here
    return createdUser.id; // id should be a string (UUID)
  }
}  

