export type AppError =
  | { type: "NetworkError"; message: string; status?: number }
  | { type: "ValidationError"; message: string; field?: string }
  | { type: "UnknownError"; message: string };

export function AppErrorTypes(e: unknown): AppError {
  if (e instanceof Response) {
    return {
      type: "NetworkError",
      message: `HTTP ${e.status} ${e.statusText}`,
      status: e.status,
    };
  }
  if (e instanceof Error) {
    return { type: "UnknownError", message: e.message };
  }
  return { type: "UnknownError", message: "Unexpected error" };
}
