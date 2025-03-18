import { execSync } from 'node:child_process';
import request from 'supertest';
import { app } from '../src/app';

describe('auth', () => {
  beforeAll(() => app.ready());

  afterAll(() => app.close());

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should sign up', async () => {
    const body = {
      name: 'John Doe',
      email: 'john.doe@mail.com'
    };

    await request(app.server).post('/auth/sign-up').send(body).expect(201);
  });

  it('should sign in', async () => {
    const signUpBody = {
      name: 'John Doe',
      email: 'john.doe@mail.com'
    };

    const signInBody = {
      email: 'john.doe@mail.com'
    };

    await request(app.server)
      .post('/auth/sign-up')
      .send(signUpBody)
      .expect(201);

    await request(app.server)
      .post('/auth/sign-in')
      .send(signInBody)
      .expect(200);
  });

  it('should sign out', async () => {
    const signUpBody = {
      name: 'John Doe',
      email: 'john.doe@mail.com'
    };

    const signInBody = {
      email: 'john.doe@mail.com'
    };

    await request(app.server)
      .post('/auth/sign-up')
      .send(signUpBody)
      .expect(201);

    await request(app.server)
      .post('/auth/sign-in')
      .send(signInBody)
      .expect(200);

    await request(app.server).post('/auth/sign-out').expect(200);
  });
});
