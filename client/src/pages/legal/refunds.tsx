import LegalPageLayout, { LegalSection } from "@/components/legal/LegalPageLayout";

const toc = [
  { id: "marketplace-role", title: "Marketplace Role" },
  { id: "payment-processing", title: "Payment Processing" },
  { id: "refund-policy", title: "Refund Policy" },
  { id: "chargebacks", title: "Chargebacks" },
  { id: "subscriptions", title: "Subscriptions" },
  { id: "platform-fees", title: "Platform Fees" },
  { id: "no-guarantee", title: "No Guarantee" },
  { id: "tax-vat", title: "Tax & VAT" },
];

export default function RefundsPage() {
  return (
    <LegalPageLayout title="Refund & Payments Policy" lastUpdated="2026-03-04" toc={toc}>
      <div data-testid="refunds-page">
        <LegalSection id="marketplace-role" title="Marketplace Role">
          <p>
            Fit Finder, operated by Fit Finder Ltd, functions as an online marketplace platform that connects Clients with independent Trainers. <strong>Fit Finder Ltd is not a party to any service agreement between Clients and Trainers</strong>, and we do not provide, perform, or guarantee any fitness training, coaching, or related services listed on the Platform.
          </p>
          <p>
            In our capacity as a marketplace, we facilitate the payment process between Clients and Trainers to provide a secure, convenient, and transparent transaction experience. However, the terms of service delivery, including scheduling, cancellations, and the quality of services provided, are determined solely by the agreement between the Client and the Trainer. Fit Finder Ltd does not set prices for Trainer services and has no control over the services delivered.
          </p>
          <p>
            This Refund & Payments Policy outlines how payments are processed through the Platform, the circumstances under which refunds may be available, and the respective responsibilities of Clients, Trainers, and Fit Finder Ltd regarding financial transactions. This policy should be read in conjunction with our <a href="/legal/terms">Terms & Conditions</a> and <a href="/legal/privacy">Privacy Policy</a>.
          </p>
        </LegalSection>

        <LegalSection id="payment-processing" title="Payment Processing">
          <p>
            All payments made through the Fit Finder platform are processed by <strong>Stripe</strong>, a PCI DSS Level 1 certified third-party payment processor. When you make a payment through the Platform, your payment information is transmitted directly to Stripe and is handled in accordance with Stripe's security standards and privacy policy. Fit Finder Ltd does not store your full credit card number, CVV, or other sensitive payment card details on our servers.
          </p>
          <p>
            By making a payment through the Platform, you agree to Stripe's <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> in addition to these terms. Fit Finder Ltd is not responsible for any errors, failures, or security incidents that occur within Stripe's payment processing infrastructure, although we work closely with Stripe to ensure reliable and secure payment handling.
          </p>
          <p>
            Payments are typically processed at the time of booking or as otherwise specified by the Trainer's payment terms. Funds from Client payments are held by Stripe and disbursed to Trainers according to the payout schedule configured on the Platform, which is generally on a rolling basis after a short holding period to allow for dispute resolution and quality assurance. Trainers receive their payouts minus any applicable Platform service fees and Stripe processing fees.
          </p>
          <p>
            We support major payment methods including Visa, Mastercard, American Express, and other methods as made available through Stripe. All transactions are conducted in British Pounds Sterling (GBP) unless otherwise indicated. Currency conversion fees may apply if your payment method is denominated in a different currency, and such fees are determined by your card issuer or bank.
          </p>
        </LegalSection>

        <LegalSection id="refund-policy" title="Refund Policy">
          <p>
            As a marketplace platform, Fit Finder Ltd encourages Clients and Trainers to resolve payment and service disputes directly and amicably. The primary responsibility for issuing refunds lies with the Trainer, as the provider of the service. Each Trainer may establish their own cancellation and refund policy, which should be clearly communicated to Clients before a booking is confirmed.
          </p>
          <p><strong>Client-initiated refund requests:</strong></p>
          <ul>
            <li>If you are dissatisfied with a service or believe that a Trainer has not fulfilled the agreed-upon terms, you should first contact the Trainer directly to discuss the issue and seek a resolution.</li>
            <li>If you are unable to reach a satisfactory resolution with the Trainer, you may submit a refund request to Fit Finder Ltd at support@fitfinder.co within <strong>14 days</strong> of the session or service in question. Please include your booking reference, a description of the issue, and any supporting evidence.</li>
            <li>Fit Finder Ltd will review refund requests on a case-by-case basis. We may request additional information from both the Client and the Trainer before making a determination. Our decision regarding refund requests is made at our sole discretion and is final.</li>
          </ul>
          <p><strong>Trainer-initiated refunds:</strong></p>
          <ul>
            <li>Trainers may issue full or partial refunds to Clients at their discretion through the Platform's payment system. Refunds initiated by Trainers will be processed through Stripe and credited to the Client's original payment method.</li>
            <li>If a Trainer cancels a confirmed booking, the Client will receive a full refund for that booking automatically, unless alternative arrangements are agreed upon between the Client and the Trainer.</li>
          </ul>
          <p><strong>Refund processing times:</strong></p>
          <ul>
            <li>Approved refunds will be processed within <strong>5–10 business days</strong> from the date of approval. The time it takes for the refund to appear in your account may vary depending on your bank or card issuer.</li>
            <li>Refunds will be issued to the original payment method used for the transaction. We are unable to issue refunds to a different payment method or by alternative means such as cash or bank transfer.</li>
          </ul>
        </LegalSection>

        <LegalSection id="chargebacks" title="Chargebacks">
          <p>
            A chargeback occurs when a cardholder disputes a transaction with their bank or card issuer, resulting in a reversal of the payment. We strongly encourage Clients to contact us at support@fitfinder.co or the Trainer directly before initiating a chargeback with their bank, as we may be able to resolve the issue more quickly and efficiently.
          </p>
          <p>
            If a chargeback is filed, Fit Finder Ltd will cooperate with Stripe and the relevant financial institutions to investigate the dispute. We may provide transaction records, communications, and other evidence to assist in the investigation. Trainers may be required to provide documentation supporting the delivery of services in response to a chargeback claim.
          </p>
          <p>
            <strong>Frivolous or fraudulent chargebacks:</strong> Users who abuse the chargeback process or file chargebacks in bad faith may have their accounts suspended or permanently terminated. We reserve the right to recover any losses incurred as a result of fraudulent chargebacks, including administrative fees, investigation costs, and any chargeback penalties imposed by payment processors. Repeated or unresolved chargebacks may result in legal action.
          </p>
          <p>
            Trainers should be aware that chargebacks may result in the reversal of funds already paid out. To minimise chargeback risk, Trainers are encouraged to maintain clear communication with Clients, provide detailed session records, and ensure that their cancellation and refund policies are prominently displayed on their profiles.
          </p>
        </LegalSection>

        <LegalSection id="subscriptions" title="Subscriptions">
          <p>
            Fit Finder Ltd may offer subscription-based plans or memberships for Trainers, Clients, or both, which provide access to premium features, enhanced visibility, or other benefits on the Platform. Subscription terms, pricing, and features will be clearly disclosed at the time of purchase.
          </p>
          <p>
            <strong>Billing and renewal:</strong> Subscriptions are billed on a recurring basis (monthly, quarterly, or annually, as selected) and will automatically renew at the end of each billing period unless cancelled before the renewal date. You authorise us to charge your designated payment method for all applicable subscription fees on each renewal date.
          </p>
          <p>
            <strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings on the Platform or by contacting us at support@fitfinder.co. Cancellation will take effect at the end of the current billing period, and you will continue to have access to subscription benefits until that date. We do not provide pro-rated refunds for partial billing periods unless required by applicable law.
          </p>
          <p>
            <strong>Free trials:</strong> If we offer a free trial period for any subscription, you will not be charged during the trial period. Unless you cancel before the trial period ends, your subscription will automatically convert to a paid subscription, and your payment method will be charged the applicable fee. We will notify you before the trial period ends with information about the upcoming charge.
          </p>
          <p>
            <strong>Price changes:</strong> We may change subscription prices from time to time. If we increase the price of your subscription, we will provide you with at least <strong>30 days' notice</strong> before the new price takes effect. If you do not agree with the price change, you may cancel your subscription before the new billing period begins.
          </p>
        </LegalSection>

        <LegalSection id="platform-fees" title="Platform Fees">
          <p>
            Fit Finder Ltd charges a service fee on transactions processed through the Platform to cover the costs of operating, maintaining, and improving the Platform. The service fee structure is as follows:
          </p>
          <ul>
            <li><strong>Trainer service fee:</strong> A 12.8% commission is deducted from each payment received by a Trainer through the Platform. This rate is clearly disclosed to Trainers during registration, in the Trainer dashboard, and before any transaction is processed.</li>
            <li><strong>Client service fee:</strong> A service fee may be applied to Client bookings, displayed as a separate line item at checkout before payment is confirmed. This fee contributes to the operation and improvement of the Platform.</li>
            <li><strong>Payment processing fees:</strong> Stripe charges standard payment processing fees on all transactions. These fees are typically included in the overall Platform service fee but may be itemised separately where applicable.</li>
          </ul>
          <p>
            All applicable fees will be transparently displayed before you confirm any transaction or subscription. Fit Finder Ltd reserves the right to modify its fee structure at any time, with reasonable prior notice to affected Users. Changes to fees will not apply retroactively to transactions already completed.
          </p>
        </LegalSection>

        <LegalSection id="no-guarantee" title="No Guarantee">
          <p>
            Fit Finder Ltd does not guarantee any specific results, outcomes, or benefits from the use of the Platform or from engaging the services of any Trainer listed on the Platform. Fitness results are inherently individual and depend on numerous factors beyond our control, including but not limited to the Client's physical condition, effort, consistency, nutrition, genetics, and adherence to the Trainer's recommendations.
          </p>
          <p>
            We do not guarantee that Trainers listed on the Platform will meet your expectations, that their services will be satisfactory, or that any particular fitness goals will be achieved. While we strive to maintain a high standard of quality among Trainers on the Platform, we make no warranty regarding the competence, qualifications, reliability, or performance of any individual Trainer.
          </p>
          <p>
            Fit Finder Ltd does not guarantee the availability of Trainers, the accuracy of Trainer profiles or listings, or the completeness of information provided on the Platform. The Platform is provided on an "as is" and "as available" basis, and your use of the Platform and engagement with Trainers is at your own risk. Please refer to the Disclaimers and Limitation of Liability sections in our <a href="/legal/terms">Terms & Conditions</a> for further details.
          </p>
        </LegalSection>

        <LegalSection id="tax-vat" title="Tax & VAT">
          <p>
            <strong>Trainer tax obligations:</strong> Trainers are independent contractors and are solely responsible for determining, collecting, reporting, and paying all applicable taxes, including but not limited to income tax, National Insurance contributions, Value Added Tax (VAT), and any other taxes or duties imposed by relevant tax authorities in connection with the services they provide through the Platform. Fit Finder Ltd does not withhold, collect, or remit taxes on behalf of Trainers.
          </p>
          <p>
            <strong>VAT on Platform fees:</strong> Fit Finder Ltd may be required to charge VAT on its service fees in accordance with UK tax law. Where applicable, VAT will be clearly itemised on invoices and receipts. If you are a VAT-registered business, you may be able to reclaim VAT on Platform fees in accordance with HMRC guidelines. Fit Finder Ltd will provide VAT invoices upon request.
          </p>
          <p>
            <strong>Client tax obligations:</strong> Clients are generally not responsible for VAT on training services purchased through the Platform, as fitness training services may be exempt or zero-rated depending on the nature of the service and the VAT status of the Trainer. However, Clients should be aware that certain services may attract VAT, and the final price displayed at checkout will include any applicable VAT.
          </p>
          <p>
            <strong>Tax reporting:</strong> Fit Finder Ltd may be required by law to report certain payment information to HMRC or other tax authorities. We may issue annual tax summaries to Trainers detailing the total payments received through the Platform during the tax year. Trainers are responsible for maintaining their own complete and accurate financial records for tax purposes.
          </p>
          <p>
            Fit Finder Ltd does not provide tax advice. We strongly recommend that all Users consult with a qualified tax professional or accountant to understand their specific tax obligations in relation to income earned or payments made through the Platform.
          </p>
        </LegalSection>
      </div>
    </LegalPageLayout>
  );
}