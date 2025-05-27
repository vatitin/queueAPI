import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Patient } from '../patient/entity';
import { Therapist } from '../therapist/entity';

export enum StatusType {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    WAITING = 'waiting',
}

@Entity()
export class Association {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Patient, (patient) => patient.id, { 
        nullable: false, onDelete: 'CASCADE', 
    })
    patient: Patient;

    @ManyToOne(() => Therapist, (therapist) => therapist.id, {
        nullable: false, onDelete: 'CASCADE', 
    })
    therapist: Therapist;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    lastStatusChange: Date;

    @Column({ type: 'enum', enum: StatusType, default: 'waiting' })
    status: StatusType;
}
