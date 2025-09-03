import express from "express";
import { getTodos } from "mockup/todos";
import { Todo } from "types/todos";

const router = express.Router();

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Retrieve todos with optional filtering, pagination, and sorting
 *     tags:
 *       - Todos
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *           nullable: true
 *         description: Filter by completion status (true/false). Omit to fetch all.
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         description: Filter by priority.
 *       - in: query
 *         name: dateGte
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter todos with date >= this value (ISO 8601).
 *       - in: query
 *         name: dateLte
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter todos with date <= this value (ISO 8601).
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (starting from 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of todos per page.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [id, title, completed, date, priority]
 *         description: Field to sort by.
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order.
 *     responses:
 *       200:
 *         description: A paginated list of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *                 totalTodos:
 *                   type: integer
 *                 hasNextPage:
 *                   type: boolean
 *                 nextPage:
 *                   type: integer
 *                   nullable: true
 *       500:
 *         description: Server error
 *
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the todo.
 *         title:
 *           type: string
 *           description: The title or name of the todo.
 *         completed:
 *           type: boolean
 *           description: Whether the todo is completed or not.
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date associated with the todo.
 */
type TodoKey = "id" | "title" | "completed" | "date" | "priority";

const prioOrder: Record<Todo["priority"], number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

// helper untuk ambil nilai yang bisa di-sort
function getSortableValue(todo: Todo, key: TodoKey): string | number {
  switch (key) {
    case "id":
      return todo.id;
    case "title":
      return todo.title;
    case "completed":
      return todo.completed ? 1 : 0; // boolean → number
    case "date":
      return +new Date(todo.date);
    case "priority":
      return prioOrder[todo.priority];
  }
}

router.get("/", async (req, res) => {
  try {
    const {
      completed,
      priority,
      dateGte,
      dateLte,
      page = 1,
      limit = 10,
      sort = "date",
      order = "asc",
    } = req.query;

    let todos = getTodos();

    // completed filter
    if (completed === "true") todos = todos.filter((t) => t.completed);
    else if (completed === "false") todos = todos.filter((t) => !t.completed);

    // priority filter
    if (priority && ["LOW", "MEDIUM", "HIGH"].includes(String(priority))) {
      todos = todos.filter((t) => t.priority === String(priority));
    }

    // date range filter
    if (dateGte) {
      const d = new Date(String(dateGte));
      todos = todos.filter((t) => t.date >= d);
    }
    if (dateLte) {
      const d = new Date(String(dateLte));
      todos = todos.filter((t) => t.date <= d);
    }

    // sorting
    const sortables: TodoKey[] = [
      "id",
      "title",
      "completed",
      "date",
      "priority",
    ];
    if (sort && sortables.includes(sort as TodoKey)) {
      todos = todos.sort((a, b) => {
        const key = sort as TodoKey;
        const aValue = getSortableValue(a, key);
        const bValue = getSortableValue(b, key);

        if (aValue < bValue) return order === "asc" ? -1 : 1;
        if (aValue > bValue) return order === "asc" ? 1 : -1;
        return 0;
      });
    }

    // paginate
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginated = todos.slice(startIndex, endIndex);
    const totalTodos = todos.length;
    const hasNextPage = endIndex < totalTodos;
    const nextPage = hasNextPage ? pageNum + 1 : null;

    res
      .status(200)
      .json({ todos: paginated, totalTodos, hasNextPage, nextPage });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export { router as getTodosRouter };
