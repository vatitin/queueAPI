import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GenderType, Patient } from 'src/patient/entity';
import {
    Association,
    StatusType,
} from 'src/association/entity';
import { Therapist } from 'src/therapist/entity';
import { Repository } from 'typeorm';
import { TherapistService } from './worfklow.service';

// ------------------------------
// Mock Factories for Repositories
// ------------------------------
const mockPatientRepo = () => ({
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
});

const mockTherapistRepo = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
});

const mockAssociationRepo = () => ({
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
});

// ------------------------------
// Common Dummy Data
// ------------------------------
const dummyPatientDTO = {
    email: 'test@example.com',
    isRegistered: false,
    firstName: 'patientFirstName',
    lastName: 'patientLastName',
    phoneNumber: '1234567890',
    gender: 'D' as GenderType,
};

const dummyPatient: Patient = {
    id: 'p1',
    ...dummyPatientDTO,
};

const dummyTherapist: Therapist = {
    id: 't1',
    keycloakId: 'therapistKeycloakId',
};

const dummyAssociation: Association = {
    id: 1,
    patient: dummyPatient,
    therapist: dummyTherapist,
    status: StatusType.ACTIVE,
    lastStatusChange: new Date(),
};

describe('TherapistService', () => {
    let service: TherapistService;
    let patientRepo: jest.Mocked<Repository<Patient>>;
    let therapistRepo: jest.Mocked<Repository<Therapist>>;
    let associationRepo: jest.Mocked<Repository<Association>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TherapistService,
                {
                    provide: getRepositoryToken(Patient),
                    useFactory: mockPatientRepo,
                },
                {
                    provide: getRepositoryToken(Therapist),
                    useFactory: mockTherapistRepo,
                },
                {
                    provide: getRepositoryToken(Association),
                    useFactory: mockAssociationRepo,
                },
            ],
        }).compile();

        service = module.get<TherapistService>(TherapistService);
        patientRepo = module.get(getRepositoryToken(Patient));
        therapistRepo = module.get(getRepositoryToken(Therapist));
        associationRepo = module.get(getRepositoryToken(Association));

        jest.clearAllMocks();
    });

    // ========================================================
    // createPatient Tests
    // ========================================================
    describe('createPatient', () => {
        it('should create patient and patient-therapist link', async () => {
            // Arrange
            const therapistId = dummyTherapist.keycloakId;
            const savedPatient = { id: '1', ...dummyPatientDTO };
            const therapist = { ...dummyTherapist };

            therapistRepo.findOne.mockResolvedValue(therapist);
            patientRepo.save.mockResolvedValue(savedPatient);
            associationRepo.save.mockResolvedValue({
                id: 1,
                therapist,
                patient: savedPatient,
                status: StatusType.ACTIVE,
                lastStatusChange: new Date(),
            });

            // Act
            const result = await service.createPatient(
                dummyPatientDTO,
                therapistId,
                StatusType.ACTIVE,
            );

            // Assert
            expect(result).toEqual(savedPatient);
            expect(patientRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({ isRegistered: false }),
            );
            expect(associationRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    therapist,
                    patient: savedPatient,
                    status: StatusType.ACTIVE,
                }),
            );
        });

        it('should throw if therapist not found', async () => {
            // Arrange: simulate not finding a therapist by returning null
            therapistRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(
                service.createPatient(
                    { email: 'x' } as any,
                    'invalid-id',
                    StatusType.WAITING,
                ),
            ).rejects.toThrow(BadRequestException);
        });
    });

    // ========================================================
    // getPatient Tests
    // ========================================================
    describe('getPatient', () => {
        it('should return patient and association', async () => {
            // Arrange: Simulate finding a patient and the associationship
            patientRepo.findOne.mockResolvedValue(dummyPatient);
            associationRepo.findOne.mockResolvedValue(
                dummyAssociation,
            );

            // Act
            const result = await service.getPatient(
                dummyPatient.id,
                dummyTherapist.keycloakId,
            );

            // Assert
            expect(patientRepo.findOne).toHaveBeenCalledWith({
                where: { id: dummyPatient.id },
            });
            expect(associationRepo.findOne).toHaveBeenCalledWith({
                where: {
                    patient: { id: dummyPatient.id },
                    therapist: { keycloakId: dummyTherapist.keycloakId },
                },
            });
            expect(result).toEqual({
                patient: dummyPatient,
                association: dummyAssociation,
            });
        });

        it('should throw if patient not found', async () => {
            // Arrange
            patientRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(
                service.getPatient('invalid', dummyTherapist.keycloakId),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw if associationship not found', async () => {
            // Arrange
            patientRepo.findOne.mockResolvedValue(dummyPatient);
            associationRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(
                service.getPatient(dummyPatient.id, dummyTherapist.keycloakId),
            ).rejects.toThrow(NotFoundException);
        });
    });

    // ========================================================
    // updatePatient Tests
    // ========================================================
    describe('updatePatient', () => {
        it('should update fields and status', async () => {
            // Arrange
            const originalPatient = {
                ...dummyPatient,
                firstName: 'oldFirstName',
            };
            const updatedDTO = { ...dummyPatient, firstName: 'newFirstName' };
            const association = {
                ...dummyAssociation,
                patient: originalPatient,
                status: StatusType.WAITING,
            };

            jest.spyOn(service, 'getPatient').mockResolvedValue({
                patient: originalPatient,
                association,
            });
            patientRepo.save.mockResolvedValue({
                ...originalPatient,
                ...updatedDTO,
            });

            // Act
            const result = await service.updatePatient(
                originalPatient.id,
                updatedDTO,
                dummyTherapist.keycloakId,
                StatusType.ACTIVE,
            );

            // Assert
            expect(result.firstName).toBe('newFirstName');
            expect(association.status).toBe(StatusType.ACTIVE);
            expect(service.getPatient).toHaveBeenCalledWith(
                originalPatient.id,
                dummyTherapist.keycloakId,
            );
            expect(patientRepo.save).toHaveBeenCalled();
        });
    });

    // ========================================================
    // removePatient Tests
    // ========================================================
    describe('removePatient', () => {
        it('should remove only patient-therapist if patient is not registered', async () => {
            // Arrange: patient is not registered
            const unregisteredPatient = {
                ...dummyPatient,
                isRegistered: false,
            };
            const association = {
                ...dummyAssociation,
                patient: unregisteredPatient,
            };

            jest.spyOn(service, 'getPatient').mockResolvedValue({
                patient: unregisteredPatient,
                association,
            });

            // Act
            const result = await service.removePatient(
                unregisteredPatient.id,
                dummyTherapist.keycloakId,
            );

            // Assert
            expect(associationRepo.remove).toHaveBeenCalledWith(
                association,
            );
            expect(patientRepo.remove).not.toHaveBeenCalled();
            expect(result.message).toMatch(/association removed/);
        });

        it('should also remove patient if patient is registered', async () => {
            // Arrange: patient is registered
            const registeredPatient = { ...dummyPatient, isRegistered: true };
            const association = {
                ...dummyAssociation,
                patient: registeredPatient,
            };

            jest.spyOn(service, 'getPatient').mockResolvedValue({
                patient: registeredPatient,
                association,
            });

            // Act
            const result = await service.removePatient(
                registeredPatient.id,
                dummyTherapist.keycloakId,
            );

            // Assert
            expect(patientRepo.remove).toHaveBeenCalledWith(registeredPatient);
            expect(result.message).toMatch(/association and patient removed/);
        });
    });

    // ========================================================
    // getProfile Tests
    // ========================================================
    describe('getProfile', () => {
        it('should return profile info from keycloak user', async () => {
            // Arrange
            const keycloakUser = {
                sub: 'keycloakUserId',
                family_name: 'Doe',
                given_name: 'John',
                email: 'john@example.com',
            };

            // Act
            const result = await service.getProfile(keycloakUser);

            // Assert
            expect(result).toEqual({
                family_name: 'Doe',
                given_name: 'John',
                email: 'john@example.com',
            });
        });

        it('should throw if keycloak user is missing', async () => {
            // Act & Assert
            await expect(service.getProfile(undefined as any)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    // ========================================================
    // getPatientsFromTherapist Tests
    // ========================================================
    describe('getPatientsFromTherapist', () => {
        it('should return a sorted list with sequence numbers', async () => {
            // Arrange: create two sample patient objects with predictable order via lastStatusChange
            const patient1 = {
                ...dummyPatient,
                id: 'p1',
                firstName: 'firstPatient',
            };
            const patient2 = {
                ...dummyPatient,
                id: 'p2',
                firstName: 'secondPatient',
                gender: 'W' as GenderType,
            };

            const therapist = { ...dummyTherapist };

            associationRepo.find.mockResolvedValue([
                {
                    id: 1,
                    patient: patient1,
                    therapist,
                    status: StatusType.ACTIVE,
                    lastStatusChange: new Date('2023-01-01'),
                },
                {
                    id: 2,
                    patient: patient2,
                    therapist,
                    status: StatusType.ACTIVE,
                    lastStatusChange: new Date('2023-01-02'),
                },
            ]);

            // Act
            const result = await service.getPatientsFromTherapist(
                therapist.keycloakId,
                StatusType.ACTIVE,
            );

            // Assert: ensure sequence numbers are applied in order
            expect(result[0].sequence).toBe(1);
            expect(result[1].sequence).toBe(2);
        });
    });
});
