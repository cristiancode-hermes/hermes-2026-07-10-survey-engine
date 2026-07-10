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
import { Survey } from '../surveys/survey.entity';
import { Answer } from '../responses/answer.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  surveyId: string;

  @ManyToOne(() => Survey, (survey) => survey.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;

  @Column()
  type: string; // text | single_choice | multiple_choice | rating | yes_no | dropdown | nps

  @Column()
  label: string;

  @Column({ nullable: true })
  description: string;

  @Column('simple-json', { nullable: true })
  options: string[];

  @Column({ default: false })
  required: boolean;

  @Column()
  position: number;

  @Column('simple-json', { default: '{}' })
  settings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}
