import { z } from "zod";

export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  date: z.date(),
  priority: PrioritySchema,
});
export type Todo = z.infer<typeof TodoSchema>;

export const NewTodoSchema = z.object({
  title: z.string(),
  completed: z.boolean().default(false),
  date: z.union([z.date(), z.string().datetime()]).optional(),
  priority: PrioritySchema.default("MEDIUM"),
});

export type NewTodo = z.infer<typeof NewTodoSchema>;

export const TodoWithoutDateSchema = TodoSchema.omit({ date: true });
