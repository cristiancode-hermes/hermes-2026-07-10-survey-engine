import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Template } from '../models/types';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(`${this.apiUrl}/templates`);
  }

  getTemplate(id: string): Observable<Template> {
    return this.http.get<Template>(`${this.apiUrl}/templates/${id}`);
  }
}
