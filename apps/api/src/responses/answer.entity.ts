import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Response } from './response.entity';
import { Question } from '../questions/question.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  responseId: string;

  @ManyToOne(() => Response, (response) => response.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'responseId' })
  response: Response;

  @Column()
  questionId: string;

  @ManyToOne(() => Question, (question) => question.answers)
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column('simple-json')
  value: any;
}
