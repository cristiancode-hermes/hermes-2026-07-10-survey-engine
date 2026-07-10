import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Survey } from '../surveys/survey.entity';
import { Answer } from './answer.entity';

@Entity('responses')
export class Response {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  surveyId: string;

  @ManyToOne(() => Survey, (survey) => survey.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;

  @Column({ nullable: true })
  respondentEmail: string;

  @Column({ default: true })
  isComplete: boolean;

  @Column({ default: () => "datetime('now')" })
  startedAt: Date;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  timeToComplete: number; // seconds

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Answer, (answer) => answer.response)
  answers: Answer[];
}
