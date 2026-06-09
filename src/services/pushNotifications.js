const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const PUSH_STATE_KEY   = 'push_notification_state'; // 'granted' | 'denied' | null

function urlBase64ToUint8Array(base64) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function isPushGranted() {
  return Notification.permission === 'granted';
}

export function isPushDenied() {
  return Notification.permission === 'denied';
}

export async function getCurrentSubscription() {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function subscribe(axios) {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly:      true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  const json = sub.toJSON();
  await axios.post('/push_subscription', {
    endpoint: json.endpoint,
    keys:     json.keys
  });

  localStorage.setItem(PUSH_STATE_KEY, 'granted');
  return sub;
}

export async function unsubscribe(axios) {
  const sub = await getCurrentSubscription();
  if (!sub) return;

  await axios.delete('/push_subscription', { data: { endpoint: sub.endpoint } }).catch(() => {});
  await sub.unsubscribe();
  localStorage.removeItem(PUSH_STATE_KEY);
}
