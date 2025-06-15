import {
  IsEmail,
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

  @Column({
    type: 'uuid',  
    unique: true, 
    nullable: false,
  })
  keycloakId: string;

  @Column({
    type: 'varchar',           
    unique: true,       
    nullable: false,
  })
  email: string;

  @Column({
     length: 32, 
     nullable: true,
  })
  firstName: string;

  @Column({
     length: 32, 
     nullable: true,
  })
  lastName: string;

  @Column({
     length: 32, 
     nullable: true,
  })
  addressLine1: string;

  @Column({
     length: 32, 
     nullable: true,
  })
  addressLine2?: string;

  @Column({
     length: 32, 
     nullable: true,
  })
  city: string;

  @Column({
     length: 32, 
     nullable: true,
  })
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
