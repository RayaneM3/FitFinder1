import LegalPageLayout, { LegalSection } from "@/components/legal/LegalPageLayout";

const toc = [
  { id: "our-values", title: "Our Values" },
  { id: "expected-conduct", title: "Expected Conduct" },
  { id: "prohibited-conduct", title: "Prohibited Conduct" },
  { id: "evidence-based-guidance", title: "Evidence-Based Guidance" },
  { id: "reporting-moderation", title: "Reporting & Moderation" },
  { id: "consequences", title: "Consequences of Violations" },
  { id: "contact", title: "Contact" },
];

export default function CommunityGuidelines() {
  return (
    <LegalPageLayout title="Community Guidelines" lastUpdated="2026-03-04" toc={toc}>
      <LegalSection id="our-values" title="Our Values">
        <p data-testid="text-values-intro">
          Fit Finder is built on the belief that everyone deserves access to safe, professional, and supportive fitness guidance. Our community is the foundation of our platform, and we are committed to fostering an environment where Trainers and Clients can connect, grow, and thrive together. These Community Guidelines reflect our core values and set the standard for behaviour on our Platform.
        </p>
        <p>
          <strong>Encouraging:</strong> We believe in lifting each other up. Whether you are a Trainer supporting a Client through a challenging workout or a Client leaving a review, we encourage positivity, constructive feedback, and genuine motivation. Every fitness journey is different, and we celebrate progress at every level.
        </p>
        <p>
          <strong>Professional:</strong> Our Platform is a professional space. Trainers are expected to conduct themselves with the professionalism, competence, and integrity that their Clients deserve. Clients are expected to treat Trainers with respect and courtesy. All interactions on the Platform should reflect the standards of a professional fitness environment.
        </p>
        <p>
          <strong>Safety-First:</strong> The health and safety of our community members is our highest priority. We expect all users to prioritise safety in every interaction — from the exercises prescribed in a training session to the way users communicate with one another online. We have zero tolerance for conduct that endangers the physical or emotional wellbeing of any community member.
        </p>
      </LegalSection>

      <LegalSection id="expected-conduct" title="Expected Conduct">
        <p data-testid="text-expected-conduct">
          All members of the Fit Finder community — both Trainers and Clients — are expected to adhere to the following standards of conduct:
        </p>
        <ul>
          <li><strong>Respect and courtesy:</strong> Treat all users with dignity and respect, regardless of their fitness level, background, gender, ethnicity, sexual orientation, disability, or any other characteristic.</li>
          <li><strong>Honesty and transparency:</strong> Provide accurate and truthful information in your profile, communications, reviews, and any other interactions on the Platform. Do not misrepresent your identity, qualifications, experience, or intentions.</li>
          <li><strong>Professionalism:</strong> Maintain a professional tone in all communications, including messages, reviews, and public posts. Avoid personal attacks, offensive language, and inappropriate content.</li>
          <li><strong>Safety awareness:</strong> Prioritise the physical safety of yourself and others in all fitness-related activities. Report any unsafe behaviour, conditions, or concerns to the relevant party and to Fit Finder.</li>
          <li><strong>Privacy and boundaries:</strong> Respect the privacy and personal boundaries of other users. Do not share personal information about other users without their explicit consent.</li>
          <li><strong>Constructive feedback:</strong> When leaving reviews or providing feedback, be honest, fair, and constructive. Focus on your experience and avoid making personal attacks or unsubstantiated claims.</li>
          <li><strong>Compliance with law:</strong> Comply with all applicable laws, regulations, and professional standards in your use of the Platform and in any services you provide or receive.</li>
        </ul>
      </LegalSection>

      <LegalSection id="prohibited-conduct" title="Prohibited Conduct">
        <p data-testid="text-prohibited-conduct">
          The following behaviours are strictly prohibited on the Fit Finder platform. Engaging in any of these activities may result in the immediate suspension or permanent removal of your account, and may be reported to law enforcement where appropriate.
        </p>
        <p>
          <strong>Harassment and bullying:</strong> Any form of harassment, intimidation, bullying, or threatening behaviour directed at another user is prohibited. This includes persistent unwanted contact, verbal abuse, threats of violence, stalking, and any conduct intended to humiliate, demean, or intimidate another person.
        </p>
        <p>
          <strong>Hate speech and discrimination:</strong> Content or behaviour that promotes hatred, violence, or discrimination against any individual or group based on race, ethnicity, national origin, religion, gender, gender identity, sexual orientation, disability, age, or any other protected characteristic is strictly prohibited.
        </p>
        <p>
          <strong>Sexual content and conduct:</strong> The Platform is a professional fitness environment. Sexually explicit content, sexual solicitation, unwelcome sexual advances, and any form of sexual harassment are strictly prohibited. This includes inappropriate photographs, messages, or comments of a sexual nature.
        </p>
        <p>
          <strong>Doxxing and privacy violations:</strong> Sharing, threatening to share, or soliciting the personal information of another user — including their real name, home address, phone number, email address, workplace, or financial information — without their explicit consent is prohibited. This applies regardless of whether the information is publicly available elsewhere.
        </p>
        <p>
          <strong>Unsolicited direct messages:</strong> Sending unsolicited commercial messages, promotional content, or spam through the Platform's messaging system is prohibited. Messages should be relevant to the fitness services offered through the Platform and should be welcome by the recipient.
        </p>
        <p>
          <strong>Scams, fraud, and spam:</strong> Any attempt to defraud, deceive, or scam another user is prohibited. This includes phishing, impersonation, fake reviews, fraudulent bookings, requests for payment outside the Platform, and the distribution of malware or malicious links. Spam, including repetitive or irrelevant content designed to disrupt the Platform, is also prohibited.
        </p>
        <p>
          <strong>Dangerous or reckless behaviour:</strong> Promoting, encouraging, or engaging in fitness practices that are dangerous, reckless, or likely to cause harm — including extreme dieting, the use of prohibited substances, or training methods that disregard basic safety principles — is prohibited.
        </p>
      </LegalSection>

      <LegalSection id="evidence-based-guidance" title="Evidence-Based Guidance">
        <p data-testid="text-evidence-based">
          Fit Finder is committed to promoting evidence-based fitness and wellness practices. Trainers are expected to provide advice, programming, and guidance that is grounded in established exercise science, sports medicine, and nutrition principles. Unsubstantiated health claims, pseudoscientific practices, and the promotion of potentially harmful products or supplements are not welcome on the Platform.
        </p>
        <p>
          Specifically, Trainers should:
        </p>
        <ul>
          <li>Base their exercise programming and advice on recognised qualifications, training, and current best practices in the fitness industry.</li>
          <li>Avoid making medical claims or providing advice that falls outside their scope of practice or qualifications.</li>
          <li>Refrain from promoting miracle cures, rapid weight loss products, unregulated supplements, or any product or service that lacks credible scientific support.</li>
          <li>Be transparent about the limitations of their knowledge and refer Clients to qualified healthcare professionals when appropriate.</li>
          <li>Clearly distinguish between personal opinions and evidence-based recommendations.</li>
        </ul>
        <p>
          Clients are also encouraged to be discerning consumers of fitness information and to consult qualified professionals regarding any health or medical concerns.
        </p>
      </LegalSection>

      <LegalSection id="reporting-moderation" title="Reporting & Moderation">
        <p data-testid="text-reporting">
          We rely on our community to help us maintain a safe and positive environment. If you encounter behaviour that violates these Community Guidelines, we encourage you to report it promptly using the reporting tools available on the Platform.
        </p>
        <p>
          You can report a violation by:
        </p>
        <ul>
          <li>Using the "Report" button available on user profiles, messages, and reviews.</li>
          <li>Contacting our support team directly at <a href="/trust-safety/contact-support">Contact Support</a> or by emailing support@fitfinder.co.</li>
          <li>Selecting the "Safety Report" category when submitting a support request.</li>
        </ul>
        <p>
          All reports are reviewed by our moderation team. We take every report seriously and will investigate promptly. Where possible, we will keep your identity confidential, although there may be circumstances where we are required to disclose information in connection with legal proceedings or law enforcement requests.
        </p>
        <p>
          If you believe you are in immediate danger, please contact your local emergency services before reporting to Fit Finder.
        </p>
      </LegalSection>

      <LegalSection id="consequences" title="Consequences of Violations">
        <p data-testid="text-consequences">
          Violations of these Community Guidelines may result in a range of actions, depending on the severity and nature of the conduct. These actions may include, but are not limited to:
        </p>
        <ul>
          <li><strong>Warning:</strong> A formal warning issued to the user, with a clear explanation of the violation and the expected corrective behaviour.</li>
          <li><strong>Content removal:</strong> Removal of any content that violates these Guidelines, including profile information, reviews, messages, or other materials.</li>
          <li><strong>Temporary suspension:</strong> Temporary suspension of the user's account for a specified period, during which they will be unable to use the Platform.</li>
          <li><strong>Permanent ban:</strong> Permanent removal of the user's account from the Platform. This action is reserved for serious or repeated violations and is taken at Fit Finder's sole discretion.</li>
          <li><strong>Reporting to authorities:</strong> Where conduct may constitute a criminal offence or pose a risk to public safety, Fit Finder may report the matter to law enforcement or other relevant authorities.</li>
        </ul>
        <p>
          Fit Finder reserves the right to take any action we deem appropriate to protect the safety and integrity of our community. Decisions regarding enforcement are made at our sole discretion and are final.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p data-testid="text-contact">
          If you have any questions about these Community Guidelines, or if you wish to report a concern, please contact us at:
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
