
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>

      <p className="mb-4 text-sm text-gray-600">
        Login form will be built in Week 4.
      </p>

      <Link
        href="/location"
        className="inline-block rounded bg-blue-600 px-4 py-2 text-white"
      >
        Continue (temporary)
      </Link>
    </main>
  );
}
