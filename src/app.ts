import cookie from '@fastify/cookie';
import fastify from 'fastify';
import { authRoutes } from './routes/auth';

export const app = fastify();

app.register(cookie);
app.register(authRoutes, { prefix: '/auth' });
