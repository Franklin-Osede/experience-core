import { Routes } from '@angular/router';
import { Onboarding } from './onboarding/onboarding';
import { RoleSelection } from './role-selection/role-selection';
import { Login } from './login/login';

export const routes: Routes = [
  {
    path: '',
    component: Login,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'role-selection',
    component: RoleSelection,
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding/fan/fan').then(m => m.OnboardingFanComponent),
  },
  {
    path: 'onboarding/fan',
    redirectTo: 'onboarding',
    pathMatch: 'full'
  },
  {
    path: 'onboarding/dj',
    loadComponent: () => import('./onboarding/dj/dj').then(m => m.OnboardingDjComponent), 
  },
  {
    path: 'onboarding/venue',
    loadComponent: () => import('./onboarding/venue/venue').then(m => m.OnboardingVenueComponent), 
  },
  {
    path: 'onboarding/provider',
    loadComponent: () => import('./onboarding/provider/provider').then(m => m.OnboardingProviderComponent), 
  },
];
