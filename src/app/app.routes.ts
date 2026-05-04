import { Routes } from '@angular/router';
import { ExpenseAnalysis } from './pages/expense-analysis/expense-analysis';
import { FukuokaItinerary } from './pages/fukuoka-itinerary/fukuoka-itinerary';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'fukuoka-2026', component: FukuokaItinerary },
  { path: 'expenses', component: ExpenseAnalysis },
  { path: '**', redirectTo: '' },
];
