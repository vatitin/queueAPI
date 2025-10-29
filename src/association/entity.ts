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
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    lastStatusChange: Date;

    @Column({ type: 'enum', enum: StatusType, default: 'waiting' })
    status: StatusType;

    @Column({ type: 'text', nullable: true})
    applicationText?: string;

    @Column({ type: 'text', nullable: true})
    comment?: string;

    @ManyToOne(() => Patient, (patient) => patient.id, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    patient: Patient;

    @ManyToOne(() => Therapist, (therapist) => therapist.id, {
        nullable: false,
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete',
    })
    therapist: Therapist;
}
