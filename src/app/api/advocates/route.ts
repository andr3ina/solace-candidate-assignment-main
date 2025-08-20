// app/api/advocates/route.ts
import db from "@/db";
import { advocates } from "@/db/schema";
import { ilike, or, sql } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) {
    const data = await db.select().from(advocates);
    return Response.json({ data });
  }

  const like = `%${q}%`;

  const data = await db
    .select()
    .from(advocates)
    .where(
      or(
        ilike(advocates.firstName, like),
        ilike(advocates.lastName, like),
        ilike(advocates.city, like),
        ilike(advocates.degree, like),
        sql<boolean>`EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(
            CASE
              WHEN ${advocates.specialties} IS NULL THEN '[]'::jsonb
              WHEN jsonb_typeof(${advocates.specialties}) = 'array' THEN ${advocates.specialties}
              ELSE jsonb_build_array(${advocates.specialties})
            END
          ) s
          WHERE s ILIKE ${like}
        )`,
        sql<boolean>`(${advocates.yearsOfExperience})::text ILIKE ${like}`,
        sql<boolean>`(${advocates.phoneNumber})::text ILIKE ${like}`
      )
    );

  return Response.json({ data });
}
