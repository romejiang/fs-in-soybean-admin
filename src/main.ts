import { setupVueRootValidator } from 'vite-plugin-vue-transition-root-validator/client';
import { createApp } from 'vue';
import {
  setupAppVersionNotification,
  setupDayjs,
  setupFastCrud,
  setupIconifyOffline,
  setupLoading,
  setupNProgress
} from './plugins';
import './plugins/assets';
import { getLocale, i18n, setupI18n } from './locales';
import { setupStore } from './store';
import { setupRouter } from './router';
import App from './App.vue';

async function setupApp() {
  setupLoading();

  setupNProgress();

  setupIconifyOffline();

  setupDayjs();

  const app = createApp(App);

  setupStore(app);

  await setupRouter(app);

  setupI18n(app);

  setupFastCrud(app, { i18n });

  setupAppVersionNotification();

  setupVueRootValidator(app, {
    lang: getLocale() === 'zh-CN' ? 'zh' : 'en'
  });

  app.mount('#app');
}

setupApp();
