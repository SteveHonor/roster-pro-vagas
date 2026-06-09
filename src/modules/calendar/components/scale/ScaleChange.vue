<template>
  <Drawer
    context="changeScheduleRequest"
    confirm-label="Aprovar solicitação"
    cancel-label="Recusar solicitação"
    :confirmation="true"
    :on-confirm="approve"
    :on-cancel="
      () => {
        reject();
        reset();
      }
    "
    :on-open="
      () => {
        usersForChange();
      }
    "
  >
    <div v-if="change?.requester">
      <FormInput
        v-model="change.requester.name"
        label="Solicitante:"
        :disabled="true"
      />
    </div>
    <div v-if="change.users && change.users.length">
      <div class="mt-6">
        <p class="mb-2 text-sm font-medium text-gray-800">
          Solicitou troca com:
        </p>

        <div class="space-y-2">
          <label
            v-for="(user, index) in change.users.filter(
              user => user.id != authStore.user.id
            )"
            :key="index"
            class="flex cursor-pointer items-center justify-between rounded border px-4 py-2 transition duration-150"
            :class="handlePresenter(user).class"
          >
            <span class="text-sm text-gray-800">{{ user.name }}</span>
            <span class="text-sm">{{ handlePresenter(user).title }}</span>
          </label>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer.vue';
import FormInput from '@/components/form/Input.vue';
import { useScheduleStore } from '@/modules/calendar/store/schedule';
import { useAuthStore } from '@/modules/auth/store';
import { useTabStore } from '@/components/tab/store';

export default {
  name: 'FormChange',
  components: {
    Drawer,
    FormInput
  },
  emits: ['save'],
  data() {
    return {
      change: [],
      selectedUsers: [],
      changeUsers: []
    };
  },
  computed: {
    scheduleStore: () => useScheduleStore(),
    authStore: () => useAuthStore(),
    tabStore: () => useTabStore(),
    applicant: self => self.authStore.user.name
  },
  methods: {
    reset() {
      this.users = {};
      this.selectedUsers = [];
      this.changeUsers = [];
    },
    handlePresenter(user) {
      let presenter = {
        class: '',
        title: ''
      };

      switch (user?.changeStatus) {
        case 'accepted':
          presenter.class =
            'border-green-200 bg-green-50 hover:bg-green-100 text-green-600';
          presenter.title = 'Aprovado';

          break;

        case 'rejected':
          presenter.class = this.selectedUsers.includes(user.id)
            ? 'border-red-400 bg-red-100 text-red-600'
            : 'border-red-200 bg-red-50 hover:bg-red-100';
          presenter.title = 'Recusada';
          break;

        case 'pending':
          if (this.selectedUsers.includes(user.id)) {
            presenter.class = 'border-red-400 bg-red-100 text-red-600';
            presenter.title = 'Aguardando Usuário';
          } else {
            if (
              this.change?.scheduleChange?.status &&
              this.change?.scheduleChange?.status === 'pending_admin'
            ) {
              presenter.class = 'border-red-400 bg-red-100 text-red-600';
              presenter.title = 'Aguardando Aprovação';
            } else {
              presenter.class = 'border-red-400 bg-red-100';
              presenter.title = 'Aguardando Usuário';
            }
          }

          break;

        default:
          presenter.class = this.selectedUsers.includes(user.id)
            ? 'border-gray-400 bg-gray-100'
            : 'border-gray-200 bg-gray-50 hover:bg-gray-100';
          break;
      }

      return presenter;
    },
    async usersForChange() {
      try {
        await this.axios
          .get(
            `schedule_items/${this.drawerStore.drawer?.changeScheduleRequest?.reference}/change_requests`
          )
          .then(response => {
            this.change = response;
          });
      } catch (error) {
        console.log(error);
      }
    },
    async approve() {
      try {
        await this.axios
          .put(`schedule_changes/${this.change.scheduleChangesId}/approve`)
          .then(() => {
            this.$emit('save', this.tabStore.getTab.hour);
            this.drawerStore.close();
          });
      } catch (error) {
        console.log(error);
      }
    },
    async reject() {
      try {
        await this.axios
          .put(`schedule_changes/${this.change.scheduleChangesId}/reject`)
          .then(() => {
            this.$emit('save', this.tabStore.getTab.hour);
            this.drawerStore.close();
          });
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>
