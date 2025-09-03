import express from "express";
import { getTodos } from "mockup/todos";
import { Todo } from "types/todos";

const router = express.Router();

/**
 * @swagger
 * /todos/scroll:
 *   get:
 *     summary: Retrieve todos with optional filtering, sorting, and infinite scrolling
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter todos by their completion status
 *       - in: query
 *         name: nextCursor
 *         schema:
 *           type: integer
 *           default: 0
 *         description: The starting index for the next batch of todos.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of todos to retrieve per request.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [title, date]
 *         description: Field to sort todos by.
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (ascending or descending).
 *     responses:
 *       200:
 *         description: A batch of todos for infinite scrolling
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *                 nextCursor:
 *                   type: integer
 *                   nullable: true
 *                   description: The cursor for the next batch, or null if no more todos.
 *                 hasNextPage:
 *                   type: boolean
 *                   description: Whether there are more todos to load.
 *       500:
 *         description: Server error
 */
const prioOrder: Record<Todo["priority"], number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

// helper: ambil nilai field sesuai sort key
function getSortableValue(todo: Todo, key: string): string | number {
  switch (key) {
    case "date":
      return +new Date(todo.date);
    case "priority":
      return prioOrder[todo.priority];
    case "title":
      return todo.title;
    case "id":
      return todo.id;
    case "completed":
      return todo.completed ? 1 : 0; // boolean → number
    default:
      return 0;
  }
}

router.get("/scroll", async (req, res) => {
  try {
    const {
      completed,
      priority,
      dateGte,
      dateLte,
      nextCursor = 0,
      limit = 10,
      sort = "date",
      order = "asc",
    } = req.query;

    let todos = getTodos();

    if (completed === "true") todos = todos.filter((t) => t.completed);
    else if (completed === "false") todos = todos.filter((t) => !t.completed);

    if (priority && ["LOW", "MEDIUM", "HIGH"].includes(String(priority))) {
      todos = todos.filter((t) => t.priority === String(priority));
    }

    if (dateGte)
      todos = todos.filter((t) => t.date >= new Date(String(dateGte)));
    if (dateLte)
      todos = todos.filter((t) => t.date <= new Date(String(dateLte)));

    if (
      ["id", "title", "completed", "date", "priority"].includes(String(sort))
    ) {
      todos = todos.sort((a, b) => {
        const va = getSortableValue(a, String(sort));
        const vb = getSortableValue(b, String(sort));

        if (va < vb) return order === "asc" ? -1 : 1;
        if (va > vb) return order === "asc" ? 1 : -1;
        return 0;
      });
    }

    const cursorNum = parseInt(nextCursor as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const batch = todos.slice(cursorNum, cursorNum + limitNum);

    const newNextCursor = cursorNum + batch.length;
    const hasNextPage = newNextCursor < todos.length;

    await new Promise<void>((resolve) => setTimeout(resolve, 300));

    res.status(200).json({
      todos: batch,
      nextCursor: hasNextPage ? newNextCursor : null,
      hasNextPage,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export { router as getScrollTodosRouter };
