import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProcessService {
    private baseUrl = 'http://localhost:8080'

    constructor(private http: HttpClient) {}

    terminateProcess(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/terminate/${pid}`);
    }

    clearWorkingSet(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/clear/${pid}`);
    }
}