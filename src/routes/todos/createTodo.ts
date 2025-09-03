import express from "express";
import { handleZodErrorResponse } from "utils/error";
import { NewTodoSchema } from "types/todos";
import { addTodo } from "mockup/todos";

const router = express.Router();

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new todo
 *     tags:
 *       - Todos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTodo'
 *     responses:
 *       200:
 *         description: The created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       500:
 *         description: Server error
 */

router.post("/", async (req, res) => {
  try {
    const parsed = NewTodoSchema.parse(req.body); // now includes priority & date
    const insertedTodo = addTodo(parsed);
    res.status(201).json(insertedTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    handleZodErrorResponse(res, error);
  }
});

export { router as createTodoRouter };
