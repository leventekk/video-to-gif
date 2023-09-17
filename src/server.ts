import 'dotenv/config';
import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

fastify.get('/healthcheck', async function handler() {
  return 'ok';
});

(async () => {
  try {
    await fastify.listen({ port: Number(process.env.PORT) });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
