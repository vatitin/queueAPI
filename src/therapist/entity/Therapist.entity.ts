import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Therapist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  keycloakId: string;

  @Column({ length: 32 })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Column({ length: 32 })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Column({ length: 32 })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @Column({ length: 32, nullable: true })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @Column({ length: 32 })
  @IsString()
  @IsNotEmpty()
  city: string;

  @Column({ length: 32 })
  @IsString()
  @IsNotEmpty()
  postalCode: string;
}
