import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 h-[60px] bg-white border-b border-gray-100">
      <Link href="/" className="text-[1.05rem] font-bold tracking-tight text-gray-950">
        Jaaduwalapay
      </Link>

      <div className="flex items-center gap-8">
        <Link href="/features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</Link>
        <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link>
        <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">About</Link>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/signin" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">
          Log in
        </Link>
        <Link href="/signup" className="text-sm font-medium text-white bg-gray-950 px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
          Get started
        </Link>
      </div>
    </nav>
  );
}
