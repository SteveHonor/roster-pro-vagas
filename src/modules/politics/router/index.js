import Politics from '@/modules/politics/views/Index';

export default [
  {
    path: '/politics',
    name: 'politics',
    component: Politics,
    meta: {
      layout: 'empty',
      requiresAuth: false,
      breadcrumb: 'Cadastros'
    }
  }
];
