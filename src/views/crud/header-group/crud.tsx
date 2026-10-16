import type { CreateCrudOptionsRet, UserPageQuery, UserPageRes } from '@fast-crud/fast-crud';
import * as api from './api';
import type { HeaderGroupRecord } from './api';

export default function createCrudOptions(): CreateCrudOptionsRet {
  const pageRequest = async (query: UserPageQuery): Promise<UserPageRes> => {
    return api.GetList(query);
  };

  const editRequest = async (ctx: { form: HeaderGroupRecord; row: HeaderGroupRecord }) => {
    const { form, row } = ctx;
    form.id = row.id;

    return api.UpdateObj(form);
  };

  const delRequest = async (ctx: { row: HeaderGroupRecord }) => {
    const { row } = ctx;

    return api.DelObj(row.id);
  };

  const addRequest = async (ctx: { form: HeaderGroupRecord }) => {
    const { form } = ctx;

    return api.AddObj(form);
  };

  return {
    crudOptions: {
      container: {
        // is: 'fs-layout-card'
      },
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest
      },
      form: {
        layout: 'flex',
        labelWidth: '100px' // 表单 label 宽度
      },
      table: { size: 'small' },
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
        user: {
          title: 'user',
          children: {
            name: {
              title: 'name',
              type: 'text'
            },
            age: {
              title: 'age',
              type: 'number'
            }
          }
        },
        address: {
          title: 'address',
          children: {
            area: {
              title: 'area',
              children: {
                province: {
                  title: 'province',
                  type: 'text',
                  search: { show: true }
                },
                city: {
                  title: 'city',
                  search: { show: true },
                  type: 'text'
                },
                county: {
                  title: 'county',
                  search: { show: true },
                  type: 'text'
                }
              }
            },
            street: {
              title: 'street',
              type: 'text'
            }
          }
        }
      }
    }
  };
}
