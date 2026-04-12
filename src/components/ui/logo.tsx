// Swaps between the black and white wordmarks purely via CSS so the correct
// asset is visible on the first paint — no flash and no JS required.
// The visibility is driven by the `data-theme` attribute on <html>, which is
// set by the pre-paint script in the root layout.

type LogoProps = {
  className?: string;
  alt?: string;
};

export function Logo({ className, alt = 'Standard Nutrition' }: LogoProps) {
  return (
    <>
      <img
        src="/logos/standard-nutrition.png"
        alt={alt}
        className={`theme-logo-light ${className ?? ''}`}
      />
      <img
        src="/logos/standard-nutrition-white.png"
        alt=""
        aria-hidden="true"
        className={`theme-logo-dark ${className ?? ''}`}
      />
    </>
  );
}
