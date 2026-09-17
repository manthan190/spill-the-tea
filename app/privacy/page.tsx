import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = {
  title: 'Privacy Policy — Spill The Tea',
  description: 'What data Spill The Tea collects: coarse location, device metadata, and how Razorpay and Supabase process it.',
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="September 17, 2026">
      <section>
        <h2>1. Our Privacy Commitment</h2>
        <p>
          Spill The Tea is designed around anonymity. We do not require
          senders to create an account, provide an email, or reveal their
          identity. This policy explains the limited data we do collect and
          how it is used.
        </p>
      </section>

      <section>
        <h2>2. Data We Collect</h2>
        <h3>From Senders (Anonymous)</h3>
        <ul>
          <li>
            <strong>Coarse location:</strong> City, region, and country derived
            from edge geolocation. We do not collect or store precise GPS
            coordinates.
          </li>
          <li>
            <strong>Device &amp; browser metadata:</strong> Whether the sender
            is on mobile or desktop, and which browser they use. This is stored
            in a locked hints table and only revealed to the recipient if they
            pay to unlock it.
          </li>
          <li>
            <strong>IP address:</strong> Retained for a maximum of 30 days for
            rate limiting and abuse prevention, then automatically purged.
          </li>
          <li>
            <strong>Optional IG first letter:</strong> If the sender
            voluntarily provides the first letter of their Instagram handle.
          </li>
          <li>
            <strong>Voice recordings:</strong> If the sender records a Voice
            Tea, the audio is stored as base64 data linked to the message.
          </li>
        </ul>
        <h3>From Account Holders (Recipients)</h3>
        <ul>
          <li>
            <strong>Username &amp; display name:</strong> The handle you choose
            (e.g. @yourname) and an optional display name.
          </li>
          <li>
            <strong>Auth data:</strong> A random email is generated for your
            anonymous account. No real email is required.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Data</h2>
        <ul>
          <li>To deliver anonymous messages to the intended recipient.</li>
          <li>To enforce rate limits (max 3 messages per 10 minutes per IP).</li>
          <li>To allow recipients to block specific sender IP addresses.</li>
          <li>To process payments for premium features.</li>
          <li>To detect and flag toxic or abusive content.</li>
        </ul>
        <p>
          We do not sell your data to third parties. We do not use your data
          for targeted advertising. We do not build user profiles for
          analytics.
        </p>
      </section>

      <section>
        <h2>4. Third-Party Data Processors</h2>
        <h3>Razorpay</h3>
        <p>
          When you purchase a premium feature (Express Tea, hint unlocks,
          voice unlock), your payment is processed by Razorpay. Razorpay
          collects and processes your payment information (card details, UPI
          ID, etc.) according to their own privacy policy. We receive only the
          payment status and order ID — never your full payment credentials.
          Razorpay's privacy policy is available at{' '}
          <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer">
            razorpay.com/privacy
          </a>
          .
        </p>
        <h3>Supabase</h3>
        <p>
          Our database and authentication are powered by Supabase. All data —
          profiles, messages, hints, voice notes, and payment records — is
          stored in Supabase's PostgreSQL database. Supabase acts as a data
          processor on our behalf. Their privacy policy is available at{' '}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
            supabase.com/privacy
          </a>
          .
        </p>
      </section>

      <section>
        <h2>5. Data Retention</h2>
        <ul>
          <li><strong>IP addresses:</strong> 30 days, then automatically purged.</li>
          <li><strong>Messages &amp; hints:</strong> Until the recipient deletes them or deletes their account.</li>
          <li><strong>Voice notes:</strong> Until the recipient deletes the message.</li>
          <li><strong>Payment records:</strong> Retained for accounting compliance.</li>
          <li><strong>Rate limit logs:</strong> 1 hour, then automatically purged.</li>
        </ul>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>
          You may request deletion of your account and all associated data at
          any time by emailing support@spillthetea.app. Recipients can delete
          individual messages directly in the inbox. Senders cannot recall
          messages once delivered.
        </p>
      </section>

      <section>
        <h2>7. Data Security</h2>
        <p>
          All data is encrypted in transit (TLS) and at rest (Supabase
          infrastructure). Row Level Security policies ensure that recipients
          can only access their own messages. Sender hints are stored in a
          locked table that cannot be read without payment. Payment
          verification uses HMAC-SHA256 signature validation.
        </p>
      </section>

      <section>
        <h2>8. Children's Privacy</h2>
        <p>
          The Service is not directed to children under 13. We do not
          knowingly collect data from children under 13. If you believe a
          child has provided data, contact us and we will delete it
          immediately.
        </p>
      </section>

      <section>
        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material
          changes will be posted here with an updated date.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Privacy questions? Email{' '}
          <a href="mailto:support@spillthetea.app">support@spillthetea.app</a>.
        </p>
      </section>
    </LegalPage>
  );
}
