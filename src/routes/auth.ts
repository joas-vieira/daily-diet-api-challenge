import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';

export async function authRoutes(server: FastifyInstance) {
  server.post('/sign-up', async (request, reply) => {
    const signUpBodySchema = z.object({
      name: z.string(),
      email: z.string().email()
    });

    const { name, email } = signUpBodySchema.parse(request.body);

    const [{ id }] = await knex('users')
      .insert({ name, email })
      .returning('id');

    reply.setCookie('sessionId', id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return reply.status(201).send();
  });

  server.post('/sign-in', async (request, reply) => {
    const signInBodySchema = z.object({
      email: z.string().email()
    });

    const { email } = signInBodySchema.parse(request.body);

    const user = await knex('users').where({ email }).first();

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid email',
        statusCode: 401
      });
    }

    reply.setCookie('sessionId', user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return reply.status(200).send();
  });

  server.post('/sign-out', async (request, reply) => {
    reply.clearCookie('sessionId', { path: '/' });

    return reply.status(200).send();
  });
}
