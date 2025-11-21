import { Routes } from '@angular/router';
import { PROCESSES_ROUTES } from './features/processes/processes.routes';

export const routes: Routes = [
    ...PROCESSES_ROUTES,
    { path: '', redirectTo: 'processes', pathMatch: 'full' }
];
