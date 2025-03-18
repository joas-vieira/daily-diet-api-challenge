import { execSync } from 'node:child_process';
import request from 'supertest';
import { app } from '../src/app';

describe('meals', () => {
  beforeAll(() => app.ready());

  afterAll(() => app.close());

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should create a meal', async () => {
    const signUpBody = {
      name: 'John Doe',
      email: 'john.doe@mail.com'
    };

    const createMealBody = {
      name: 'Breakfast',
      description: 'A delicious breakfast',
      isOnDiet: false,
      date: new Date().toISOString()
    };

    const signUpResponse = await request(app.server)
      .post('/auth/sign-up')
      .send(signUpBody)
      .expect(201);

    const cookies = signUpResponse.get('Set-Cookie') ?? [];

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send(createMealBody)
      .expect(201);
  });

  it('should get all meals', async () => {
    const signUpBody = {
      name: 'John Doe',
      email: 'john.doe@mail.com'
    };

    const createMealBody = {
      name: 'Breakfast',
      description: 'A delicious breakfast',
      isOnDiet: false,
      date: new Date().toISOString()
    };

    const signUpResponse = await request(app.server)
      .post('/auth/sign-up')
      .send(signUpBody)
      .expect(201);

    const cookies = signUpResponse.get('Set-Cookie') ?? [];

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send(createMealBody)
      .expect(201);

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200);

    expect(getMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        user_id: expect.any(String),
        name: 'Breakfast',
        description: 'A delicious breakfast',
        is_on_diet: 0,
        date: expect.any(Number),
        created_at: expect.any(String),
        updated_at: expect.any(String)
      })
    ]);
  });

  it('should get a meal', async () => {
    const signUpBody = {
      name: 'John Doe',
      email: 'john.doe@mail.com'
    };

    const createMealBody = {
      name: 'Breakfast',
      description: 'A delicious breakfast',
      isOnDiet: false,
      date: new Date().toISOString()
    };

    const signUpResponse = await request(app.server)
      .post('/auth/sign-up')
      .send(signUpBody)
      .expect(201);

    const cookies = signUpResponse.get('Set-Cookie') ?? [];

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send(createMealBody)
      .expect(201);

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200);

    const mealId = getMealsResponse.body.meals[0].id;

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        user_id: expect.any(String),
        name: 'Breakfast',
        description: 'A delicious breakfast',
        is_on_diet: 0,
        date: expect.any(Number),
        created_at: expect.any(String),
        updated_at: expect.any(String)
      })
    );
  });

  it('should delete a meal', async () => {
    const signUpBody = {
      name: 'John Doe',
      email: 'john.doe@mail.com'
    };

    const createMealBody = {
      name: 'Breakfast',
      description: 'A delicious breakfast',
      isOnDiet: false,
      date: new Date().toISOString()
    };

    const signUpResponse = await request(app.server)
      .post('/auth/sign-up')
      .send(signUpBody)
      .expect(201);

    const cookies = signUpResponse.get('Set-Cookie') ?? [];

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send(createMealBody)
      .expect(201);

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200);

    const mealId = getMealsResponse.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204);
  });

  it('should update a meal', async () => {
    const signUpBody = {
      name: 'John Doe',
      email: 'john.doe@mail.com'
    };

    const createMealBody = {
      name: 'Breakfast',
      description: 'A delicious breakfast',
      isOnDiet: false,
      date: new Date().toISOString()
    };

    const updateMealBody = {
      name: 'Lunch',
      description: 'A delicious lunch',
      isOnDiet: true,
      date: new Date().toISOString()
    };

    const signUpResponse = await request(app.server)
      .post('/auth/sign-up')
      .send(signUpBody)
      .expect(201);

    const cookies = signUpResponse.get('Set-Cookie') ?? [];

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send(createMealBody)
      .expect(201);

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200);

    const mealId = getMealsResponse.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send(updateMealBody)
      .expect(204);
  });

  it('should get metrics', async () => {
    const signUpBody = {
      name: 'John Doe',
      email: 'john.doe@mail.com'
    };

    const createMealNotOnDietBody = {
      name: 'Breakfast',
      description: 'A delicious breakfast',
      isOnDiet: false,
      date: new Date().toISOString()
    };

    const createMealOnDietBody = {
      name: 'Lunch',
      description: 'A delicious lunch',
      isOnDiet: true,
      date: new Date().toISOString()
    };

    const signUpResponse = await request(app.server)
      .post('/auth/sign-up')
      .send(signUpBody)
      .expect(201);

    const cookies = signUpResponse.get('Set-Cookie') ?? [];

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send(createMealNotOnDietBody)
      .expect(201);

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send(createMealOnDietBody)
      .expect(201);

    const getMetricsResponse = await request(app.server)
      .get(`/meals/metrics`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getMetricsResponse.body).toEqual({
      totalMeals: 2,
      totalMealsOnDiet: 1,
      totalMealsNotOnDiet: 1,
      bestOnDietSequence: 1
    });
  });
});
