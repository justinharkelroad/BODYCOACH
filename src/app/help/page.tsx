export const metadata = {
  title: 'Help Center | Standard Nutrition',
  description: 'Help and support resources for the Standard Nutrition app.',
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-0">
      <section>
        <h1 className="text-3xl font-bold text-[var(--neutral-dark)]">Help Center</h1>
        <p className="mt-3 text-[var(--neutral-gray)]">
          Need support? Start here with common topics and ways to contact us.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--neutral-dark)]">Getting Started</h2>
        <ul className="list-disc space-y-2 pl-5 text-[var(--neutral-dark)]">
          <li>Create an account and complete onboarding to set your goals.</li>
          <li>Log your daily weight and progress photos to track trendlines.</li>
          <li>Log meals with search or barcode scan.</li>
          <li>Use notifications to keep on top of check-ins and workouts.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--neutral-dark)]">Contact Support</h2>
        <p className="text-[var(--neutral-dark)]">
          Email <a href="mailto:support@standardnutrition.com" className="text-[var(--primary-deep)]">support@standardnutrition.com</a> and we’ll respond during business hours.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--neutral-dark)]">Resource Links</h2>
        <div className="space-y-2">
          <a href="/terms" className="block text-[var(--primary-deep)]">Terms of Service</a>
          <a href="/privacy" className="block text-[var(--primary-deep)]">Privacy Policy</a>
        </div>
      </section>
    </div>
  );
}
