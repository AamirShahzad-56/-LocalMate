
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-blue-600">
          LocalMate
        </Link>

        <div className="flex gap-4 text-sm">
          <Link href="/location" className="hover:text-blue-600">
            Location
          </Link>

          <Link href="/login" className="hover:text-blue-600">
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
