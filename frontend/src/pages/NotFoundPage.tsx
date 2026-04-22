import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-xl p-6 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600">
        The page you requested does not exist.
      </p>
      <Link
        to="/"
        className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
      >
        Back to home
      </Link>
    </main>
  );
}
