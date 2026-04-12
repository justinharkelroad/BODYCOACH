export const metadata = {
  title: 'Terms of Service | Standard Nutrition',
  description: 'Terms of service for Standard Nutrition.',
};

const sections = [
  {
    title: '1. Acceptance',
    body: [
      'By using Standard Nutrition, you agree to these Terms.',
      'You must be 18 or older and provide accurate account details.',
    ],
  },
  {
    title: '2. Service',
    body: [
      'Standard Nutrition provides AI-assisted coaching for nutrition, workouts, and progress tracking.',
      'The service is intended as support and is not a substitute for professional medical care.',
    ],
  },
  {
    title: '3. Health and Use',
    body: [
      'Do not rely on the app for medical diagnosis or treatment.',
      'You are responsible for choosing safe activity levels based on your own health.',
    ],
  },
  {
    title: '4. Account and Content',
    body: [
      'Keep your login credentials private.',
      'You retain ownership of content you upload, with limited rights for app functionality.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-0">
      <header>
        <h1 className="text-3xl font-bold text-[var(--neutral-dark)]">Terms of Service</h1>
        <p className="mt-3 text-[var(--neutral-gray)]">
          Last updated: January 2025
        </p>
      </header>

      {sections.map((section, index) => (
        <section key={index} className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--neutral-dark)]">{section.title}</h2>
          <ul className="list-disc pl-5 text-[var(--neutral-dark)] space-y-2">
            {section.body.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
