import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedRecipes from "@/components/FeaturedRecipes";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center pt-28 sm:pt-32 pb-16 px-4 gap-10">
        <Hero />

        {/* Features section */}
        <section className="w-full max-w-6xl mx-auto grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Curated collections",
              desc: "Weeknight quickies, meal-prep staples, and crowd-pleasers in one place.",
              emoji: "📚",
            },
            {
              title: "Save & share",
              desc: "Keep favorites at hand and send your best dishes to friends.",
              emoji: "�",
            },
            {
              title: "Smart filters",
              desc: "Time, difficulty, dietary tags — find what fits right now.",
              emoji: "✨",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg">
                <span aria-hidden>{f.emoji}</span>
              </div>
              <h3 className="mt-3 font-semibold text-base text-gray-900">
                {f.title}
              </h3>
              <p className="mt-1 text-sm text-gray-700">{f.desc}</p>
            </div>
          ))}
        </section>

        <FeaturedRecipes />

        {/* CTA banner */}
        <section className="w-full max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-8 sm:p-10">
            <div className="relative z-10 flex flex-col items-start gap-3 text-gray-900">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Join thousands of home chefs
              </h3>
              <p className="text-gray-700 max-w-2xl">
                Create an account to save recipes, build collections, and share
                your own masterpieces.
              </p>
              <a
                href="/register"
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Get started — it’s free
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-8 text-center text-sm text-gray-500 border-t border-gray-100 mt-auto">
        © {new Date().getFullYear()} Recipe Hub. Crafted with{" "}
        <span className="text-pink-500">♥</span>.
      </footer>
    </div>
  );
}
