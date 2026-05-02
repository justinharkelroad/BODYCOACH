// Single light wordmark — the v2 design is always light, so we no longer
// swap between light/dark variants. The previous `standard-nutrition-white.png`
// asset only contained the "NUTRITION" half and is no longer used.

type LogoProps = {
  className?: string;
  alt?: string;
};

export function Logo({ className, alt = 'Standard Nutrition' }: LogoProps) {
  return (
    <img
      src="/logos/standard-nutrition.png"
      alt={alt}
      className={className}
    />
  );
}
