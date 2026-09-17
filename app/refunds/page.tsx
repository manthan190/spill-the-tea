import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = {
  title: 'Refund Policy — Spill The Tea',
  description: 'Digital hint purchases are instant and non-refundable. Contact support@spillthetea.app for help.',
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" lastUpdated="September 17, 2026">
      <section>
        <h2>1. Digital Goods</h2>
        <p>
          All purchases on Spill The Tea are digital goods delivered instantly
          at the point of payment confirmation. These include:
        </p>
        <ul>
          <li><strong>Express Tea (Priority Pin)</strong> — ₹9: Pins your message at the top of the recipient's inbox with a golden badge.</li>
          <li><strong>Device &amp; Browser Hint</strong> — ₹19: Reveals the sender's device type and browser.</li>
          <li><strong>City &amp; Network Location Hint</strong> — ₹35: Reveals the sender's city and network.</li>
          <li><strong>Complete Sender Hints Bundle</strong> — ₹49: Unlocks all hints plus the IG first letter.</li>
          <li><strong>Voice Tea Unlock</strong> — ₹29: Unlocks pitch-shifted voice note playback.</li>
        </ul>
      </section>

      <section>
        <h2>2. Non-Refundable Purchases</h2>
        <p>
          Because these digital goods are delivered and consumed instantly upon
          payment confirmation, all purchases are final and non-refundable.
          Once a hint is unlocked or a message is pinned, the digital good has
          been consumed and cannot be returned.
        </p>
      </section>

      <section>
        <h2>3. Failed Payments</h2>
        <p>
          If a payment is deducted from your account but the feature was not
          unlocked (due to a network error or technical failure), the amount
          will be automatically refunded to your original payment method within
          5-7 business days. No action is required from you. If the refund
          does not arrive within 7 days, contact us at
          support@spillthetea.app with your payment ID.
        </p>
      </section>

      <section>
        <h2>4. Double Charges</h2>
        <p>
          If you are charged twice for the same feature (e.g. due to a page
          refresh during payment), the duplicate charge will be refunded
          automatically. Our webhook system processes payments idempotently,
          so duplicate webhook deliveries will never result in a double
          unlock. If you notice a double charge that has not been refunded
          within 5 business days, contact support@spillthetea.app.
        </p>
      </section>

      <section>
        <h2>5. Statutory Rights</h2>
        <p>
          Nothing in this policy limits any statutory consumer rights you may
          have under applicable law. If you believe a charge was made in error
          or in violation of consumer protection law, contact us and we will
          review your case.
        </p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>
          For refund inquiries or payment issues, email{' '}
          <a href="mailto:support@spillthetea.app">support@spillthetea.app</a>{' '}
          with your payment ID (found in your inbox payment history) and a
          description of the issue. We aim to respond within 48 hours.
        </p>
      </section>
    </LegalPage>
  );
}
