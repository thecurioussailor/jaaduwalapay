import Link from "next/link";

const partners = [
  "Biryani House", "Chai Stop", "Dosa Corner",
  "Tandoor & Co.", "Momo Republic", "Spice Route",
  "The Curry Lab", "Bombay Bites",
];

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] bg-gray-950 flex flex-col items-center justify-center text-center px-6 overflow-hidden">

      {/* subtle grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      {/* hero text */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-[clamp(3rem,8vw,7rem)] font-bold text-white leading-[1.04] tracking-tight max-w-4xl">
          Scan. Order.<br />Paid in seconds.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-lg leading-relaxed">
          QR-based ordering and USDC payments for restaurants —
          0% fees, instant settlement, loyalty rewards built in.
        </p>

        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/signup"
            className="bg-white text-gray-950 text-sm font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/contact"
            className="bg-transparent text-white text-sm font-semibold px-6 py-3 rounded-full border border-white/20 hover:border-white/50 transition-colors"
          >
            Talk to sales
          </Link>
        </div>
      </div>

      {/* logo strip */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-5 overflow-hidden">
        <div className="flex items-center gap-12 animate-[marquee_20s_linear_infinite] whitespace-nowrap w-max">
          {[...partners, ...partners].map((name, i) => (
            <span key={i} className="text-white/30 text-sm font-medium tracking-widest uppercase">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
