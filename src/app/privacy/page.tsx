export const metadata = {
  title: 'Privacy Policy | Standard Nutrition',
  description: 'Privacy policy for Standard Nutrition.',
};

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'Profile information (email, name, age, and fitness goals).',
      'Body stats, progress photos, check-ins, and workout activity.',
      'Usage and crash analytics needed to improve app reliability.',
    ],
  },
  {
    title: 'How We Use Your Data',
    body: [
      'Generate coaching recommendations.',
      'Track trends and progress in your dashboard.',
      'Send reminders based on your notification preferences.',
    ],
  },
  {
    title: 'Third-Party Services',
    body: [
      'Supabase for authentication, storage, and database.',
      'Third-party nutrition and AI providers for recommendations.',
    ],
  },
  {
    title: 'Your Rights',
    body: [
      'Access or update your profile details at any time.',
      'Delete your account and associated data via support request.',
      'Opt out of marketing emails using in-app settings.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-0">
      <header>
        <h1 className="text-3xl font-bold text-[var(--neutral-dark)]">Privacy Policy</h1>
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
