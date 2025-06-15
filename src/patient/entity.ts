import { Association } from 'src/association/entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export type GenderType = 'M' | 'W' | 'D';

@Entity()
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'uuid',
        unique: true,
        nullable: true,
    })
    keycloakId?: string;

    @Column({ length: 32, nullable: true })
    email: string;

    @Column({ length: 32, nullable: true })
    firstName: string;

    @Column({ length: 32, nullable: true })
    lastName: string;

    @Column({ length: 32, nullable: true })
    phoneNumber: string;

    @Column({ length: 32, nullable: true })
    gender: GenderType;

    @OneToMany(() => Association, (association) => association.patient)
    associations: Association[];
}
