import dayjs from 'dayjs';
import { dict } from '@fast-crud/fast-crud';
import type { CreateCrudOptionsRet, UserPageQuery, UserPageRes } from '@fast-crud/fast-crud';
import * as api from './api';
import type { DemoRecord } from './api';

export default function createCrudOptions(): CreateCrudOptionsRet {
  const pageRequest = async (query: UserPageQuery): Promise<UserPageRes> => {
    return api.GetList(query);
  };

  const editRequest = async (ctx: { form: DemoRecord; row: DemoRecord }) => {
    const { form, row } = ctx;
    form.id = row.id;

    return api.UpdateObj(form);
  };

  const delRequest = async (ctx: { row: DemoRecord }) => {
    const { row } = ctx;

    return api.DelObj(row.id);
  };

  const addRequest = async (ctx: { form: DemoRecord }) => {
    const { form } = ctx;

    return api.AddObj(form);
  };

  return {
    crudOptions: {
      container: {
        is: 'fs-layout-card'
      },
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest
      },
      columns: {
        id: {
          title: 'ID',
          key: 'id',
          type: 'number',
          column: {
            width: 50
          },
          form: {
            show: false
          }
        },
        datetime: {
          title: 'datetime',
          type: 'datetime',
          // naive 默认仅支持数字类型时间戳作为日期输入与输出
          // 字符串类型的时间需要转换格式
          valueBuilder(context) {
            const { value, row, key } = context;

            if (value) {
              row[key] = dayjs(value).valueOf();
            }
          },
          valueResolve(context) {
            const { value, form, key } = context;

            if (value) {
              form[key] = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
            }
          }
        },
        select: {
          title: 'status',
          search: { show: true },
          type: 'dict-select',
          dict: dict({
            url: '/mock/crud/demo/dict'
          })
        },
        text: {
          title: 'text',
          type: 'text',
          search: { show: true }
        },
        copyable: {
          title: 'copyable',
          type: ['text', 'copyable'],
          search: { show: true }
        },
        avatar: {
          title: 'avatar',
          type: 'cropper-uploader'
        },
        upload: {
          title: 'upload',
          type: 'file-uploader'
        },
        richtext: {
          title: 'rich text',
          type: 'editor-wang5',
          column: {
            // cell 中不显示
            show: false
          },
          form: {
            col: {
              // 横跨两列
              span: 24
            },
            component: {
              style: {
                height: '300px'
              }
            }
          }
        }
      }
    }
  };
}
