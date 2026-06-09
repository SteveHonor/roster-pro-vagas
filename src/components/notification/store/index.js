import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notification: {},
    notifications: []
  }),

  actions: {
    setNotification(notification) {
      this.notification = notification;
    },
    setNotifications(notifications) {
      this.notifications = notifications;
    },
    addNotification(notification) {
      this.notifications.push(notification);
    },
    clearNotification() {
      this.notifications = [];
    }
  },

  persist: true
});
