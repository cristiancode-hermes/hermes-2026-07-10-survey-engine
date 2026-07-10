import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../models/types';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getQuestions(surveyId: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/surveys/${surveyId}/questions`);
  }

  addQuestion(surveyId: string, data: Partial<Question>): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/surveys/${surveyId}/questions`, data);
  }

  updateQuestion(questionId: string, data: Partial<Question>): Observable<Question> {
    return this.http.patch<Question>(`${this.apiUrl}/questions/${questionId}`, data);
  }

  deleteQuestion(questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/questions/${questionId}`);
  }

  reorderQuestions(surveyId: string, ids: string[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/surveys/${surveyId}/questions/reorder`, { ids });
  }
}
