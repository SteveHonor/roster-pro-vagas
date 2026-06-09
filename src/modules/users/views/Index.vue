<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold text-slate-800">Equipe</h1>
        <p class="text-xs text-slate-400">Gerencie quem tem acesso ao RosterPro Vagas</p>
      </div>
    </div>

    <UserList />
    <UserForm />
  </div>
</template>

<script>
import UserForm from '@/modules/users/views/user/Form';
import UserList from '@/modules/users/views/user/List';
import { useBreadcrumbStore } from '@/components/breadcrumb/store';

export default {
  components: { UserForm, UserList },

  computed: {
    breadcrumbStore: () => useBreadcrumbStore()
  },

  mounted() {
    this.breadcrumbStore.setBreadcrumb([{ name: 'Equipe', path: '/users' }]);
  }
};
</script>
