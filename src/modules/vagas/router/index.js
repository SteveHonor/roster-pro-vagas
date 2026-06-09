import VagasIndex from '@/modules/vagas/views/VagasIndex';
import VagasJobForm from '@/modules/vagas/views/VagasJobForm';
import VagasJobPipeline from '@/modules/vagas/views/VagasJobPipeline';

export default [
  {
    path: '/vagas',
    meta: {
      breadcrumb: 'Vagas'
    },
    children: [
      {
        path: '',
        name: 'vagas',
        component: VagasIndex,
        meta: {
          layout: 'default',
          requiresAuth: true,
          requiresOperator: true
        }
      },
      {
        path: 'nova',
        name: 'vagas-nova',
        component: VagasJobForm,
        meta: {
          layout: 'default',
          requiresAuth: true,
          requiresOperator: true
        }
      },
      {
        path: ':id/editar',
        name: 'vagas-editar',
        component: VagasJobForm,
        meta: {
          layout: 'default',
          requiresAuth: true,
          requiresOperator: true
        }
      },
      {
        path: ':id/pipeline',
        name: 'vagas-pipeline',
        component: VagasJobPipeline,
        meta: {
          layout: 'default',
          requiresAuth: true,
          requiresOperator: true
        }
      }
    ]
  }
];
