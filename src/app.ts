import cookie from '@fastify/cookie';
import fastify from 'fastify';
import { authRoutes } from './routes/auth';
import { mealsRoutes } from './routes/meals';

export const app = fastify();

app.register(cookie);

app.register(authRoutes, { prefix: '/auth' });
app.register(mealsRoutes, { prefix: '/meals' });
