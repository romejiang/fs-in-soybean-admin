/**
 * Local CRUD mock data source.
 *
 * The upstream soybean-admin v2 removed `vite-plugin-mock`, so the fast-crud demo pages keep
 * working through a tiny in-memory mock served by a Vite middleware (see `build/plugins/mock.ts`).
 */
export interface MockListItem {
  id?: number;
  children?: MockListItem[];
  hasChildren?: boolean;
  lazy?: boolean;
  [key: string]: any;
}

export interface MockRequest {
  method: string;
  path: string;
  query: Record<string, any>;
  body: any;
}

export interface MockApi {
  path: string;
  method: 'get' | 'post';
  handle: (req: MockRequest) => any;
}

interface MockResponse {
  code: number;
  message: string;
  data: any;
}

interface CrudMockOptions {
  name: string;
  list: MockListItem[];
  idGenerator: number;
  copyTimes?: number;
}

type CopyListParams = {
  originList: MockListItem[];
  newList: MockListItem[];
  options: CrudMockOptions;
  parentId?: number;
};

function copyList(props: CopyListParams) {
  const { originList, newList, options, parentId } = props;

  for (const item of originList) {
    const newItem: MockListItem = { ...item, parentId };
    newItem.id = options.idGenerator;
    options.idGenerator += 1;
    newList.push(newItem);

    if (item.children) {
      newItem.children = [];
      copyList({
        originList: item.children,
        newList: newItem.children,
        options,
        parentId: newItem.id
      });
    }
  }
}

function delById(id: number, list: MockListItem[]) {
  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];

    if (item.id === id) {
      list.splice(i, 1);
      break;
    }

    if (item.children && item.children.length > 0) {
      delById(id, item.children);
    }
  }
}

function findById(id: number, list: MockListItem[]): MockListItem | null {
  for (const item of list) {
    if (item.id === id) {
      return item;
    }

    if (item.children && item.children.length > 0) {
      const sub = findById(id, item.children);

      if (sub !== null && sub !== undefined) {
        return sub;
      }
    }
  }

  return null;
}

function matchWithArrayCondition(value: any[], item: MockListItem, key: string) {
  if (value.length === 0) {
    return true;
  }

  let matched = false;

  for (const i of value) {
    if (Array.isArray(item[key])) {
      for (const j of item[key]) {
        if (i === j) {
          matched = true;
          break;
        }
      }

      if (matched) {
        break;
      }
    } else if (item[key] === i || (typeof item[key] === 'string' && item[key].indexOf(`${i}`) >= 0)) {
      matched = true;
      break;
    }

    if (matched) {
      break;
    }
  }

  return matched;
}

function matchWithObjectCondition(value: any, item: MockListItem, key: string) {
  let matched = true;

  for (const key2 of Object.keys(value)) {
    const v = value[key2];

    if (v && item[key] && v !== item[key][key2]) {
      matched = false;
      break;
    }
  }

  return matched;
}

function searchFromList(list: MockListItem[], query: Record<string, any>) {
  const filter = (item: MockListItem) => {
    let allFound = true;

    for (const key of Object.keys(query)) {
      const value = query[key];

      if (value === undefined || value === null || value === '') {
        // do nothing
      } else if (Array.isArray(value)) {
        const matched = matchWithArrayCondition(value, item, key);

        if (!matched) {
          allFound = false;
        }
      } else if (value instanceof Object) {
        const matched = matchWithObjectCondition(value, item, key);

        if (!matched) {
          allFound = false;
        }
      } else if (item[key] !== value) {
        allFound = false;
      }
    }

    return allFound;
  };

  return list.filter(filter);
}

function success(data: any): MockResponse {
  return { code: 200, message: 'success', data };
}

/**
 * Build the standard set of CRUD mock apis for a list.
 *
 * The routes follow the offset/limit structure that the fast-crud demo pages expect:
 * `/mock/{name}/page`, `/mock/{name}/add`, `/mock/{name}/update`, `/mock/{name}/delete`,
 * `/mock/{name}/get`, `/mock/{name}/batchDelete` and `/mock/{name}/all`.
 */
export function createCrudMock(options: CrudMockOptions): MockApi[] {
  const { name } = options;
  const copyTimes = options.copyTimes ?? 29;

  const list: MockListItem[] = [];

  for (let i = 0; i < copyTimes; i += 1) {
    copyList({ originList: options.list, newList: list, options });
  }

  options.list = list;

  return [
    {
      path: `/mock/${name}/page`,
      method: 'post',
      handle(req) {
        let data = [...list];
        let limit = 20;
        let offset = 0;

        for (const item of list) {
          if (item.children && item.children.length === 0) {
            item.hasChildren = false;
            item.lazy = false;
          }
        }

        if (req.body) {
          const { page, query } = req.body;

          if (page?.limit) {
            limit = Number.parseInt(page.limit, 10);
          }

          if (page?.offset) {
            offset = Number.parseInt(page.offset, 10);
          }

          if (query && Object.keys(query).length > 0) {
            data = searchFromList(list, query);
          }
        }

        const start = offset;
        let end = offset + limit;

        if (data.length < end) {
          end = data.length;
        }

        const records = data.slice(start, end);
        const lastOffset = data.length - (data.length % limit);

        if (offset > lastOffset) {
          offset = lastOffset;
        }

        return success({ records, total: data.length, limit, offset });
      }
    },
    {
      path: `/mock/${name}/get`,
      method: 'get',
      handle(req) {
        const id = Number.parseInt(req.query.id, 10);

        return success(findById(id, list));
      }
    },
    {
      path: `/mock/${name}/add`,
      method: 'post',
      handle(req) {
        req.body.id = options.idGenerator;
        options.idGenerator += 1;
        list.unshift(req.body);

        return success(req.body.id);
      }
    },
    {
      path: `/mock/${name}/update`,
      method: 'post',
      handle(req) {
        const item = findById(req.body.id, list);

        if (item) {
          Object.assign(item, req.body);
        }

        return success(null);
      }
    },
    {
      path: `/mock/${name}/delete`,
      method: 'post',
      handle(req) {
        delById(Number.parseInt(req.body.id, 10), list);

        return success(null);
      }
    },
    {
      path: `/mock/${name}/batchDelete`,
      method: 'post',
      handle(req) {
        const ids: number[] = req.body.ids;

        for (let i = list.length - 1; i >= 0; i -= 1) {
          const item = list[i];

          if (ids.indexOf(item.id as number) >= 0) {
            list.splice(i, 1);
          }
        }

        return success(null);
      }
    },
    {
      path: `/mock/${name}/all`,
      method: 'post',
      handle() {
        return success(list);
      }
    }
  ];
}

const demoApis = createCrudMock({
  name: 'crud/demo',
  idGenerator: 0,
  list: [
    {
      select: '1',
      text: 'text test',
      copyable: 'copyable text',
      avatar: 'http://greper.handsfree.work/extends/avatar.jpg',
      richtext: 'rich text',
      datetime: '2023-01-30 11:11:11'
    },
    { select: '2' },
    { select: '0' }
  ]
});

const headerGroupApis = createCrudMock({
  name: 'crud/header-group',
  idGenerator: 0,
  list: [
    {
      user: { name: 'Bob', age: 18 },
      address: {
        area: { province: 'Guangdong', city: 'Shenzhen', county: 'Nanshan' },
        street: 'Keyuan road'
      }
    },
    {
      user: { name: 'Alice', age: 22 },
      address: {
        area: { province: 'Zhejiang', city: 'Hangzhou', county: 'Xihu' },
        street: 'Wenyi road'
      }
    }
  ]
});

export const mockApis: MockApi[] = [
  ...demoApis,
  ...headerGroupApis,
  {
    path: '/mock/crud/demo/dict',
    method: 'get',
    handle() {
      return success([
        { value: '0', label: 'off', color: 'warning' },
        { value: '1', label: 'on', color: 'success' },
        { value: '2', label: 'stop' }
      ]);
    }
  }
];
