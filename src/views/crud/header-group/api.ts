import type { UserPageQuery } from '@fast-crud/fast-crud';
import { mockRequest } from '@/service/request';

const apiPrefix = '/crud/header-group';

export type HeaderGroupRecord = {
  id: number;
  [key: string]: any;
};

function resHandle(res: App.Service.Response<any> | undefined) {
  return res?.data;
}

export async function GetList(query: UserPageQuery) {
  const res = await mockRequest<App.Service.Response<any>>({ url: `${apiPrefix}/page`, method: 'post', data: query });

  return resHandle(res);
}

export async function AddObj(obj: HeaderGroupRecord) {
  const res = await mockRequest<App.Service.Response<any>>({ url: `${apiPrefix}/add`, method: 'post', data: obj });

  return resHandle(res);
}

export async function UpdateObj(obj: HeaderGroupRecord) {
  const res = await mockRequest<App.Service.Response<any>>({ url: `${apiPrefix}/update`, method: 'post', data: obj });

  return resHandle(res);
}

export async function DelObj(id: number) {
  const res = await mockRequest<App.Service.Response<any>>({
    url: `${apiPrefix}/delete`,
    method: 'post',
    data: { id }
  });

  return resHandle(res);
}

export async function GetObj(id: number) {
  const res = await mockRequest<App.Service.Response<any>>({ url: `${apiPrefix}/get`, params: { id } });

  return resHandle(res);
}

export async function BatchDelete(ids: number[]) {
  const res = await mockRequest<App.Service.Response<any>>({
    url: `${apiPrefix}/batchDelete`,
    method: 'post',
    data: { ids }
  });

  return resHandle(res);
}
