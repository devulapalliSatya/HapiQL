import http from 'node:http';
import { Readable } from 'node:stream';
import { createSchema, createYoga } from 'graphql-yoga';
import Hapi from '@hapi/hapi';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolver';

export async function init(port: number) {
  const yoga = createYoga<{ req: Hapi.Request; h: Hapi.ResponseToolkit }>({
    schema: createSchema({
      typeDefs,
      resolvers
    }),
  });

  const server = Hapi.server({ port });

  server.route({
    method: '*',
    path: '/graphql',
    options: {
      payload: {
        output: 'stream',
      },
    },
    handler: async (req, h) => {
      const { status, headers, body } = await yoga.handleNodeRequest(req.raw.req, { req, h });

      const res = h.response(
        Readable.from(body!, {
          // hapi needs the stream not to be in object mode
          objectMode: false,
        }),
      );

      for (const [key, val] of headers) {
        res.header(key, val);
      }

      return res.code(status);
    },
  });

  await server.start();
  return () => server.stop();
}