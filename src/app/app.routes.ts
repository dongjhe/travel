import { Routes } from '@angular/router';
import { ExpenseAnalysis } from './pages/expense-analysis/expense-analysis';
import { FukuokaItinerary } from './pages/fukuoka-itinerary/fukuoka-itinerary';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'fukuoka-2026', component: FukuokaItinerary },
  {
    path: 'fukuoka-2026/expenses',
    component: ExpenseAnalysis,
    data: {
      tripId: 'fukuoka-2026',
      tripName: '福岡 6天5夜親子行程',
      backLink: '/fukuoka-2026',
    },
  },
  { path: 'expenses', redirectTo: 'fukuoka-2026/expenses' },
  { path: '**', redirectTo: '' },
];
