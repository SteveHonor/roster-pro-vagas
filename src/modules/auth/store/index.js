import { defineStore } from 'pinia';
import { resetAllStores } from '@/store';
import posthog from 'posthog-js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // sessão
    isLogged: false,
    loginMethod: null, // 'password' | 'magic_link' | 'google' | null

    // usuário
    user: {},
    companies: [],
    provider: {},

    // tenant / bloqueio
    blocked: false,
    subdomain: null,
    branding: { logoUrl: null, primaryColor: null },

    // fluxo de UI
    stepLogin: 1,
    stepRegister: 1,
    firstAccess: false,

    // operator scope
    managedTeamIds: [],

    // whatsapp
    whatsappOptedIn: false,
    phonePresent: false,

    // device trust (PIN auth)
    deviceToken: null,

    // register
    register: {},

    // produto ativo no fluxo de signup/login
    activeProduct: null,  // 'vagas' | 'escalas' | null
    activeModules: []     // módulos que o usuário tem ativos ex: ['vagas', 'escalas']
  }),

  getters: {
    // sessão
    isSignedIn: state => state.isLogged,

    // usuário
    me: state => state.user,

    isAdminPrivilege: state => state.user?.profile === 'admin',
    isOwner: state => state.user?.owner === true,

    isOperatorPrivilege: state =>
      ['admin', 'operator'].includes(state.user?.profile),

    isUserPrivilege: state =>
      ['admin', 'operator', 'user'].includes(state.user?.profile),

    getManagedTeamIds: state => state.managedTeamIds ?? [],

    // OAuth
    isOauth: state => state.provider && Object.keys(state.provider).length > 0,

    // bloqueio
    isBlocked: state => state.blocked,

    // fluxo
    currentStepLogin: state => state.stepLogin,
    currentStepRegister: state => state.stepRegister
  },

  actions: {
    login(payload) {
      this.isLogged = true;
      this.user = payload.user;
      this.companies = payload.companies;
      this.blocked = payload.blocked;
      this.subdomain = payload.tenant?.subdomain ?? payload.tenant;
      this.branding  = {
        logoUrl:      payload.tenant?.logoUrl      ?? null,
        primaryColor: payload.tenant?.primaryColor ?? null
      };
      this.managedTeamIds  = payload.user?.managedTeamIds ?? [];
      this.whatsappOptedIn = payload.user?.whatsappOptedIn ?? false;
      this.phonePresent    = payload.user?.phone ?? false;
      this.stepLogin = 1;

      if (payload.activeModules) {
        this.activeModules = Array.isArray(payload.activeModules) ? payload.activeModules : [];
      }

      if (posthog.__loaded && payload.user?.id) {
        posthog.identify(String(payload.user.id), {
          email: payload.user.email,
          name: payload.user.name,
          profile: payload.user.profile,
          tenant: this.subdomain,
        });
      }
    },

    logout() {
      const savedDeviceToken = this.deviceToken;
      if (posthog.__loaded) posthog.reset();
      resetAllStores();
      this.$reset();
      // device token identifica o dispositivo, não a sessão — persiste entre logouts
      if (savedDeviceToken) this.deviceToken = savedDeviceToken;
    },

    // fluxo UI
    setStepLogin(step) {
      this.stepLogin = step;
    },

    setStepRegister(step) {
      this.stepRegister = step;
    },

    setLoginMethod(method) {
      this.loginMethod = method;
    },

    // OAuth
    setProvider(provider) {
      this.provider = provider;
    },

    setManagedTeamIds(ids) {
      this.managedTeamIds = ids ?? [];
    },

    // Limpa dados de sessão sem apagar provider/register (usado no início do signup)
    clearSession() {
      this.isLogged = false;
      this.user = {};
      this.companies = [];
      this.blocked = false;
      this.subdomain = null;
      this.branding = { logoUrl: null, primaryColor: null };
      this.managedTeamIds = [];
      this.stepLogin = 1;
    },

    setBlocked(status) {
      this.blocked = status;
    },

    setWhatsappOptedIn(status) {
      this.whatsappOptedIn = status;
    },

    setPhonePresent(status) {
      this.phonePresent = status;
    },

    setDeviceToken(token) {
      this.deviceToken = token;
    },

    setActiveProduct(product) {
      this.activeProduct = product;
    },

    setActiveModules(modules) {
      this.activeModules = Array.isArray(modules) ? modules : [];
    },

    hasModule(module) {
      return this.activeModules.includes(module);
    }
  },

  persist: true
});
