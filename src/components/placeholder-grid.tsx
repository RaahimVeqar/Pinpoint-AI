type PlaceholderGridProps = {
  items: Array<{
    title: string;
    description: string;
  }>;
};

export function PlaceholderGrid({ items }: PlaceholderGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.title}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {item.description}
          </p>
        </article>
      ))}
    </div>
  );
}
