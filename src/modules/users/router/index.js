import Users from '@/modules/users/views/Index';

export default [
  {
    path: '/users',
    name: 'users',
    component: Users,
    meta: {
      layout: 'default',
      requiresAuth: true,
      breadcrumb: 'Equipe'
    }
  }
];
