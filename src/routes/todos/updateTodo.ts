import express from "express";
import { handleZodErrorResponse } from "utils/error";
import { TodoSchema, Todo } from "types/todos";
import { getTodo, getTodos, setTodos } from "mockup/todos";

const router = express.Router();

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Update a todo by ID
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the todo to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTodo'
 *     responses:
 *       200:
 *         description: The updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 *       500:
 *         description: Server error
 */
const UpdateTodoSchema = TodoSchema.partial().extend({
  id: TodoSchema.shape.id,
});

router.put("/:id", async (req, res) => {
  try {
    const body = {
      ...req.body,
      id: req.params.id,
      ...(req.body.date ? { date: new Date(req.body.date) } : {}),
    };

    const updatedTodo = UpdateTodoSchema.parse(body);

    const existing = getTodos().find((t) => t.id === updatedTodo.id);
    if (!existing) return res.status(404).json({ error: "Todo not found" });

    // merged dengan type aman
    const merged: Todo = {
      ...existing,
      ...updatedTodo,
      date: updatedTodo.date ?? existing.date,
      priority: updatedTodo.priority ?? existing.priority,
    };

    setTodos(merged.id, merged);
    res.status(200).json(getTodo(merged.id));
  } catch (error) {
    console.error("Error updating todo:", error);
    handleZodErrorResponse(res, error);
  }
});

export { router as updateTodoRouter };
