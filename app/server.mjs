import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

// A teaching application, not a production service. Each instance owns its state.
export function createApp() {
  const product = { sku: 'QA-NOTEBOOK', name: 'QA notebook', unitPriceCents: 1299, stock: 10 };
  const orders = new Map();
  const users = new Map([['demo-alice-token', 'alice'], ['demo-bob-token', 'bob']]);

  return http.createServer(async (req, res) => {
    const send = (status, body, headers = {}) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
      res.end(JSON.stringify(body));
    };
    const error = (status, code) => send(status, { error: { code } });
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/health') return send(200, { status: 'ready' });
    const owner = users.get(req.headers.authorization?.match(/^Bearer (.+)$/)?.[1]);
    if (!owner) return error(401, 'UNAUTHENTICATED');

    if (req.method === 'GET' && url.pathname === '/products/QA-NOTEBOOK') return send(200, product);
    if (req.method === 'GET' && url.pathname === '/orders') {
      return send(200, { orders: [...orders.values()].filter(order => order.owner === owner) });
    }
    if (req.method === 'GET' && /^\/orders\/[^/]+$/.test(url.pathname)) {
      const order = orders.get(url.pathname.split('/')[2]);
      if (!order) return error(404, 'ORDER_NOT_FOUND');
      if (order.owner !== owner) return error(403, 'FORBIDDEN');
      return send(200, order);
    }
    if (req.method === 'POST' && url.pathname === '/orders') {
      if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
        return error(415, 'UNSUPPORTED_MEDIA_TYPE');
      }
      let body;
      try {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 16384) return error(413, 'PAYLOAD_TOO_LARGE');
          chunks.push(chunk);
        }
        body = JSON.parse(Buffer.concat(chunks).toString());
      } catch {
        return error(400, 'INVALID_JSON');
      }
      if (!body || Array.isArray(body) || body.sku !== product.sku) return error(400, 'INVALID_PRODUCT');
      if (!Number.isSafeInteger(body.quantity) || body.quantity < 1) return error(400, 'INVALID_QUANTITY');
      if (body.quantity > product.stock) return error(409, 'INSUFFICIENT_STOCK');
      // No await between checking and mutating state: one synchronous operation in this fixture.
      const order = {
        id: randomUUID(), owner, status: 'confirmed',
        items: [{ sku: product.sku, quantity: body.quantity, unitPriceCents: product.unitPriceCents }],
        totalCents: body.quantity * product.unitPriceCents,
      };
      product.stock -= body.quantity;
      orders.set(order.id, order);
      return send(201, order, { Location: `/orders/${order.id}` });
    }
    return error(404, 'ROUTE_NOT_FOUND');
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const app = createApp();
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, '127.0.0.1', () => {
    console.log(`Teaching API: http://127.0.0.1:${app.address().port}`);
    console.log('Fresh state: 10 notebooks, zero orders. Restart to reset.');
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => app.close());
}
