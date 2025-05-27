import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Therapist } from 'src/therapist/entity';
import { Repository } from 'typeorm';
import { TherapistFormDTO } from 'src/therapist/TherapistFormDTO.entity';
import { TherapistDTO } from 'src/therapist/create.dto';

@Injectable()
export class TherapistCRUDService {

    constructor(
        @InjectRepository(Therapist)
        private readonly therapistRepository: Repository<Therapist>,
    ) {}

    create(dto: Partial<Therapist>): Promise<Therapist> {
        return this.therapistRepository.save(dto);
    }

    async existsByKeycloakId(keycloakId: string): Promise<boolean> {
        const therapist = await this.therapistRepository.findOne({ where: { keycloakId } })
        if (!therapist) return false;
        return true;
    }
    
    async findTherapist(keycloakId: string) {
        let therapist = await this.therapistRepository.findOne({
            where: { keycloakId },
        });
        if (!therapist) {
            throw new NotFoundException('Therapist not found');
        }
        return therapist;
    }

    async findAllLocations(): Promise<
        Array<{ id: string; latitude: number; longitude: number }>
    > {
    const rows = await this.therapistRepository.find({ select: ['id', 'location'] });
    return rows
      .filter((t) => Array.isArray(t.location?.coordinates))
      .map((t) => ({
        id: t.id,
        longitude: t.location.coordinates[0],
        latitude: t.location.coordinates[1],
      }));
  }
}