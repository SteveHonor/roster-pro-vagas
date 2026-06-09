import Reports from '@/modules/reports/views/Index';

export default [
  {
    path: '/reports',
    meta: {
      breadcrumb: 'Relatórios'
    },
    children: [
      {
        path: '',
        name: 'reports',
        component: Reports,
        meta: {
          layout: 'default',
          requiresAuth: true,
          requiresOperator: true,
          requiresFeature: 'monthlyReport'
        }
      }
    ]
  }
];
