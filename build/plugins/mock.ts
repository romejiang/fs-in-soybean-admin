import type { Connect, Plugin } from 'vite';
import { mockApis } from '../mock';

/** Parse the query string of a request url into a plain object. */
function parseQuery(url: string) {
  const search = url.split('?')[1] ?? '';
  const query: Record<string, string> = {};

  if (!search) {
    return query;
  }

  for (const pair of search.split('&')) {
    const [key, value = ''] = pair.split('=');

    if (key) {
      query[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }

  return query;
}

/** Read and JSON.parse the request body, resolving to `undefined` for empty bodies. */
function readBody(req: Connect.IncomingMessage): Promise<any> {
  return new Promise(resolve => {
    let raw = '';

    req.on('data', chunk => {
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(undefined);
      }
    });
  });
}

function sendJson(res: any, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

/** Connect middleware that serves the in-memory CRUD mock under `/mock/**`. */
function createMockMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url ?? '';

    if (!url.startsWith('/mock/')) {
      next();
      return;
    }

    const [pathname] = url.split('?');
    const method = (req.method ?? 'get').toLowerCase();

    const api = mockApis.find(item => item.path === pathname && item.method === method);

    if (!api) {
      sendJson(res, 404, { code: 404, message: `mock api not found: ${method.toUpperCase()} ${pathname}`, data: null });
      return;
    }

    if (method === 'get') {
      sendJson(res, 200, api.handle({ method, path: pathname, query: parseQuery(url), body: undefined }));
      return;
    }

    readBody(req).then(body => {
      sendJson(res, 200, api.handle({ method, path: pathname, query: parseQuery(url), body }));
    });
  };
}

/** Vite plugin that registers the local CRUD mock for both dev and preview servers. */
export function setupMockPlugin(): Plugin {
  const middleware = createMockMiddleware();

  return {
    name: 'soybean:mock',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    }
  };
}
