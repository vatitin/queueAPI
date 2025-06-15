import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Therapist } from 'src/therapist/entity';
import { TherapistResponseDTO } from 'src/therapist/therapist-response.dto';
import { Repository } from 'typeorm';

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
        const therapist = await this.therapistRepository.findOne({
            where: { keycloakId },
        });
        if (!therapist) return false;
        return true;
    }

    async getTherapistByKeycloakId(keycloakId: string) {
        let therapist = await this.therapistRepository.findOne({
            where: { keycloakId },
        });
        if (!therapist) {
            throw new NotFoundException('Therapist not found');
        }
        return therapist;
    }

    async getTherapistById(id: string) {
        let therapist = await this.therapistRepository.findOne({
            where: { id },
        });
        if (!therapist) {
            throw new NotFoundException('Therapist not found');
        }
        return therapist;
    }

    async getTherapistLocations(params: {
        lng: number;
        lat: number;
        distance: number;
    }): Promise<TherapistResponseDTO[]> {
        const { lng, lat, distance } = params;

        const distanceInMeters = distance * 1000;

        // get id + Standort, if ST_DWithin true
        const rawResults = await this.therapistRepository
            .createQueryBuilder('therapist')
            .select([
                'therapist.id AS id',
                'therapist.firstName AS firstName',
                'therapist.lastName AS lastName',
                'therapist.addressLine1 AS addressLine1',
                'therapist.addressLine2 AS addressLine2',
                'therapist.city AS city',
                'therapist.postalCode AS postalCode',
                'ST_X(therapist.location::geometry) AS longitude',
                'ST_Y(therapist.location::geometry) AS latitude',
            ])
            .where(
                `ST_DWithin(
            therapist.location,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
            :distanceInMeters
            )`,
            )
            .setParameters({ lng, lat, distanceInMeters })
            .getRawMany<{
                id: string;
                firstname: string;
                lastname: string;
                addressline1: string;
                addressline2: string;
                city: string;
                postalcode: string;
                longitude: number;
                latitude: number;
            }>();

        console.log('Raw results: ', rawResults.length);

        return rawResults.map((r) => {
            const therapistLocation: TherapistResponseDTO = {
                id: r.id,
                firstName: r.firstname,
                lastName: r.lastname,
                addressLine1: r.addressline1,
                addressLine2: r.addressline2,
                city: r.city,
                postalCode: r.postalcode,
                location: {
                    type: 'Point',
                    coordinates: [r.latitude, r.longitude],
                },
            };
            console.log('therapistLocation: ', therapistLocation);
            return therapistLocation;
        });
    }
}
