import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'nest-keycloak-connect';
import { StatusType } from 'src/association/entity';
import { GenderType } from 'src/patient/entity';
import { TherapistController } from './controller';
import { TherapistService } from './worfklow.service';

// ------------------------------
// Create a mock for TherapistService.
// This mock replaces the actual service so the controller tests
// focus on validating that the controller correctly delegates calls.
const mockTherapistService = {
    getProfile: jest.fn(),
    createPatient: jest.fn(),
    updatePatient: jest.fn(),
    removePatient: jest.fn(),
    getPatientsFromTherapist: jest.fn(),
    getPatient: jest.fn(),
};

describe('TherapistController', () => {
    let controller: TherapistController;

    const dummyTherapist = {
        id: '123',
        therapistName: 'testTherapist',
        sub: 'testUUID',
    };

    const dummyPatientDTO = {
        email: 'testEmail',
        isRegistered: false,
        firstName: 'patientFirstName',
        lastName: 'patientLastName',
        phoneNumber: '1234567890',
        gender: 'M' as GenderType,
    };

    beforeEach(async () => {
        // Arrange: Build the testing module with the controller and our mocked service.
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TherapistController],
            providers: [
                { provide: TherapistService, useValue: mockTherapistService },
            ],
        })
            // Override the AuthGuard so that authentication does not interfere with tests.
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        // Retrieve an instance of the controller from the test module.
        controller = module.get<TherapistController>(TherapistController);

        jest.clearAllMocks();
    });

    // ========================================================
    // getProfile Tests
    // ========================================================
    describe('getProfile', () => {
        it('should return profile information for an authenticated therapist', async () => {
            // Arrange
            const expectedProfile = {
                id: '123',
                therapistName: 'testUser',
                info: 'Profile Data',
            };

            mockTherapistService.getProfile.mockResolvedValue(expectedProfile);

            // Act
            const result = await controller.getProfile(dummyTherapist);

            // Assert
            expect(mockTherapistService.getProfile).toHaveBeenCalledTimes(1);
            expect(mockTherapistService.getProfile).toHaveBeenCalledWith(
                dummyTherapist,
            );
            expect(result).toEqual(expectedProfile);
        });
    });

    // ========================================================
    // createPatient Tests
    // ========================================================
    describe('createPatient', () => {
        it('should create a new patient and return it', async () => {
            // Arrange
            const therapist = { sub: 'therapist-id' };
            const status = StatusType.WAITING;

            const createdPatient = { id: '1', ...dummyPatientDTO, status };

            mockTherapistService.createPatient.mockResolvedValue(
                createdPatient,
            );

            // Act
            const result = await controller.createPatient(
                status,
                therapist,
                dummyPatientDTO,
            );

            // Assert
            expect(mockTherapistService.createPatient).toHaveBeenCalledTimes(1);
            expect(mockTherapistService.createPatient).toHaveBeenCalledWith(
                dummyPatientDTO,
                therapist.sub,
                status,
            );
            expect(result).toEqual(createdPatient);
        });
    });

    // ========================================================
    // updatePatient Tests
    // ========================================================
    describe('updatePatient', () => {
        const patientDTO = {
            email: 'testEmail',
            isRegistered: true,
            firstName: 'updatedFirstName',
            lastName: 'patientLastName',
            phoneNumber: '1234567890',
            gender: 'M' as GenderType,
        };
        const therapist = { sub: 'therapist-id' };
        const patientId = 'patient-id';

        it('should update patient and return updated info', async () => {
            // Arrange
            const status = StatusType.ACTIVE;
            const updatedPatient = { id: patientId, ...patientDTO, status };

            mockTherapistService.updatePatient.mockResolvedValue(
                updatedPatient,
            );

            // Act
            const result = await controller.updatePatient(
                patientId,
                status,
                patientDTO,
                therapist,
            );

            // Assert
            expect(mockTherapistService.updatePatient).toHaveBeenCalledTimes(1);
            expect(mockTherapistService.updatePatient).toHaveBeenCalledWith(
                patientId,
                patientDTO,
                therapist.sub,
                status,
            );
            expect(result).toEqual(updatedPatient);
        });

        it('should propagate error if service throws (e.g. patient not found)', async () => {
            // Arrange
            const status = StatusType.INACTIVE;
            const errorMessage = 'Patient not found';

            mockTherapistService.updatePatient.mockRejectedValue(
                new Error(errorMessage),
            );

            // Act & Assert
            await expect(
                controller.updatePatient(
                    'non-existent-id',
                    status,
                    patientDTO,
                    therapist,
                ),
            ).rejects.toThrow(errorMessage);
        });
    });

    // ========================================================
    // removePatient Tests
    // ========================================================
    describe('removePatient', () => {
        it('should call service to remove a patient', async () => {
            // Arrange
            const user = { sub: 'therapist-id' };
            const patientId = 'patient-id';

            mockTherapistService.removePatient.mockResolvedValue({
                success: true,
            });

            // Act
            const result = await controller.removePatient(patientId, user);

            // Assert
            expect(mockTherapistService.removePatient).toHaveBeenCalledTimes(1);
            expect(mockTherapistService.removePatient).toHaveBeenCalledWith(
                patientId,
                user.sub,
            );
            expect(result).toEqual({ success: true });
        });
    });

    // ========================================================
    // getPatientsFromTherapist Tests
    // ========================================================
    describe('getPatientsFromTherapist', () => {
        it('should return a list of patients with the given status', async () => {
            // Arrange
            const therapist = { sub: 'therapist-id' };
            const status = StatusType.ACTIVE;
            const patients = [{ id: '1' }, { id: '2' }];

            mockTherapistService.getPatientsFromTherapist.mockResolvedValue(
                patients,
            );

            // Act
            const result = await controller.getPatientsFromTherapist(
                status,
                therapist,
            );

            // Assert
            expect(
                mockTherapistService.getPatientsFromTherapist,
            ).toHaveBeenCalledTimes(1);
            expect(
                mockTherapistService.getPatientsFromTherapist,
            ).toHaveBeenCalledWith(therapist.sub, status);
            expect(result).toEqual(patients);
        });
    });

    // ========================================================
    // getPatient Tests
    // ========================================================
    describe('getPatient', () => {
        it('should return a single patient by id', async () => {
            // Arrange
            const therapist = { sub: 'therapist-id' };
            const patientId = 'patient-id';
            const patientData = { id: patientId, name: 'Patient Name' };

            mockTherapistService.getPatient.mockResolvedValue({
                patient: patientData,
            });

            // Act
            const result = await controller.getPatient(patientId, therapist);

            // Assert
            expect(mockTherapistService.getPatient).toHaveBeenCalledTimes(1);
            expect(mockTherapistService.getPatient).toHaveBeenCalledWith(
                patientId,
                therapist.sub,
            );
            expect(result).toEqual(patientData);
        });
    });
});
