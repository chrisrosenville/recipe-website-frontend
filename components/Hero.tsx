import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left: Text + Search */}
          <div>
            <div className="text-sm font-medium text-amber-600">
              Discover, cook, enjoy
            </div>
            <h1 className="mt-3 text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
              Find recipes you’ll actually cook
            </h1>
            <p className="mt-5 text-lg text-gray-700 max-w-xl">
              Browse simple, tasty dishes from home cooks. Search by craving and
              save the ones you love.
            </p>

            <form
              action="/recipes"
              method="get"
              className="mt-8 max-w-xl mx-auto"
            >
              <label className="sr-only" htmlFor="q">
                Search recipes
              </label>
              <div className="flex items-stretch rounded-xl border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-amber-500/60">
                <input
                  id="q"
                  name="q"
                  placeholder="Search pasta, tacos, brownies…"
                  className="flex-1 min-w-0 bg-transparent px-4 py-3 text-base outline-none text-gray-900 placeholder:text-gray-500"
                />
                <button className="px-5 py-3 bg-amber-600 text-white font-semibold rounded-r-xl hover:bg-amber-700 transition-colors">
                  Search
                </button>
              </div>
            </form>

            <div className="mt-3 text-sm text-gray-600 text-center max-w-xl mx-auto">
              <span>or </span>
              <Link
                href="/recipes"
                className="font-medium text-amber-700 hover:underline"
              >
                browse all recipes
              </Link>
            </div>
          </div>

          {/* Right: Angled image panel */}
          <div className="relative h-[420px] md:h-[460px]">
            <div
              aria-hidden
              className="absolute inset-0 -right-6 rotate-[-6deg] rounded-3xl overflow-hidden shadow-xl border border-gray-200"
            >
              <Image
                src="/hero-recipes.jpg"
                alt="Assorted home-cooked dishes"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 540px, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
