import { HeroHeader } from "@/components/hero-header"
import { InputSection } from "@/components/input-section"
import { ResultCard } from "@/components/result-card"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <HeroHeader />
        <InputSection />
        <ResultCard />
      </div>
    </main>
  )
}
