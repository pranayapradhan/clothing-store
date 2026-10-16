import PageContainer from "../../components/shared/PageContainer";

export default function HomePage() {
  return (
    <PageContainer>
      <section className="flex min-h-[70vh] items-center py-16">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gray-500">
            New Collection
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Style made for everyday life.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
            Discover carefully selected clothing designed for comfort,
            confidence, and everyday style.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}