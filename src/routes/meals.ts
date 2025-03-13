import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

export async function mealsRoutes(server: FastifyInstance) {
  server.post(
    '/',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date()
      });

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body
      );

      const { sessionId: userId } = request.cookies;

      await knex('meals').insert({
        user_id: userId,
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime()
      });

      return reply.status(201).send();
    }
  );

  server.put(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() });
      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date()
      });

      const { mealId } = paramsSchema.parse(request.params);
      const { name, description, isOnDiet, date } = updateMealBodySchema.parse(
        request.body
      );

      const { sessionId: userId } = request.cookies;

      const meal = await knex('meals')
        .where({ id: mealId, user_id: userId })
        .first();

      if (!meal) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Meal not found',
          statusCode: 404
        });
      }

      await knex('meals').where({ id: mealId, user_id: userId }).update({
        name,
        description,
        is_on_diet: isOnDiet,
        date: date.getTime()
      });

      return reply.status(204).send();
    }
  );

  server.delete(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() });

      const { mealId } = paramsSchema.parse(request.params);

      const { sessionId: userId } = request.cookies;

      const meal = await knex('meals')
        .where({ id: mealId, user_id: userId })
        .first();

      if (!meal) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Meal not found',
          statusCode: 404
        });
      }

      await knex('meals').where({ id: mealId, user_id: userId }).delete();

      return reply.status(204).send();
    }
  );

  server.get(
    '/',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request) => {
      const { sessionId: userId } = request.cookies;

      const meals = await knex('meals')
        .where({ user_id: userId })
        .orderBy('date', 'desc');

      return { meals };
    }
  );

  server.get(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      const paramsSchema = z.object({ mealId: z.string().uuid() });

      const { mealId } = paramsSchema.parse(request.params);

      const { sessionId: userId } = request.cookies;

      const meal = await knex('meals')
        .where({ id: mealId, user_id: userId })
        .first();

      if (!meal) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Meal not found',
          statusCode: 404
        });
      }

      return { meal };
    }
  );

  server.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request) => {
      const { sessionId: userId } = request.cookies;

      const meals = await knex('meals')
        .where({ user_id: userId })
        .orderBy('date', 'desc');

      const mealsOnDiet = meals.filter((meal) => meal.is_on_diet);
      const mealsNotOnDiet = meals.filter((meal) => !meal.is_on_diet);

      const { bestOnDietSequence } = meals.reduce(
        (acc, meal) => {
          if (meal.is_on_diet) {
            acc.currentOnDietSequence += 1;
          } else {
            acc.currentOnDietSequence = 0;
          }

          if (acc.currentOnDietSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentOnDietSequence;
          }

          return acc;
        },
        {
          bestOnDietSequence: 0,
          currentOnDietSequence: 0
        }
      );

      return {
        totalMeals: meals.length,
        totalMealsOnDiet: mealsOnDiet.length,
        totalMealsNotOnDiet: mealsNotOnDiet.length,
        bestOnDietSequence
      };
    }
  );
}
