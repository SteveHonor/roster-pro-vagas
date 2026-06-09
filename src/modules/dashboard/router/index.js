import Dashboard from '@/modules/dashboard/views/Index';

export default [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      layout: 'default',
      requiresAuth: true,
      requiresOperator: true,
      title: 'DASHBOARD'
    }
  }
];
