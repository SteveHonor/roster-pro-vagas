import AgendaIndex from '@/modules/agenda/views/AgendaIndex';

export default [
  {
    path: '/agenda',
    name: 'agenda',
    component: AgendaIndex,
    meta: {
      layout: 'default',
      requiresAuth: true,
      requiresOperator: true,
      breadcrumb: 'Agenda'
    }
  }
];
