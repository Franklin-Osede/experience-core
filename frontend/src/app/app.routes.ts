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
    component: Onboarding,
  },
  {
    path: 'onboarding/dj',
    component: Onboarding, // TODO: Crear componente específico para DJ
  },
  {
    path: 'onboarding/venue',
    component: Onboarding, // TODO: Crear componente específico para Venue
  },
  {
    path: 'onboarding/provider',
    component: Onboarding, // TODO: Crear componente específico para Provider
  },
];
