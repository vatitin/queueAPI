import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Point, Geometry } from 'geojson'; 
import { Association } from 'src/association/entity';

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

  @Column({
  type: 'geography',  
  spatialFeatureType: 'Point', 
  srid: 4326,            
  nullable: true,     
  })
  location: Point;

  @OneToMany(
  () => Association,
      association => association.therapist,
  )
  associations: Association[];
}
