import Settings from '@/modules/settings/views/Index';

export default [
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: {
      layout: 'default',
      requiresAuth: true,
      breadcrumb: 'Configurações'
    }
  }
];
