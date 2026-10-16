import type { DefineComponent } from 'vue';

declare module 'vue' {
  export interface GlobalComponents {
    /** fast-crud 表格组件，由 `app.use(FastCrud)` 全局注册 */
    FsCrud: DefineComponent;
    /** fast-crud 的 naive-ui 上下文组件，由 `app.use(UiNaive)` 全局注册 */
    FsUiContext: DefineComponent;
  }
}
