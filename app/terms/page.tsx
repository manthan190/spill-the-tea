import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = {
  title: 'Terms of Service — Spill The Tea',
  description: 'The rules for using Spill The Tea. No harassment, 13+ only, 30-day IP log retention.',
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="September 17, 2026">
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account, claiming a handle, or sending a message on
          Spill The Tea ("we", "us", "the Service"), you agree to be bound by
          these Terms of Service. If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2>2. Age Requirement</h2>
        <p>
          You must be at least 13 years old to use Spill The Tea. By using the
          Service, you confirm that you meet this age requirement. We do not
          knowingly collect personal information from children under 13. If you
          believe a user under 13 has created an account, please contact us at
          support@spillthetea.app and we will remove it.
        </p>
      </section>

      <section>
        <h2>3. Prohibited Conduct</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Harass, threaten, intimidate, or bully any person.</li>
          <li>Send messages containing hate speech, slurs, or targeted abuse.</li>
          <li>Share sexual content, gore, or content sexualizing minors.</li>
          <li>Impersonate another person or falsely claim their identity.</li>
          <li>Spam or send unsolicited mass messages.</li>
          <li>Attempt to de-anonymize other users or circumvent paywall protections.</li>
        </ul>
        <p>
          We employ automated content moderation to flag severe violations.
          Flagged messages are blurred in the recipient's inbox and may be
          reviewed. Recipients can also block any sender's IP address from
          sending further messages.
        </p>
      </section>

      <section>
        <h2>4. IP Log Retention</h2>
        <p>
          For legal compliance, abuse prevention, and rate limiting, we retain
          sender IP addresses for a maximum of 30 days from the date a message
          is sent. After 30 days, IP records are automatically purged. We do
          not retain permanent logs that can be used to de-anonymize users
          beyond this window.
        </p>
      </section>

      <section>
        <h2>5. Content Ownership &amp; Licensing</h2>
        <p>
          You retain ownership of the content you submit. By sending a message,
          you grant Spill The Tea a limited license to store, display, and
          process that message for the purpose of delivering it to the
          intended recipient. Recipients may delete any message at any time.
        </p>
      </section>

      <section>
        <h2>6. Paid Features</h2>
        <p>
          Certain features (Express Tea priority pin, hint unlocks, voice tea
          unlock) require payment via Razorpay. All payments are processed
          securely by Razorpay. Digital purchases are delivered instantly and
          are non-refundable except where required by law. See our{' '}
          <a href="/refunds">Refund Policy</a> for details.
        </p>
      </section>

      <section>
        <h2>7. Termination</h2>
        <p>
          We may suspend or terminate access to the Service at any time for
          violations of these Terms. You may delete your account and all
          associated data at any time by contacting
          support@spillthetea.app.
        </p>
      </section>

      <section>
        <h2>8. Disclaimer of Warranties</h2>
        <p>
          The Service is provided "as is" without warranties of any kind. We
          do not guarantee that messages will be delivered, that the Service
          will be uninterrupted, or that anonymity is absolute. You use the
          Service at your own risk.
        </p>
      </section>

      <section>
        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Spill The Tea shall not be
          liable for any indirect, incidental, special, or consequential
          damages arising from your use of the Service.
        </p>
      </section>

      <section>
        <h2>10. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will
          be posted on this page with an updated date. Continued use of the
          Service after changes constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          Questions about these Terms? Email us at{' '}
          <a href="mailto:support@spillthetea.app">support@spillthetea.app</a>.
        </p>
      </section>
    </LegalPage>
  );
}
