import { Hero } from "@/components/hero"
import { SiteNav } from "@/components/site-nav"
import { VideoBackground } from "@/components/video-background"

export function App() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <VideoBackground />
      <SiteNav />
      <Hero />
    </div>
  )
}

export default App
