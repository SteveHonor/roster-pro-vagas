<template>
  <section>
    <div class="mb-6 flex gap-2 border-b border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-150"
        :class="
          activeTab === tab.key
            ? 'border-gray-700 text-gray-900'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        "
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'alerts'">
      <div
        v-if="notificationStore.notifications.length"
        class="flex flex-wrap gap-3"
      >
        <div
          v-for="(notification, index) in notificationStore.notifications"
          :key="index"
          class="flex w-full items-center justify-between rounded border bg-gray-100 p-3"
        >
          <div>
            <div class="flex items-center gap-2 text-sm">
              <span
                class="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                :class="notification.kind === 'broadcast' ? 'bg-blue-400' : 'bg-gray-400'"
              />
              {{ notification.message }}
              <BaseIcon
                v-if="notification.status === 'read'"
                name="check"
                class="h-4 w-4 text-green-500"
              />
            </div>
            <div class="mt-1 pl-4 text-xs font-light text-gray-500">
              {{ notification.kind === 'broadcast' ? 'Comunicado' : 'Alerta' }} ·
              {{ moment(notification.notifiedAt || notification.created_at).format('DD/MM/YY HH:mm') }}
            </div>
          </div>

          <button
            class="ml-3 flex flex-shrink-0 items-center gap-2 rounded border bg-white px-3 py-1.5 text-xs hover:bg-gray-700 hover:text-white"
            @click="$router.replace(notification.path)"
          >
            {{ notification.action }}
          </button>
        </div>
      </div>

      <div v-else>
        <Empty
          title="Tudo certo por aqui!"
          class="-mt-12"
          description="Assim que pintar algum alerta, ele vai aparecer aqui para você."
        />
      </div>
    </div>

    <div v-if="activeTab === 'preferences'">
      <NotificationPreferences />
    </div>
  </section>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import Empty from '@/components/empty/Empty';
import NotificationPreferences from '@/modules/settings/components/NotificationPreferences';

import { useNotificationStore } from '@/components/notification/store';

export default {
  components: {
    BaseIcon,
    Empty,
    NotificationPreferences
  },
  data: () => ({
    activeTab: 'alerts',
    tabs: [
      { key: 'alerts', label: 'Alertas' },
      { key: 'preferences', label: 'Preferências' }
    ]
  }),
  computed: {
    notificationStore: () => useNotificationStore()
  },
  mounted() {
    if (this.$route?.query?.wa === '1') {
      this.activeTab = 'preferences';
    }
  },
  unmounted() {
    this.readNotifications();
  },
  methods: {
    async readNotifications() {
      await this.axios.patch('/notifications/read').then(() => {
        this.notificationStore.clearNotification();
        this.getNotifications();
      });
    },
    async getNotifications() {
      await this.axios.get('/notifications').then(response => {
        this.notificationStore.setNotifications(response);
      });
    }
  }
};
</script>
