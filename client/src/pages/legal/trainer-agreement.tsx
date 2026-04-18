import LegalPageLayout, { LegalSection } from "@/components/legal/LegalPageLayout";

const toc = [
  { id: "introduction", title: "Introduction" },
  { id: "independent-contractor-status", title: "Independent Contractor Status" },
  { id: "qualifications", title: "Qualifications, Certifications & Insurance" },
  { id: "safety-obligations", title: "Safety Obligations & Duty of Care" },
  { id: "service-delivery", title: "Service Delivery Responsibility" },
  { id: "prohibited-misrepresentation", title: "Prohibited Misrepresentation" },
  { id: "payment-payout", title: "Payment & Payout Terms" },
  { id: "platform-fee", title: "Platform Fee" },
  { id: "content-license", title: "Content License" },
  { id: "termination", title: "Termination" },
  { id: "indemnification", title: "Indemnification of Fit Finder" },
  { id: "dispute-handling", title: "Dispute Handling" },
  { id: "governing-law", title: "Governing Law" },
  { id: "contact", title: "Contact" },
];

export default function TrainerAgreement() {
  return (
    <LegalPageLayout title="Trainer Agreement" lastUpdated="2026-03-04" toc={toc}>
      <LegalSection id="introduction" title="Introduction">
        <p data-testid="text-trainer-intro">
          This Trainer Agreement ("Agreement") is entered into between you ("Trainer", "you", or "your") and Fit Finder ("Platform", "we", "us", or "our"). By registering as a Trainer on Fit Finder, you acknowledge that you have read, understood, and agree to be bound by the terms and conditions set out in this Agreement. This Agreement governs the relationship between you and Fit Finder in connection with the services you offer through the Platform.
        </p>
        <p>
          Fit Finder is a technology platform that connects independent fitness professionals with individuals seeking personal training and fitness-related services. Fit Finder does not itself provide fitness training, exercise programming, nutritional advice, or any other health or wellness services. Instead, we facilitate the introduction of Trainers and Clients and provide tools to manage bookings, communications, and payments.
        </p>
        <p>
          This Agreement constitutes an independent contractor agreement. It does not create an employment relationship, partnership, joint venture, or agency arrangement between you and Fit Finder. You are solely responsible for the services you provide, including their quality, safety, and legality.
        </p>
      </LegalSection>

      <LegalSection id="independent-contractor-status" title="Independent Contractor Status">
        <p data-testid="text-contractor-status">
          You acknowledge and agree that you are an independent contractor and not an employee, worker, agent, or representative of Fit Finder. Nothing in this Agreement shall be construed to create an employment relationship, partnership, joint venture, or agency arrangement between you and Fit Finder. You are free to determine the manner and means by which you perform your services, subject to compliance with applicable law and the terms of this Agreement.
        </p>
        <p>
          As an independent contractor, you are solely responsible for:
        </p>
        <ul>
          <li>Determining your own schedule, rates, and availability.</li>
          <li>Paying all applicable taxes, including income tax, National Insurance contributions, and VAT where applicable.</li>
          <li>Maintaining your own professional indemnity and public liability insurance.</li>
          <li>Complying with all laws, regulations, and professional standards applicable to your practice.</li>
          <li>Providing your own equipment, unless otherwise agreed with a Client.</li>
        </ul>
        <p>
          Fit Finder does not control, direct, or supervise the manner in which you deliver your services. We do not set your working hours, dictate your training methodology, or impose employment-like conditions. You are free to work with other platforms, gyms, or clients outside of Fit Finder at any time.
        </p>
      </LegalSection>

      <LegalSection id="qualifications" title="Qualifications, Certifications & Insurance">
        <p data-testid="text-qualifications">
          By registering as a Trainer on Fit Finder, you represent and warrant that you hold all qualifications, certifications, and accreditations necessary to lawfully provide the fitness training and related services you offer through the Platform. These may include, but are not limited to, Level 2 or Level 3 Personal Training qualifications recognised by CIMSPA (Chartered Institute for the Management of Sport and Physical Activity), first aid certifications, and any specialist qualifications relevant to the services you advertise.
        </p>
        <p>
          You further represent and warrant that you maintain adequate professional indemnity insurance and public liability insurance throughout the duration of your use of the Platform. You agree to provide Fit Finder with copies of your certifications and insurance policies upon request and to keep all such documentation current and up to date.
        </p>
        <p>
          Fit Finder reserves the right to verify your qualifications and insurance coverage at any time. If we discover that any representation you have made regarding your qualifications or insurance is false, misleading, or outdated, we may immediately suspend or terminate your account without notice.
        </p>
      </LegalSection>

      <LegalSection id="safety-obligations" title="Safety Obligations & Duty of Care">
        <p data-testid="text-safety-obligations">
          You owe a duty of care to every Client you work with through the Platform. You must conduct all training sessions in a safe, professional, and responsible manner, taking into account each Client's individual fitness level, health conditions, limitations, and goals.
        </p>
        <p>
          Your safety obligations include, but are not limited to:
        </p>
        <ul>
          <li>Conducting an appropriate health screening or pre-exercise questionnaire (e.g., PAR-Q) before beginning work with any new Client.</li>
          <li>Designing and delivering exercise programmes that are appropriate for the Client's fitness level and any disclosed health conditions.</li>
          <li>Providing clear instructions on proper form and technique to minimise the risk of injury.</li>
          <li>Ensuring that the training environment is safe and free from hazards before commencing any session.</li>
          <li>Maintaining current first aid certification and being prepared to respond to medical emergencies.</li>
          <li>Referring Clients to appropriate medical professionals when their needs fall outside your scope of practice.</li>
        </ul>
        <p>
          Failure to uphold these safety obligations may result in the suspension or termination of your account, in addition to any legal liability you may incur.
        </p>
      </LegalSection>

      <LegalSection id="service-delivery" title="Service Delivery Responsibility">
        <p data-testid="text-service-delivery">
          You are solely responsible for the quality, safety, and delivery of all services you provide to Clients through the Platform. This includes, but is not limited to, in-person training sessions, online coaching, programme design, nutritional guidance (where qualified), and any other services you offer.
        </p>
        <p>
          You agree to honour all confirmed bookings and to provide services in a timely, professional, and competent manner. If you are unable to attend a confirmed session, you must notify the Client as far in advance as reasonably possible and arrange a suitable alternative or refund.
        </p>
        <p>
          Fit Finder is not responsible for the services you deliver, the results achieved by your Clients, or any injury, loss, or damage arising from your training sessions or advice. Clients engage you directly through the Platform, and the contractual relationship for services is between you and the Client.
        </p>
      </LegalSection>

      <LegalSection id="prohibited-misrepresentation" title="Prohibited Misrepresentation">
        <p data-testid="text-misrepresentation">
          You must not make any false, misleading, or deceptive representations on the Platform or in any communications with Clients. This includes, but is not limited to:
        </p>
        <ul>
          <li>Falsifying or exaggerating your qualifications, certifications, experience, or expertise.</li>
          <li>Using another person's credentials, testimonials, or photographs as your own.</li>
          <li>Making guarantees about specific fitness results, weight loss outcomes, or health improvements that are unrealistic or not supported by evidence.</li>
          <li>Claiming to hold medical, physiotherapy, or other specialist qualifications that you do not possess.</li>
          <li>Misrepresenting your relationship with Fit Finder, including suggesting that you are an employee, partner, or agent of the Platform.</li>
        </ul>
        <p>
          Any misrepresentation may result in the immediate suspension or permanent removal of your account from the Platform, without prejudice to any other remedies available to Fit Finder or affected parties.
        </p>
      </LegalSection>

      <LegalSection id="payment-payout" title="Payment & Payout Terms">
        <p data-testid="text-payment-payout">
          Payments for services booked through the Platform are processed via our third-party payment provider, Stripe. Clients pay for sessions through the Platform, and funds are held until the session has been completed and confirmed.
        </p>
        <p>
          Payouts to Trainers are made on a regular schedule as determined by the Platform's payout policy. You are responsible for setting up and maintaining a valid Stripe Connect account to receive payouts. Fit Finder is not responsible for any delays, errors, or issues arising from Stripe's processing of payments or payouts.
        </p>
        <p>
          <strong>Note:</strong> Specific payout schedules, minimum payout thresholds, and currency details will be confirmed during onboarding and may be updated from time to time. You will be notified of any material changes to payment terms.
        </p>
        <p>
          You are solely responsible for reporting and paying all taxes due on income earned through the Platform, including but not limited to income tax, National Insurance, and VAT where applicable.
        </p>
      </LegalSection>

      <LegalSection id="platform-fee" title="Platform Fee">
        <p data-testid="text-platform-fee">
          Fit Finder charges a platform fee of <strong>12.8%</strong> on each transaction processed through the Platform. This fee covers the cost of maintaining and operating the Platform, including payment processing, customer support, marketing, and technology infrastructure.
        </p>
        <p>
          We will provide reasonable notice of any changes to our fee structure. The current fee schedule is available in your Trainer dashboard.
        </p>
        <p>
          The platform fee is deducted automatically from each payment before the remaining balance is paid out to you. By continuing to use the Platform, you agree to the applicable platform fee of 12.8%.
        </p>
      </LegalSection>

      <LegalSection id="content-license" title="Content License">
        <p data-testid="text-content-license">
          By uploading content to the Platform — including but not limited to profile photographs, biographical information, training descriptions, certifications, testimonials, videos, and any other materials — you grant Fit Finder a non-exclusive, worldwide, royalty-free, sublicensable licence to use, reproduce, modify, adapt, publish, display, and distribute such content for the purposes of operating, promoting, and improving the Platform.
        </p>
        <p>
          This licence continues for as long as the content remains on the Platform and for a reasonable period thereafter to allow for the removal of cached or archived copies. You retain ownership of your content and may remove it from the Platform at any time, subject to any ongoing obligations under this Agreement.
        </p>
        <p>
          You represent and warrant that you own or have the necessary rights, licences, and permissions to grant the above licence, and that your content does not infringe the intellectual property rights, privacy rights, or any other rights of any third party.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="Termination">
        <p data-testid="text-termination">
          Either party may terminate this Agreement at any time, for any reason, by providing written notice to the other party. If you wish to terminate, you may do so by deactivating your Trainer account through the Platform settings or by contacting our support team.
        </p>
        <p>
          Fit Finder reserves the right to suspend or terminate your account immediately, without prior notice, if:
        </p>
        <ul>
          <li>You breach any term of this Agreement or any other applicable policy.</li>
          <li>We receive credible complaints about the safety or quality of your services.</li>
          <li>You engage in fraudulent, abusive, or unlawful conduct.</li>
          <li>Your qualifications or insurance coverage lapse or are found to be invalid.</li>
          <li>You fail to comply with applicable laws or regulations.</li>
        </ul>
        <p>
          Upon termination, any outstanding payouts for completed sessions will be processed in accordance with the payment terms. You remain liable for any obligations incurred prior to termination, including any claims or disputes arising from services you provided through the Platform.
        </p>
      </LegalSection>

      <LegalSection id="indemnification" title="Indemnification of Fit Finder">
        <p data-testid="text-indemnification">
          You agree to indemnify, defend, and hold harmless Fit Finder, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or in connection with:
        </p>
        <ul>
          <li>Your breach of this Agreement or any applicable policy.</li>
          <li>Your provision of fitness training or related services to any Client.</li>
          <li>Any injury, illness, death, or damage suffered by a Client or any third party in connection with your services.</li>
          <li>Any false, misleading, or deceptive representation made by you on the Platform or to any Client.</li>
          <li>Your violation of any applicable law, regulation, or professional standard.</li>
          <li>Any intellectual property infringement or other rights violation arising from content you upload to the Platform.</li>
        </ul>
        <p>
          This indemnification obligation survives the termination of this Agreement and your use of the Platform.
        </p>
      </LegalSection>

      <LegalSection id="dispute-handling" title="Dispute Handling">
        <p data-testid="text-dispute-handling">
          In the event of a dispute between you and a Client, or between you and Fit Finder, the parties agree to first attempt to resolve the matter through good-faith negotiation and, where appropriate, through the Platform's internal dispute resolution process.
        </p>
        <p>
          If a dispute cannot be resolved through negotiation, either party may refer the matter to mediation administered by a mutually agreed mediator. If mediation does not resolve the dispute, either party retains the right to pursue legal remedies in accordance with the governing law provisions of this Agreement.
        </p>
        <p>
          Fit Finder may, at its sole discretion, intervene in disputes between Trainers and Clients for the purpose of protecting the safety and integrity of the Platform. This may include, but is not limited to, issuing refunds, suspending accounts, or taking other remedial action as we deem appropriate.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="Governing Law">
        <p data-testid="text-governing-law">
          This Agreement shall be governed by and construed in accordance with the laws of England and Wales. Any dispute arising out of or in connection with this Agreement, including any question regarding its existence, validity, or termination, shall be subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>
        <p>
          If any provision of this Agreement is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p data-testid="text-contact">
          If you have any questions about this Agreement or require further information, please contact us at:
        </p>
        <ul>
          <li><strong>Email:</strong> support@fitfinder.co</li>
          <li><strong>Support Page:</strong> <a href="/trust-safety/contact-support">Contact Support</a></li>
        </ul>
        <p>
          We aim to respond to all enquiries within two business days.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
