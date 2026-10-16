import type { App } from 'vue';
import axios from 'axios';
import type { CrudOptions, FsSetupOptions } from '@fast-crud/fast-crud';
// eslint-disable-next-line import/order
import { FastCrud } from '@fast-crud/fast-crud';
import {
  FsExtendsCopyable,
  FsExtendsEditor,
  FsExtendsJson,
  FsExtendsTime,
  FsExtendsUploader
} from '@fast-crud/fast-extends';
import type { FsUploaderOptions } from '@fast-crud/fast-extends';
import UiNaive from '@fast-crud/ui-naive';
import '@fast-crud/fast-crud/dist/style.css';
import '@fast-crud/fast-extends/dist/style.css';
import { mockRequest, request } from '@/service/request';
import './common.css';
import { setupNaive } from './naive';

/**
 * fast-crud 的安装选项
 *
 * 注意：在 App.vue 中，需要用 fs-ui-context 组件包裹 RouterView，让 fs-crud 拥有
 * message、notification、dialog 的能力。
 */
export type FsSetupOpts = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  i18n?: any;
};

/** Resolve a dict url which fast-crud may provide as a string or a getter function. */
function resolveDictUrl(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'function') {
    return (value as () => string)();
  }

  return undefined;
}

function install(app: App, options: FsSetupOpts = {}) {
  // 安装 naive ui 常用组件
  setupNaive(app);

  // 先安装 ui 适配包，再安装 fast-crud
  app.use(UiNaive);

  const fsOptions: FsSetupOptions = {
    i18n: options.i18n,
    logger: {
      off: {
        // `table.columns` 已由 array 改为 map，本项目未使用旧用法，关闭该内部告警
        tableColumns: false
      }
    },
    async dictRequest(context) {
      const url = resolveDictUrl(context.url) ?? resolveDictUrl(context.dict?.url);

      if (!url) {
        return [];
      }

      // `/mock` 开头的字典请求走本地 mock，其余走后端服务
      if (url.startsWith('/mock')) {
        const res = await mockRequest<App.Service.Response<any>>({ url: url.replace('/mock', '') });

        return res?.data || [];
      }

      const data = await request<any>({ url });

      return data || [];
    },
    /** useCrud 时会被执行 */
    commonOptions() {
      const commonCrudOptions: CrudOptions = {
        table: {
          size: 'small',
          pagination: false
        },
        search: {
          options: {
            size: 'medium'
          }
        },
        rowHandle: {
          buttons: {
            view: { text: null, icon: 'EyeOutlined', size: 'small' },
            edit: { text: null, icon: 'EditOutlined', size: 'small' },
            remove: { type: 'error', text: null, icon: 'DeleteOutlined', size: 'small' }
          },
          dropdown: {
            more: { size: 'small' }
          }
        },
        request: {
          // 查询参数转换
          transformQuery(query) {
            const { page, form, sort } = query;
            const limit = page?.pageSize ?? 20;
            const currentPage = page?.currentPage ?? 1;
            const offset = limit * (currentPage - 1);

            return {
              page: {
                limit,
                offset
              },
              query: form,
              sort: sort || {}
            };
          },
          // page 请求结果转换
          transformRes(originPageRes) {
            const { res } = originPageRes;
            const pageSize = res.limit ?? 20;
            let currentPage = res.offset / pageSize;

            if (res.offset % pageSize === 0) {
              currentPage += 1;
            }

            return { currentPage, pageSize, total: res.total, records: res.records, ...res };
          }
        },
        form: {
          display: 'flex', // 表单布局
          labelWidth: '120px' // 表单 label 宽度
        }
      };

      return commonCrudOptions;
    }
  };

  app.use(FastCrud, fsOptions);

  // 安装 json 展示
  app.use(FsExtendsJson);

  // 安装 copyable
  app.use(FsExtendsCopyable);

  // 安装时间扩展
  app.use(FsExtendsTime);

  // 安装 editor
  app.use(FsExtendsEditor, {
    // 编辑器的公共配置
    wangEditor: {}
  });

  // 安装 uploader 公共参数
  const uploaderOptions: FsUploaderOptions = {
    defaultType: 'form',
    form: {
      action: 'http://www.docmirror.cn:7070/api/upload/form/upload',
      name: 'file',
      withCredentials: false,
      uploadRequest: async props => {
        const { action, file, onProgress } = props;
        const data = new FormData();
        data.append('file', file);
        const res = await axios.post(action, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000,
          onUploadProgress(progress) {
            onProgress({ percent: Math.round((progress.loaded / progress.total!) * 100) });
          }
        });
        // 上传完成后的结果，一般返回个 url 或者 key，具体看后台返回啥
        return res.data.data;
      },
      async successHandle(ret: string) {
        // 上传完成后的结果处理，此处应转换为 { url, key }
        return {
          url: `http://www.docmirror.cn:7070${ret}`,
          key: ret.replace('/api/upload/form/download?key=', '')
        };
      }
    }
  };

  app.use(FsExtendsUploader, uploaderOptions);
}

export default {
  install
};

/** Setup the fast-crud plugin */
export function setupFastCrud(app: App<Element>, options: FsSetupOpts = {}) {
  install(app, options);
}
