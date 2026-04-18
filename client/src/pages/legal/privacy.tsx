import LegalPageLayout, { LegalSection } from "@/components/legal/LegalPageLayout";

const toc = [
  { id: "data-controller", title: "Data Controller" },
  { id: "data-collected", title: "What Data We Collect" },
  { id: "how-used", title: "How We Use Your Data" },
  { id: "legal-bases", title: "Legal Bases for Processing" },
  { id: "sharing", title: "Data Sharing" },
  { id: "data-retention", title: "Data Retention" },
  { id: "security", title: "Security" },
  { id: "user-rights", title: "Your Rights" },
  { id: "international-transfers", title: "International Transfers" },
  { id: "cookies", title: "Cookies" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="2026-03-04" toc={toc}>
      <div data-testid="privacy-page">
        <LegalSection id="data-controller" title="Data Controller">
          <p>
            For the purposes of applicable data protection legislation, including the UK General Data Protection Regulation (UK GDPR), the EU General Data Protection Regulation (EU GDPR), and the Data Protection Act 2018, the data controller responsible for your personal data is Fit Finder Ltd, a company registered in England & Wales with its registered office at [Company Address].
          </p>
          <p>
            If you have any questions or concerns about how we handle your personal data, or if you wish to exercise any of your data protection rights, please contact our data protection team at support@fitfinder.co. We take your privacy seriously and are committed to ensuring that your personal data is processed lawfully, fairly, and transparently.
          </p>
        </LegalSection>

        <LegalSection id="data-collected" title="What Data We Collect">
          <p>We collect and process the following categories of personal data when you use the Fit Finder platform:</p>
          <p><strong>Information you provide directly:</strong></p>
          <ul>
            <li><strong>Account information:</strong> Your name, email address, phone number, date of birth, password, and profile photograph when you register for an account.</li>
            <li><strong>Profile information:</strong> Fitness goals, health conditions, dietary preferences, training preferences, location, and biographical details you choose to share on your profile.</li>
            <li><strong>Trainer-specific information:</strong> Professional qualifications, certifications, insurance details, areas of specialisation, availability, pricing, and business information.</li>
            <li><strong>Communications:</strong> Messages exchanged with other Users through the Platform, feedback, reviews, ratings, and any correspondence with our support team.</li>
            <li><strong>Payment information:</strong> Billing address, payment card details (processed and stored securely by our payment processor, Stripe), and transaction history.</li>
            <li><strong>Identity verification data:</strong> Government-issued identification documents, proof of qualifications, and other documents submitted for verification purposes.</li>
          </ul>
          <p><strong>Information collected automatically:</strong></p>
          <ul>
            <li><strong>Device and technical data:</strong> IP address, browser type and version, operating system, device identifiers, screen resolution, and language preferences.</li>
            <li><strong>Usage data:</strong> Pages visited, features used, search queries, click patterns, session duration, referral sources, and interactions with the Platform.</li>
            <li><strong>Location data:</strong> Approximate geographic location derived from your IP address, or precise location data if you grant permission through your device settings.</li>
            <li><strong>Cookies and similar technologies:</strong> Data collected through cookies, web beacons, pixels, and similar tracking technologies as described in the Cookies section below.</li>
          </ul>
          <p><strong>Information from third parties:</strong></p>
          <ul>
            <li>Social media login data if you choose to register or sign in using a third-party social media account.</li>
            <li>Payment processing data from Stripe and other payment service providers.</li>
            <li>Background check or verification results from third-party verification services, where applicable.</li>
          </ul>
        </LegalSection>

        <LegalSection id="how-used" title="How We Use Your Data">
          <p>We use the personal data we collect for the following purposes:</p>
          <ul>
            <li><strong>Providing and operating the Platform:</strong> To create and manage your account, facilitate connections between Clients and Trainers, process bookings and payments, and deliver the core functionality of the Platform.</li>
            <li><strong>Personalisation:</strong> To personalise your experience, recommend Trainers, tailor search results, and display relevant content based on your preferences, location, and usage patterns.</li>
            <li><strong>Communications:</strong> To send you service-related notifications, booking confirmations, payment receipts, account updates, and respond to your enquiries and support requests.</li>
            <li><strong>Marketing:</strong> To send you promotional materials, newsletters, and information about new features or services, where you have opted in to receive such communications or where we have a legitimate interest in doing so. You may opt out of marketing communications at any time.</li>
            <li><strong>Safety and security:</strong> To detect, investigate, and prevent fraud, abuse, security incidents, and other harmful or unauthorised activities on the Platform.</li>
            <li><strong>Legal compliance:</strong> To comply with applicable laws, regulations, legal processes, and government requests, and to enforce our Terms & Conditions.</li>
            <li><strong>Analytics and improvement:</strong> To analyse usage patterns, conduct research, monitor performance metrics, and improve the Platform's features, functionality, and user experience.</li>
            <li><strong>Dispute resolution:</strong> To facilitate and manage disputes between Users, process complaints, and administer claims or chargebacks.</li>
          </ul>
        </LegalSection>

        <LegalSection id="legal-bases" title="Legal Bases for Processing">
          <p>Under UK and EU data protection law, we must have a valid legal basis for processing your personal data. We rely on the following legal bases, depending on the nature and purpose of the processing:</p>
          <ul>
            <li><strong>Contract performance (Article 6(1)(b) UK/EU GDPR):</strong> Processing is necessary for the performance of our contract with you, including creating your account, facilitating bookings, processing payments, and providing the core Platform services.</li>
            <li><strong>Legitimate interests (Article 6(1)(f) UK/EU GDPR):</strong> Processing is necessary for our legitimate interests or those of a third party, provided such interests are not overridden by your fundamental rights and freedoms. Our legitimate interests include operating and improving the Platform, preventing fraud and abuse, conducting analytics, and direct marketing to existing customers.</li>
            <li><strong>Consent (Article 6(1)(a) UK/EU GDPR):</strong> Where we rely on your consent as the legal basis, you have the right to withdraw your consent at any time. This includes consent for marketing communications, optional cookies, and the processing of special category data such as health information.</li>
            <li><strong>Legal obligation (Article 6(1)(c) UK/EU GDPR):</strong> Processing is necessary to comply with a legal obligation to which we are subject, such as tax reporting, responding to lawful requests from authorities, and maintaining records required by law.</li>
          </ul>
          <p>
            Where we process special category data (such as health information you voluntarily provide in your profile), we do so on the basis of your explicit consent under Article 9(2)(a) UK/EU GDPR. You may withdraw this consent at any time by updating your profile or contacting us.
          </p>
        </LegalSection>

        <LegalSection id="sharing" title="Data Sharing">
          <p>We may share your personal data with the following categories of recipients:</p>
          <ul>
            <li><strong>Other Users:</strong> Your profile information, reviews, and ratings are shared with other Users as part of the Platform's core functionality. Clients can view Trainer profiles, and Trainers can view relevant Client information necessary to provide their services.</li>
            <li><strong>Payment processors:</strong> We share payment-related data with Stripe and other payment service providers to process transactions securely. These providers are bound by their own privacy policies and data protection obligations.</li>
            <li><strong>Service providers:</strong> We engage trusted third-party service providers to assist with hosting, analytics, email delivery, customer support, and other operational functions. These providers process data solely on our behalf and in accordance with our instructions and applicable data protection agreements.</li>
            <li><strong>Legal and regulatory authorities:</strong> We may disclose your data to law enforcement agencies, regulatory bodies, courts, or other governmental authorities where required by law, legal process, or to protect the rights, property, or safety of Fit Finder Ltd, our Users, or the public.</li>
            <li><strong>Business transfers:</strong> In the event of a merger, acquisition, reorganisation, sale of assets, or bankruptcy, your personal data may be transferred to the acquiring entity, subject to applicable data protection obligations.</li>
            <li><strong>Professional advisers:</strong> We may share data with our lawyers, accountants, auditors, and insurers as necessary for them to provide their professional services to us.</li>
          </ul>
          <p>
            We do not sell your personal data to third parties. We do not share your personal data with third parties for their own direct marketing purposes without your explicit consent.
          </p>
        </LegalSection>

        <LegalSection id="data-retention" title="Data Retention">
          <p>
            We retain your personal data only for as long as is necessary to fulfil the purposes for which it was collected, as described in this Privacy Policy, unless a longer retention period is required or permitted by law. The retention period may vary depending on the context and the type of data:
          </p>
          <ul>
            <li><strong>Account data:</strong> We retain your account information for as long as your account remains active. If you request deletion of your account, we will delete or anonymise your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.</li>
            <li><strong>Transaction data:</strong> We retain payment and transaction records for a minimum of six (6) years from the date of the transaction, as required for tax, accounting, and legal compliance purposes.</li>
            <li><strong>Communications:</strong> Messages and correspondence are retained for the duration of your account and for a reasonable period thereafter in case of disputes or legal claims.</li>
            <li><strong>Usage and analytics data:</strong> Aggregated and anonymised usage data may be retained indefinitely for analytics, research, and Platform improvement purposes.</li>
            <li><strong>Legal claims:</strong> Where we reasonably believe that data may be relevant to a legal claim, we may retain it for the applicable statute of limitations period (typically six years in England & Wales).</li>
          </ul>
        </LegalSection>

        <LegalSection id="security" title="Security">
          <p>
            We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These measures include, but are not limited to:
          </p>
          <ul>
            <li>Encryption of data in transit using TLS/SSL protocols and encryption of sensitive data at rest.</li>
            <li>Regular security assessments, vulnerability scanning, and penetration testing of our systems and infrastructure.</li>
            <li>Access controls and authentication mechanisms to restrict access to personal data to authorised personnel only, on a need-to-know basis.</li>
            <li>Secure payment processing through PCI DSS-compliant payment processors (Stripe).</li>
            <li>Employee training on data protection, information security, and privacy best practices.</li>
            <li>Incident response procedures to detect, report, and investigate data breaches promptly.</li>
          </ul>
          <p>
            While we take all reasonable steps to protect your personal data, no method of transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security, and you acknowledge that you provide your personal data at your own risk. In the event of a data breach that is likely to result in a high risk to your rights and freedoms, we will notify you and the relevant supervisory authority in accordance with applicable law.
          </p>
        </LegalSection>

        <LegalSection id="user-rights" title="Your Rights">
          <p>
            Under UK and EU data protection law, you have the following rights in relation to your personal data. These rights are not absolute and may be subject to certain conditions and exceptions:
          </p>
          <ul>
            <li><strong>Right of access:</strong> You have the right to request a copy of the personal data we hold about you, along with information about how it is processed (a "subject access request").</li>
            <li><strong>Right to rectification:</strong> You have the right to request that we correct any inaccurate or incomplete personal data we hold about you.</li>
            <li><strong>Right to erasure ("right to be forgotten"):</strong> You have the right to request the deletion of your personal data in certain circumstances, such as when the data is no longer necessary for the purposes for which it was collected.</li>
            <li><strong>Right to restriction of processing:</strong> You have the right to request that we restrict the processing of your personal data in certain circumstances, such as when you contest the accuracy of the data.</li>
            <li><strong>Right to data portability:</strong> You have the right to receive your personal data in a structured, commonly used, and machine-readable format, and to transmit it to another controller where technically feasible.</li>
            <li><strong>Right to object:</strong> You have the right to object to the processing of your personal data where we rely on legitimate interests as the legal basis, including processing for direct marketing purposes.</li>
            <li><strong>Rights related to automated decision-making:</strong> You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you.</li>
            <li><strong>Right to withdraw consent:</strong> Where processing is based on your consent, you have the right to withdraw that consent at any time, without affecting the lawfulness of processing carried out before the withdrawal.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at support@fitfinder.co. We will respond to your request within one (1) month, or within two (2) months if the request is complex or we receive a large number of requests. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) in the UK or the relevant supervisory authority in your jurisdiction if you believe that your data protection rights have been violated.
          </p>
        </LegalSection>

        <LegalSection id="international-transfers" title="International Transfers">
          <p>
            Your personal data may be transferred to, stored in, and processed in countries outside the United Kingdom and the European Economic Area (EEA), including countries that may not provide the same level of data protection as the UK or EEA. Such transfers may occur, for example, when our service providers or infrastructure are located in other jurisdictions.
          </p>
          <p>
            Where we transfer personal data outside the UK or EEA, we ensure that appropriate safeguards are in place to protect your data in accordance with applicable data protection law. These safeguards may include:
          </p>
          <ul>
            <li>Transfers to countries that have been deemed to provide an adequate level of data protection by the UK Secretary of State or the European Commission.</li>
            <li>Use of standard contractual clauses (SCCs) approved by the UK Information Commissioner's Office or the European Commission.</li>
            <li>Where applicable, reliance on the recipient's binding corporate rules or other approved certification mechanisms.</li>
          </ul>
          <p>
            You may obtain a copy of the safeguards we use for international transfers by contacting us at support@fitfinder.co.
          </p>
        </LegalSection>

        <LegalSection id="cookies" title="Cookies">
          <p>
            We use cookies and similar tracking technologies (such as web beacons, pixels, and local storage) to collect and store information when you visit or interact with the Platform. Cookies are small text files placed on your device that help us provide, personalise, and improve the Platform.
          </p>
          <p>We use the following types of cookies:</p>
          <ul>
            <li><strong>Strictly necessary cookies:</strong> These cookies are essential for the Platform to function properly and cannot be disabled. They enable core functionality such as user authentication, session management, security features, and remembering your cookie consent preferences.</li>
            <li><strong>Functional cookies:</strong> These cookies allow the Platform to remember choices you make (such as language, region, or display preferences) and provide enhanced, more personalised features.</li>
            <li><strong>Analytics and performance cookies:</strong> These cookies collect information about how you use the Platform, such as which pages you visit and how long you spend on each page. We use this data to analyse usage patterns, identify issues, and improve the Platform's performance and user experience.</li>
            <li><strong>Marketing and advertising cookies:</strong> These cookies are used to track your browsing activity across websites and deliver targeted advertisements that are relevant to your interests. We only use marketing cookies with your consent.</li>
          </ul>
          <p>
            You can manage your cookie preferences through your browser settings or through the cookie consent banner displayed when you first visit the Platform. Please note that disabling certain cookies may affect the functionality and performance of the Platform. For more information about cookies and how to manage them, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or the processing of your personal data, please contact us:
          </p>
          <ul>
            <li><strong>Company:</strong> Fit Finder Ltd</li>
            <li><strong>Address:</strong> [Company Address]</li>
            <li><strong>Email:</strong> support@fitfinder.co</li>
            <li><strong>Supervisory Authority:</strong> Information Commissioner's Office (ICO), Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF, United Kingdom — <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
          </ul>
          <p>
            We are committed to resolving any complaints about our collection or use of your personal data. If you have a complaint, please contact us first so that we can attempt to resolve the issue. If you are not satisfied with our response, you have the right to lodge a complaint with the ICO or the relevant data protection authority in your jurisdiction.
          </p>
        </LegalSection>
      </div>
    </LegalPageLayout>
  );
}