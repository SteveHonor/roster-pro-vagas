import { defineStore } from 'pinia';
import axios from 'axios';

export const usePlanStore = defineStore('plan', {
  state: () => ({
    name: '',
    billingPeriod: '',
    subscription: {},
    limits: {},
    permissions: {},
    features: {},
    upgrade: {},
    plans: [],
    plansLoading: false
  }),

  getters: {
    hasFeature: state => feature => state.features?.[feature] === true,

    limitFor: state => resource => state.limits?.[resource] ?? null,

    isUpgradeOpen: state => type => state.upgrade?.[type]?.open === true,

    shouldShowBanner: state => {
      const name = (state.name || '').toLowerCase();
      return name.includes('free') || name.includes('pro');
    }
  },

  actions: {
    setOpen(type) {
      if (!type) return;

      if (!this.upgrade[type]) {
        this.upgrade[type] = { open: false };
      }

      this.upgrade[type].open = true;
      this.upgrade.type = type;

      if (type === 'upgrade') this.fetchPlans();
    },

    setClose(type) {
      if (!type || !this.upgrade[type]) return;

      this.upgrade[type].open = false;
    },

    setPlan(plan) {
      if (!plan?.name) return;
      this.name = plan.name;
      this.billingPeriod = plan.billingPeriod ?? null;
      this.subscription = plan.subscription ?? {};
      this.limits = plan.limits ?? {};
      this.permissions = plan.permissions ?? {};
      this.features = plan.features ?? {};
    },

    async fetchPlans() {
      if (this.plans.length) return;
      this.plansLoading = true;
      try {
        const data = await axios.get(`https://public.${import.meta.env.VITE_API_URL}/plans?module=vagas`);
        if (Array.isArray(data)) this.plans = data;
      } catch {
        // silent
      } finally {
        this.plansLoading = false;
      }
    },

    reset() {
      this.$reset();
    }
  },

  persist: {
    paths: ['name', 'billingPeriod', 'subscription', 'limits', 'permissions', 'features']
  }
});
