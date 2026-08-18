import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#12010c] px-6 text-center">
      <div>
        <p className="kicker text-[#f6d56b]">404</p>
        <h1 className="display-lg mt-3">WRONG MOOD.</h1>
        <p className="italic-line mt-4 text-2xl">This shade doesn’t exist. Yet.</p>
        <Link href="/" className="cta solid mt-8 inline-flex">
          BACK TO BADDIE →
        </Link>
      </div>
    </main>
  );
}
