import { usePlanStore } from '@/components/plan/store';
import { useAuthStore } from '@/modules/auth/store';
import { useOnboardingStore } from '@/components/onboarding/store';

let syncing = false;

export default {
  async sync(axios) {
    const authStore = useAuthStore();
    if (!authStore.isSignedIn) return;
    if (syncing) return;
    syncing = true;

    try {
      await axios.get('/users/context').then(data => {
        const planStore = usePlanStore();
        const authStore = useAuthStore();

        if (data?.plan) {
          planStore.setPlan(data.plan);
        }

        if (data?.blocked === true) {
          authStore.setBlocked(data.blocked);
        }

        if (data?.user) {
          authStore.setWhatsappOptedIn(data.user.whatsappOptedIn ?? false);
          if (data.user.hasPhone !== undefined) {
            authStore.setPhonePresent(data.user.hasPhone);
          }
        }

        const onboardingStore = useOnboardingStore();
        if (data?.onboarding) {
          if (data.onboarding.teamCreated)     onboardingStore.setTeamCreated();
          if (data.onboarding.memberInvited)   onboardingStore.setMemberInvited();
          if (data.onboarding.scheduleCreated) onboardingStore.setScheduleCreated();
        }
        onboardingStore.setReady();
      });
    } catch (error) {
      console.error('[ContextSync] failed', error);
    } finally {
      syncing = false;
    }
  }
};
