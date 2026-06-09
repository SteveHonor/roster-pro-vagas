import posthog from 'posthog-js';
import * as Sentry from '@sentry/vue';

const CONSENT_KEY = 'cookie_consent';
let _initialized = false;

export function hasAnalyticsConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    return JSON.parse(raw).accepted === true;
  } catch {
    return false;
  }
}

export function saveConsent(accepted) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({
    accepted,
    version: new Date().toISOString().slice(0, 10),
    at: new Date().toISOString()
  }));
}

// Funil de conversão — eventos-chave para medir ativação e retenção
export const EVENTS = {
  USER_INVITED:    'user_invited',
  TEAM_CREATED:    'team_created',
  EVENT_CREATED:   'event_created',
  PLAN_UPGRADED:   'plan_upgraded',
  PLAN_DOWNGRADED: 'plan_downgraded',
  API_KEY_CREATED: 'api_key_created',
};

export function track(event, properties = {}) {
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
}

export function initAnalytics(app, router) {
  if (_initialized) return;
  if (import.meta.env.VITE_ENV !== 'production') return;

  _initialized = true;

  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: true,
    });
    posthog.register({ source: 'rosterpro-app' });

    if (router) {
      router.afterEach(to => {
        posthog.capture('$pageview', { $current_url: window.location.href, path: to.fullPath });
      });
    }
  }

  if (import.meta.env.VITE_SENTRY_DSN && app) {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_ENV || 'development',
      enabled: true,
      tracesSampleRate: 0.1,
      tracePropagationTargets: [import.meta.env.VITE_API_URL],
      beforeSend(event) {
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
        }
        return event;
      }
    });
  }
}
