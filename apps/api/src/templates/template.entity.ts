import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('survey_templates')
export class SurveyTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  category: string; // nps | satisfaction | event | general

  @Column('simple-json')
  questions: any[];

  @CreateDateColumn()
  createdAt: Date;
}
