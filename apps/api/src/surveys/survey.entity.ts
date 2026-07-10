import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { Question } from '../questions/question.entity';
import { Response } from '../responses/response.entity';

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.surveys)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: 'draft' })
  status: string; // draft | active | closed

  @Column('simple-json', { default: '{}' })
  settings: Record<string, any>;

  @Column({ default: 0 })
  responseCount: number;

  @Column('real', { default: 0 })
  completionRate: number;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  closedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Question, (question) => question.survey)
  questions: Question[];

  @OneToMany(() => Response, (response) => response.survey)
  responses: Response[];
}
