type LegalSectionProps = {
  id?: string;
  title: string;
  children: React.ReactNode;
};

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section
      id={id}
      className="rounded-[1.25rem] border border-white/[0.10] bg-white/[0.04] p-6 shadow-glass backdrop-blur-xl sm:p-8"
    >
      <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-400">{children}</div>
    </section>
  );
}
