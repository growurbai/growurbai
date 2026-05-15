type GrowUrbAuthLogoProps = {
  className?: string;
};

export function GrowUrbAuthLogo({ className = "" }: GrowUrbAuthLogoProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-gold text-base font-bold text-white shadow-[0_0_36px_-6px_rgba(124,58,237,0.65)]">
        GU
      </span>
      <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
        GrowUrb<span className="text-gold"> AI</span>
      </span>
    </div>
  );
}
