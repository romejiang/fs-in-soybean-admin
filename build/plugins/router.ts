import type { RouteMeta } from 'vue-router';
import type { RouteKey } from '@elegant-router/types';
import ElegantVueRouter from '@elegant-router/vue/vite';

export function setupElegantRouter() {
  return ElegantVueRouter({
    layouts: {
      base: 'src/layouts/base-layout/index.vue',
      blank: 'src/layouts/blank-layout/index.vue'
    },
    routePathTransformer(routeName, routePath) {
      const key = routeName as RouteKey;

      if (key === 'login') {
        const modules: UnionKey.LoginModule[] = ['pwd-login', 'code-login', 'register', 'reset-pwd', 'bind-wechat'];

        const moduleReg = modules.join('|');

        return `/login/:module(${moduleReg})?`;
      }

      return routePath;
    },
    onRouteMetaGen(routeName) {
      const key = routeName as RouteKey;

      const constantRoutes: RouteKey[] = ['login', '403', '404', '500'];

      const extraMeta: Record<string, Partial<RouteMeta>> = {
        crud: { icon: 'mdi:table-large', order: 2 },
        crud_demo: { icon: 'mdi:table' },
        'crud_header-group': { icon: 'mdi:table-multiple' },
        crud_doc: { icon: 'logos:vue' },
        crud_source: { icon: 'mdi:github' }
      };

      const meta: Partial<RouteMeta> = {
        title: key,
        i18nKey: `route.${key}` as App.I18n.I18nKey,
        ...extraMeta[key]
      };

      if (constantRoutes.includes(key)) {
        meta.constant = true;
      }

      return meta;
    }
  });
}
