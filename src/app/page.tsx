"use client";
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  HTMLAttributes,
} from "react";
import { TableVirtuoso } from "react-virtuoso";
import type { AppError } from "./errors";
import { AppErrorTypes } from "./errors";

interface Advocate {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: string;
}

export default function Home() {
  const [rows, setRows] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const cacheRef = useRef<Map<string, Advocate[]>>(new Map());

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/advocates`, { cache: "no-store" });
        if (!res.ok) throw res;
        const json = await res.json();
        const data: Advocate[] = (json.data ?? []) as Advocate[];
        setRows(data);
      } catch (e: unknown) {
        setError(AppErrorTypes(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = async () => {
    const q = searchTerm.trim();
    const key = q.toLowerCase();
    if (cacheRef.current.has(key)) {
      setRows(cacheRef.current.get(key)!);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/advocates${qs}`, {
        cache: "no-store",
      });
      if (!res.ok) throw res;
      const json = await res.json();
      const data: Advocate[] = (json.data ?? []) as Advocate[];
      cacheRef.current.set(key, data);
      setRows(data);
    } catch (e: unknown) {
      if ((e as any)?.name === "AbortError") return;
      setError(AppErrorTypes(e));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <span className="text-lg text-gray-500">Loading…</span>
      </main>
    );
  }
  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <span className="text-red-600 text-lg">Error: {error.message}</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Solace Advocates
        </h1>

        <div className="mb-8 flex flex-col md:flex-row items-center gap-4 bg-white p-6 rounded-lg shadow">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search (server-side)
            </label>
            <input
              id="search"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, city, degree, specialty…"
              className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="mt-2 text-xs text-gray-500">
              Searching for: <span className="font-semibold">{searchTerm}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow"
          >
            Search
          </button>
          <span className="text-sm text-gray-600">
            {rows.length} result{rows.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              handleSearch();
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md shadow"
          >
            Reset Search
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 shadow bg-white">
          <TableVirtuoso
            data={rows}
            style={{ height: "70vh" }}
            components={{
              Table: (props) => (
                <table
                  {...props}
                  className="min-w-[900px] w-full divide-y divide-gray-200"
                />
              ),
              TableHead: forwardRef<
                HTMLTableSectionElement,
                HTMLAttributes<HTMLTableSectionElement>
              >((props, ref) => (
                <thead ref={ref} {...props} className="bg-gray-100" />
              )),
              TableRow: (props) => (
                <tr {...props} className="hover:bg-blue-50" />
              ),
              TableBody: forwardRef<HTMLTableSectionElement>((props, ref) => (
                <tbody
                  ref={ref}
                  {...props}
                  className="divide-y divide-gray-200"
                />
              )),
            }}
            fixedHeaderContent={() => (
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  First Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  Last Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  City
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  Degree
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  Specialties
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  Years
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  Phone
                </th>
              </tr>
            )}
            itemContent={(_, a) => (
              <>
                <td className="px-4 py-3 whitespace-nowrap">{a.firstName}</td>
                <td className="px-4 py-3 whitespace-nowrap">{a.lastName}</td>
                <td className="px-4 py-3 whitespace-nowrap">{a.city}</td>
                <td className="px-4 py-3 whitespace-nowrap">{a.degree}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1.5">
                    {a.specialties.map((s, i) => (
                      <span
                        key={`${a.id}-spec-${i}`}
                        className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700 ring-1 ring-inset ring-indigo-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {a.yearsOfExperience}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{a.phoneNumber}</td>
              </>
            )}
          />
        </div>
      </div>
    </main>
  );
}
