import LegalPageLayout, { LegalSection } from "@/components/legal/LegalPageLayout";

const toc = [
  { id: "introduction", title: "Introduction / Acceptance of Terms" },
  { id: "definitions", title: "Definitions" },
  { id: "nature-of-service", title: "Nature of the Service" },
  { id: "independent-contractors", title: "Independent Contractors" },
  { id: "no-professional-advice", title: "No Professional or Medical Advice" },
  { id: "eligibility", title: "User Eligibility and Accounts" },
  { id: "user-responsibilities", title: "User Responsibilities" },
  { id: "safety", title: "Safety and Assumption of Risk" },
  { id: "payments", title: "Payments & Marketplace Role" },
  { id: "disputes", title: "Disputes Between Users" },
  { id: "prohibited-conduct", title: "Prohibited Conduct" },
  { id: "content-reviews", title: "Content and Reviews" },
  { id: "termination", title: "Termination / Suspension" },
  { id: "disclaimers", title: "Disclaimers" },
  { id: "limitation-of-liability", title: "Limitation of Liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "governing-law", title: "Governing Law" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact Information" },
];

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" lastUpdated="2026-03-04" toc={toc}>
      <div data-testid="terms-page">
        <LegalSection id="introduction" title="Introduction / Acceptance of Terms">
          <p>
            Welcome to Fit Finder (the <strong>"Platform"</strong>), operated by Fit Finder Ltd, a company registered in England & Wales. These Terms & Conditions (<strong>"Terms"</strong>) govern your access to and use of the Platform, including all associated websites, mobile applications, APIs, and services provided by Fit Finder Ltd.
          </p>
          <p>
            By creating an account, accessing, or using the Platform in any way, you acknowledge that you have read, understood, and agree to be bound by these Terms, together with our <a href="/legal/privacy">Privacy Policy</a> and <a href="/legal/refunds">Refund & Payments Policy</a>. If you do not agree with any part of these Terms, you must not access or use the Platform. Your continued use of the Platform following any amendments to these Terms constitutes your acceptance of those amendments.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you and Fit Finder Ltd. We reserve the right to refuse access to the Platform to anyone, at any time, for any reason, subject to applicable law.
          </p>
        </LegalSection>

        <LegalSection id="definitions" title="Definitions">
          <p>In these Terms, the following definitions apply unless the context requires otherwise:</p>
          <ul>
            <li><strong>"Platform"</strong> means the Fit Finder website, mobile applications, and any related services, tools, or features operated by Fit Finder Ltd.</li>
            <li><strong>"Trainer"</strong> means any individual or entity that registers on the Platform to offer fitness training, coaching, or related services to Clients.</li>
            <li><strong>"Client"</strong> means any individual who registers on the Platform to search for, connect with, or engage the services of a Trainer.</li>
            <li><strong>"User"</strong> means any person who accesses or uses the Platform, whether as a Trainer, Client, or visitor.</li>
            <li><strong>"Services"</strong> means the fitness training, coaching, nutritional guidance, or related services offered by Trainers through the Platform.</li>
            <li><strong>"Content"</strong> means any text, images, videos, reviews, ratings, profiles, messages, or other materials uploaded, submitted, posted, or displayed on the Platform by any User.</li>
            <li><strong>"We," "Us," "Our"</strong> refers to Fit Finder Ltd and its directors, officers, employees, agents, and affiliates.</li>
          </ul>
        </LegalSection>

        <LegalSection id="nature-of-service" title="Nature of the Service">
          <p>
            Fit Finder operates solely as an online marketplace platform that connects Clients seeking fitness and wellness services with independent Trainers who offer such services. The Platform provides a venue for Trainers to list their services and for Clients to discover, evaluate, and engage with Trainers. <strong>We are not a party to any agreement, arrangement, or contract entered into between a Trainer and a Client.</strong>
          </p>
          <p>
            Fit Finder Ltd does not provide, perform, or control any fitness training, coaching, or related services listed on the Platform. We do not employ Trainers, and we do not supervise, direct, or control the manner in which Trainers deliver their services. The relationship between a Client and a Trainer is solely between those two parties, and any agreement regarding the scope, terms, pricing, scheduling, or quality of services is a matter between the Client and Trainer.
          </p>
          <p>
            While we may facilitate communication and payment processing between Clients and Trainers, such facilitation does not create any partnership, joint venture, agency, or employment relationship between Fit Finder Ltd and any User. We make no representations or warranties regarding the quality, safety, legality, or suitability of any services offered through the Platform.
          </p>
        </LegalSection>

        <LegalSection id="independent-contractors" title="Independent Contractors">
          <p>
            Trainers who use the Platform are independent contractors and are not employees, agents, joint venturers, or partners of Fit Finder Ltd. Nothing in these Terms or in the use of the Platform shall be construed as creating an employment relationship, agency relationship, partnership, or joint venture between Fit Finder Ltd and any Trainer or Client.
          </p>
          <p>
            Trainers are solely responsible for determining the manner, method, and means by which they perform their services. Trainers are responsible for their own tax obligations, insurance, professional certifications, licences, and compliance with all applicable laws and regulations related to their provision of services. Fit Finder Ltd does not withhold taxes on behalf of Trainers and does not provide any employment benefits, including but not limited to health insurance, pension contributions, or paid leave.
          </p>
        </LegalSection>

        <LegalSection id="no-professional-advice" title="No Professional or Medical Advice">
          <p>
            The Platform and any Content available therein are provided for informational and connection purposes only. Nothing on the Platform constitutes professional medical advice, diagnosis, treatment, or a substitute for consultation with a qualified healthcare professional. You should always consult your doctor or other qualified healthcare provider before beginning any new exercise programme, nutrition plan, or making any changes to an existing health regimen.
          </p>
          <p>
            Fit Finder Ltd does not endorse, verify, or guarantee the qualifications, certifications, expertise, or competence of any Trainer listed on the Platform. While we may require Trainers to provide evidence of certain qualifications, we do not independently verify the accuracy, validity, or currency of such credentials. Users engage Trainers entirely at their own risk and are encouraged to conduct their own due diligence before engaging any Trainer's services.
          </p>
          <p>
            If you experience any pain, discomfort, or adverse health effects during or after any exercise or training programme, you should immediately discontinue the activity and seek medical attention.
          </p>
        </LegalSection>

        <LegalSection id="eligibility" title="User Eligibility and Accounts">
          <p>
            To use the Platform, you must be at least 18 years of age (or the age of majority in your jurisdiction, whichever is greater) and have the legal capacity to enter into a binding agreement. By creating an account, you represent and warrant that you meet these eligibility requirements.
          </p>
          <p>
            When creating an account, you agree to provide accurate, current, and complete information and to update such information as necessary to keep it accurate, current, and complete. You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must immediately notify us at support@fitfinder.co if you become aware of any unauthorised use of your account or any other breach of security.
          </p>
          <p>
            You may not create more than one account per person, and you may not create an account on behalf of another person without their express authorisation. We reserve the right to suspend or terminate any account that we reasonably believe has been created in violation of these Terms or that contains false or misleading information.
          </p>
        </LegalSection>

        <LegalSection id="user-responsibilities" title="User Responsibilities">
          <p><strong>Client Responsibilities:</strong></p>
          <ul>
            <li>Provide accurate and complete information about your health, fitness level, medical conditions, and any limitations that may affect your ability to participate in training or exercise programmes.</li>
            <li>Obtain appropriate medical clearance before engaging in any physical training or exercise programme, particularly if you have any pre-existing medical conditions.</li>
            <li>Communicate clearly and honestly with your chosen Trainer regarding your goals, availability, and any concerns.</li>
            <li>Comply with all applicable booking, cancellation, and payment terms agreed upon with your Trainer.</li>
            <li>Treat all Trainers and other Users with respect and refrain from any form of harassment, discrimination, or abusive behaviour.</li>
            <li>Report any safety concerns, inappropriate behaviour, or violations of these Terms to Fit Finder Ltd promptly.</li>
          </ul>
          <p><strong>Trainer Responsibilities:</strong></p>
          <ul>
            <li>Maintain all necessary and current professional qualifications, certifications, insurance, and licences required to lawfully provide fitness training or related services in your jurisdiction.</li>
            <li>Provide services in a safe, competent, and professional manner, consistent with accepted industry standards and best practices.</li>
            <li>Accurately represent your qualifications, experience, specialisations, and the services you offer on your Platform profile.</li>
            <li>Carry appropriate professional indemnity and public liability insurance to cover the services you provide.</li>
            <li>Comply with all applicable laws, regulations, and codes of practice relating to the provision of fitness and training services.</li>
            <li>Respond to Client enquiries and booking requests in a timely and professional manner.</li>
            <li>Maintain accurate records of sessions, payments, and any relevant health and safety documentation.</li>
          </ul>
        </LegalSection>

        <LegalSection id="safety" title="Safety and Assumption of Risk">
          <p>
            Physical exercise and fitness training carry inherent risks of injury, illness, disability, or death. By using the Platform to engage the services of a Trainer, you acknowledge and voluntarily assume all risks associated with participating in physical exercise, training programmes, and related activities, whether supervised or unsupervised.
          </p>
          <p>
            You understand that the services provided by Trainers may involve strenuous physical activity, and you represent that you are physically and mentally capable of participating in such activities. You acknowledge that Fit Finder Ltd has no control over the services provided by Trainers and bears no responsibility for any injuries, damages, or losses arising from your participation in any training sessions, exercise programmes, or related activities arranged through the Platform.
          </p>
          <p>
            It is your responsibility to ensure that you are in adequate physical condition to participate in any activities and to inform your Trainer of any health conditions, injuries, or limitations that may affect your participation. Fit Finder Ltd strongly recommends that all Users obtain a comprehensive health screening or medical check-up before commencing any new fitness programme.
          </p>
        </LegalSection>

        <LegalSection id="payments" title="Payments & Marketplace Role">
          <p>
            Fit Finder Ltd may facilitate payment processing between Clients and Trainers through third-party payment processors, including Stripe. When you make a payment through the Platform, you agree to the terms and conditions of the applicable payment processor in addition to these Terms.
          </p>
          <p>
            All fees, pricing, and payment terms for services are set by individual Trainers and are agreed upon directly between the Client and the Trainer. Fit Finder Ltd may charge a service fee or commission on transactions processed through the Platform, which will be clearly disclosed before any payment is made. Please refer to our <a href="/legal/refunds">Refund & Payments Policy</a> for further details regarding payments, fees, refunds, and chargebacks.
          </p>
          <p>
            Fit Finder Ltd is not responsible for any payment disputes between Clients and Trainers. While we may offer tools to help facilitate dispute resolution, the ultimate responsibility for resolving payment-related issues lies with the parties involved.
          </p>
        </LegalSection>

        <LegalSection id="disputes" title="Disputes Between Users">
          <p>
            Any disputes, claims, or disagreements arising between Clients and Trainers regarding services, payments, scheduling, quality of service, or any other matter are solely between those parties. Fit Finder Ltd is not a party to any such disputes and has no obligation to mediate, arbitrate, or resolve disputes between Users.
          </p>
          <p>
            While Fit Finder Ltd may, at its sole discretion, offer dispute resolution tools or assistance, we are under no obligation to do so. Any assistance we provide is offered as a courtesy and does not create any obligation, liability, or guarantee of a particular outcome. We encourage Users to attempt to resolve disputes directly and amicably before seeking any form of external resolution.
          </p>
          <p>
            If you believe that a User has violated these Terms or engaged in conduct that is unlawful or harmful, you may report the matter to us at support@fitfinder.co. We will review all reports and may take action at our discretion, including but not limited to issuing warnings, suspending accounts, or terminating access to the Platform.
          </p>
        </LegalSection>

        <LegalSection id="prohibited-conduct" title="Prohibited Conduct">
          <p>You agree not to engage in any of the following prohibited activities when using the Platform:</p>
          <ul>
            <li>Using the Platform for any unlawful purpose or in violation of any applicable local, national, or international law or regulation.</li>
            <li>Impersonating any person or entity, or falsely stating or misrepresenting your identity, qualifications, affiliation, or credentials.</li>
            <li>Posting or transmitting any Content that is defamatory, obscene, abusive, threatening, harassing, discriminatory, or otherwise objectionable.</li>
            <li>Attempting to circumvent any security measures, access controls, or technical protections implemented on the Platform.</li>
            <li>Using automated tools, bots, scrapers, or similar technologies to access, collect data from, or interact with the Platform without our prior written consent.</li>
            <li>Interfering with or disrupting the operation of the Platform, its servers, or networks connected to the Platform.</li>
            <li>Soliciting Users to transact outside the Platform in order to avoid paying applicable fees or commissions.</li>
            <li>Posting false, misleading, or fraudulent reviews, ratings, or testimonials.</li>
            <li>Uploading or transmitting any viruses, malware, or other harmful code.</li>
            <li>Engaging in any form of spam, phishing, or unsolicited commercial communications.</li>
            <li>Collecting or harvesting personal information of other Users without their express consent.</li>
            <li>Using the Platform to promote or advertise services or products unrelated to fitness and wellness.</li>
          </ul>
        </LegalSection>

        <LegalSection id="content-reviews" title="Content and Reviews">
          <p>
            Users may submit Content to the Platform, including profile information, reviews, ratings, photographs, videos, and messages. By submitting Content, you grant Fit Finder Ltd a non-exclusive, worldwide, royalty-free, sublicensable, and transferable licence to use, reproduce, modify, adapt, publish, display, distribute, and create derivative works from your Content in connection with operating and promoting the Platform.
          </p>
          <p>
            You represent and warrant that you own or have the necessary rights, licences, and permissions to submit all Content and that your Content does not infringe upon the intellectual property rights, privacy rights, or any other rights of any third party. You are solely responsible for the Content you submit, and Fit Finder Ltd assumes no liability for any Content posted by Users.
          </p>
          <p>
            Reviews and ratings should be honest, accurate, and based on genuine experiences. Fit Finder Ltd reserves the right to remove or moderate any Content that violates these Terms, is deemed inappropriate, or is reported by other Users. We do not guarantee the accuracy, reliability, or completeness of any Content, including reviews and ratings, posted on the Platform.
          </p>
        </LegalSection>

        <LegalSection id="termination" title="Termination / Suspension">
          <p>
            Fit Finder Ltd reserves the right to suspend, restrict, or terminate your account and access to the Platform at any time, with or without notice, for any reason, including but not limited to a breach of these Terms, fraudulent or illegal activity, conduct that is harmful to other Users or the Platform, or at the request of law enforcement or other government agencies.
          </p>
          <p>
            You may terminate your account at any time by contacting us at support@fitfinder.co or through the account settings on the Platform. Upon termination, your right to use the Platform will immediately cease, and we may delete or retain your account information and Content in accordance with our <a href="/legal/privacy">Privacy Policy</a>.
          </p>
          <p>
            Termination of your account does not relieve you of any obligations arising prior to termination, including any outstanding payment obligations, indemnification obligations, or liability for any breach of these Terms. The provisions of these Terms that by their nature should survive termination shall continue in full force and effect, including but not limited to the sections on Disclaimers, Limitation of Liability, Indemnification, and Governing Law.
          </p>
        </LegalSection>

        <LegalSection id="disclaimers" title="Disclaimers">
          <p>
            The Platform and all Content, features, and services available through the Platform are provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis, without warranties of any kind, whether express, implied, statutory, or otherwise. To the fullest extent permitted by applicable law, Fit Finder Ltd expressly disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, and any warranties arising from course of dealing, usage, or trade practice.
          </p>
          <p>
            Fit Finder Ltd does not warrant that the Platform will be available at all times, uninterrupted, secure, or error-free, that any defects will be corrected, or that the Platform or its servers are free of viruses or other harmful components. We make no representations or warranties regarding the accuracy, reliability, completeness, or timeliness of any Content available on the Platform.
          </p>
          <p>
            Fit Finder Ltd does not endorse, guarantee, or assume responsibility for the quality, safety, legality, or suitability of any services offered by Trainers on the Platform. Any reliance you place on the Platform, its Content, or the services of any Trainer is strictly at your own risk.
          </p>
        </LegalSection>

        <LegalSection id="limitation-of-liability" title="Limitation of Liability">
          <p>
            <strong>Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law.</strong> This includes, without limitation, liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be lawfully excluded or limited.
          </p>
          <p>
            To the fullest extent permitted by law, Fit Finder Ltd, its directors, officers, employees, agents, affiliates, and licensors shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to damages for loss of profits, goodwill, data, or other intangible losses, arising out of or in connection with your use of or inability to use the Platform, any services obtained through the Platform, or any Content posted or made available through the Platform, regardless of the theory of liability (whether in contract, tort, strict liability, or otherwise) and even if Fit Finder Ltd has been advised of the possibility of such damages.
          </p>
          <p>
            To the fullest extent permitted by law, the total aggregate liability of Fit Finder Ltd to you for all claims arising out of or relating to these Terms or your use of the Platform shall not exceed the greater of (a) <strong>£100</strong> or (b) the total fees paid by you to Fit Finder Ltd during the <strong>three (3) months</strong> immediately preceding the event giving rise to the claim.
          </p>
          <p>
            The limitations and exclusions of liability set out in this section reflect a fair and reasonable allocation of risk between the parties and form an essential basis of the bargain between you and Fit Finder Ltd. The Platform would not be provided to you without these limitations.
          </p>
        </LegalSection>

        <LegalSection id="indemnification" title="Indemnification">
          <p>
            You agree to indemnify, defend, and hold harmless Fit Finder Ltd, its directors, officers, employees, agents, affiliates, successors, and assigns from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees and costs) arising out of or in connection with: (a) your use of or access to the Platform; (b) your violation of these Terms or any applicable law or regulation; (c) your Content or any information you provide through the Platform; (d) your interaction with any other User, including any Trainer or Client; (e) any services you provide or receive through the Platform; or (f) any breach of your representations and warranties set forth in these Terms.
          </p>
          <p>
            This indemnification obligation will survive the termination or expiration of these Terms and your use of the Platform. Fit Finder Ltd reserves the right, at its own expense, to assume the exclusive defence and control of any matter otherwise subject to indemnification by you, in which event you will cooperate with Fit Finder Ltd in asserting any available defences.
          </p>
        </LegalSection>

        <LegalSection id="governing-law" title="Governing Law">
          <p>
            These Terms and any disputes arising out of or in connection with them (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of <strong>England & Wales</strong>. You agree to submit to the exclusive jurisdiction of the courts of England & Wales for the resolution of any disputes arising under or in connection with these Terms.
          </p>
          <p>
            If you are a consumer, you may also be entitled to bring proceedings in the courts of the country in which you are resident, and nothing in these Terms shall affect your statutory rights as a consumer under applicable law. If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect.
          </p>
        </LegalSection>

        <LegalSection id="changes" title="Changes to Terms">
          <p>
            Fit Finder Ltd reserves the right to modify, amend, or update these Terms at any time, at its sole discretion. When we make material changes to these Terms, we will notify you by updating the "Last updated" date at the top of this page and, where appropriate, by providing additional notice through the Platform, such as an in-app notification or an email to the address associated with your account.
          </p>
          <p>
            Your continued use of the Platform following the posting of any changes to these Terms constitutes your acceptance of those changes. If you do not agree with any revised Terms, you must discontinue your use of the Platform and terminate your account. We recommend that you review these Terms periodically to stay informed of any updates.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="Contact Information">
          <p>
            If you have any questions, concerns, or feedback regarding these Terms & Conditions or the Platform, please contact us using the following details:
          </p>
          <ul>
            <li><strong>Company:</strong> Fit Finder Ltd</li>
            <li><strong>Email:</strong> support@fitfinder.co</li>
            <li><strong>Jurisdiction:</strong> England & Wales</li>
          </ul>
          <p>
            We aim to respond to all enquiries within a reasonable timeframe. For urgent matters relating to account security or safety concerns, please indicate the urgency of your request in the subject line of your communication.
          </p>
        </LegalSection>
      </div>
    </LegalPageLayout>
  );
}