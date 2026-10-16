import enFsLocale from '@fast-crud/fast-crud/dist/locale/lang/en';
import zhCnFsLocale from '@fast-crud/fast-crud/dist/locale/lang/zh-cn';
import enUS from './langs/en-us';
import zhCN from './langs/zh-cn';

/**
 * Locale messages consumed by vue-i18n.
 *
 * It extends the app schema with the `fs` namespace required by fast-crud.
 */
export type LocaleMessages = App.I18n.Schema & {
  /** fast-crud 语言包 */
  fs: Record<string, any>;
};

const locales: Record<App.I18n.LangType, LocaleMessages> = {
  'zh-CN': {
    ...zhCN,
    fs: zhCnFsLocale.fs
  },
  'en-US': {
    ...enUS,
    fs: enFsLocale.fs
  }
};

export default locales;
