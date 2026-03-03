// plugins/auth-refresh.client.ts

import { watch } from 'vue';

export default defineNuxtPlugin(() => {
  const { signOut, data } = useAuth();
  console.log('Auth refresh plugin loaded');
  watch(
    () => data.value?.error,
    (error) => {
      if (error === 'RefreshAccessTokenError') {
        signOut({
          callbackUrl: '/',
        });
      }
    },
    { immediate: true }
  );
});
