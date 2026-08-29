import { Button } from "@/components/ui/button"

const displayFont = { fontFamily: "'Instrument Serif', serif" } as const

export function Hero() {
  return (
    <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-[90px] pt-32 pb-40 text-center">
      <h1
        className="animate-fade-rise max-w-7xl text-5xl leading-[0.95] font-normal tracking-[-2.46px] sm:text-7xl md:text-8xl"
        style={displayFont}
      >
        Where <em className="text-muted-foreground not-italic">dreams</em> rise{" "}
        <em className="text-muted-foreground not-italic">
          through the silence.
        </em>
      </h1>

      <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        We&apos;re designing tools for deep thinkers, bold creators, and quiet
        rebels. Amid the chaos, we build digital spaces for sharp focus and
        inspired work.
      </p>

      <Button
        variant="liquid"
        size="auto"
        className="animate-fade-rise-delay-2 mt-12 cursor-pointer rounded-full px-14 py-5 text-base text-foreground hover:scale-[1.03]"
      >
        Begin Journey
      </Button>
    </section>
  )
}
