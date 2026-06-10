import axios from 'axios';
import router from '@/router';

import { resetAllStores } from '@/store';
import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '@/modules/users/store/company';
import { useLoadingStore } from '@/components/loading/store';

import { syncUser, syncResources } from '@/services';

axios.interceptors.request.use(
  config => {
    const subdomain = getSubdomain();

    config.baseURL = `https://${subdomain}.${import.meta.env.VITE_API_URL}`;
    config.withCredentials = true;

    const loading = useLoadingStore();
    if (config.method !== 'get') loading.show();

    const companyStore = useCompanyStore();
    const isFormData = config.data instanceof FormData;

    if (config.data && !isFormData) {
      config.data = toSnakeCase(config.data);
    }

    const companyId = companyStore.chosenCompany?.id;
    if (companyId) {
      config.headers['X-Company-id'] = companyId;
    }

    const authStore = useAuthStore();
    if (authStore.deviceToken) {
      config.headers['X-Device-Token'] = authStore.deviceToken;
    }

    config.headers['X-Module'] = 'vagas';

    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
      config.headers['Accept'] = 'application/json';
    }

    return config;
  },
  error => {
    useLoadingStore().hide();
    return Promise.reject(error);
  }
);

// Adiciona um interceptor para as respostas
axios.interceptors.response.use(
  async response => {
    const loading = useLoadingStore();
    const method = response.config.method;
    const url = response.config.url;

    setTimeout(() => {
      loading.hide();
    }, 500);

    if (syncResources(method, url)) {
      await syncUser.sync(axios);
    }

    if (response.data) {
      response.data = toCamelCase(response.data);
      return response.data; // Retorna a resposta normalmente
    }
  },
  error => {
    const loading = useLoadingStore();

    setTimeout(() => {
      loading.hide();
    }, 500);

    const status = error.response?.status;

    if (status === 401 || error.code === 'ERR_NETWORK') {
      const authStore = useAuthStore();
      authStore.setStepLogin(1);
      authStore.logout();
      resetAllStores();

      const publicRoutes = ['/signin', '/signup', '/recuperar-senha', '/nova-senha', '/trocar-senha', '/magic-link'];
      const onPublicRoute = publicRoutes.some(r => router.currentRoute.value.path.startsWith(r));
      if (!onPublicRoute) {
        router.replace('/signin');
      }
    }

    return Promise.reject(error);
  }
);

// Função para converter camelCase -> snake_case
const toSnakeCase = obj => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && obj?.constructor === Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase(),
        toSnakeCase(value)
      ])
    );
  }
  return obj;
};

// Função para converter snake_case -> camelCase
const toCamelCase = obj => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && obj.constructor === Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        toCamelCase(value)
      ])
    );
  }
  return obj;
};

const getSubdomain = () => {
  const authStore = useAuthStore();

  return authStore?.subdomain || 'public';
};

export default axios;
