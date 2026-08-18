import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-[#14010e] pb-28 pt-28">
      <img
        src="/images/baddie-squad.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-[#12010c]/70" />
      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <p className="kicker text-[#f6d56b]">ABOUT BADDIE</p>
        <h1 className="display-lg mt-3">
          ONE WOMAN.
          <br />
          MANY MOODS.
          <br />
          ONE BADDIE.
        </h1>
        <div className="italic-line mt-10 space-y-8 text-2xl leading-snug text-white/85">
          <p>
            BADDIE is not a nude-on-beige cosmetics counter. It is a living Indian fashion poster —
            loud, feminine, playful, confident, chaotic, and premium.
          </p>
          <p>
            Every shade is a caricature. A colour world. An outfit. A walk. A wink. We make lipstick
            for the woman who refuses a single mood, a single silhouette, a single room-voice.
          </p>
          <p>
            Inspired by maximalist textile, Bollywood poster lettering, chrome jewellery, marigold
            heat and editorial beauty — then pushed into surreal pop art.
          </p>
        </div>
        <Link href="/shop" className="cta solid mt-12 inline-flex">
          SHOP THE UNIVERSE →
        </Link>
      </div>
    </main>
  );
}
