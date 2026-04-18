import LegalPageLayout, { LegalSection } from "@/components/legal/LegalPageLayout";

const toc = [
  { id: "introduction", title: "Introduction" },
  { id: "risks-of-fitness-training", title: "Risks of Fitness Training" },
  { id: "consult-healthcare", title: "Responsibility to Consult Healthcare Professional" },
  { id: "disclosure-of-conditions", title: "Disclosure of Conditions" },
  { id: "voluntary-assumption", title: "Voluntary Assumption of Risk" },
  { id: "release-of-claims", title: "Release of Claims Against Fit Finder" },
  { id: "not-the-trainer", title: "Fit Finder is Not the Trainer" },
  { id: "governing-law", title: "Governing Law" },
  { id: "contact", title: "Contact" },
];

export default function ClientWaiver() {
  return (
    <LegalPageLayout title="Client Waiver / Assumption of Risk" lastUpdated="2026-03-04" toc={toc}>
      <LegalSection id="introduction" title="Introduction">
        <p data-testid="text-waiver-intro">
          This Client Waiver and Assumption of Risk document ("Waiver") applies to all individuals ("Client", "you", or "your") who use the Fit Finder platform ("Platform", "we", "us", or "our") to engage the services of independent fitness professionals ("Trainers"). By creating an account, booking a session, or otherwise using the Platform, you acknowledge that you have read, understood, and voluntarily agree to the terms set out in this Waiver.
        </p>
        <p>
          Fit Finder is a technology platform that connects Clients with independent Trainers. We do not employ, supervise, or control the Trainers listed on our Platform. The purpose of this Waiver is to ensure that you understand the inherent risks associated with physical exercise and fitness training, and that you voluntarily accept those risks when engaging a Trainer through the Platform.
        </p>
        <p>
          This Waiver does not seek to exclude or limit liability for death or personal injury caused by negligence, or for fraud or fraudulent misrepresentation, or any other liability that cannot be excluded or limited under applicable law.
        </p>
      </LegalSection>

      <LegalSection id="risks-of-fitness-training" title="Risks of Fitness Training">
        <p data-testid="text-risks">
          Physical exercise and fitness training involve inherent risks that cannot be entirely eliminated, regardless of the care taken by you, your Trainer, or any other party. By participating in fitness training activities arranged through the Platform, you acknowledge and accept that these risks include, but are not limited to:
        </p>
        <ul>
          <li><strong>Physical injury:</strong> Including but not limited to sprains, strains, fractures, dislocations, muscle tears, ligament damage, tendon injuries, and joint injuries resulting from exercise movements, equipment use, or physical exertion.</li>
          <li><strong>Cardiovascular events:</strong> Including heart attack, stroke, cardiac arrest, abnormal heart rhythms, and other cardiovascular complications that may occur during or after physical exertion, particularly in individuals with pre-existing conditions.</li>
          <li><strong>Death:</strong> In rare but serious cases, physical exercise can result in sudden death, particularly in individuals with undiagnosed or undisclosed cardiac conditions or other serious medical conditions.</li>
          <li><strong>Medical complications:</strong> Including aggravation of pre-existing injuries or conditions, exercise-induced asthma, heat exhaustion, heat stroke, dehydration, rhabdomyolysis, fainting, dizziness, and nausea.</li>
          <li><strong>Emotional or psychological distress:</strong> Including anxiety, stress, or emotional discomfort that may arise during challenging physical activities.</li>
          <li><strong>Environmental hazards:</strong> Including risks associated with outdoor training such as uneven terrain, weather conditions, traffic, and exposure to the elements.</li>
        </ul>
        <p>
          The above list is not exhaustive. You understand that fitness training carries risks that are both foreseeable and unforeseeable, and you voluntarily accept all such risks.
        </p>
      </LegalSection>

      <LegalSection id="consult-healthcare" title="Responsibility to Consult Healthcare Professional">
        <p data-testid="text-consult-healthcare">
          Before beginning any fitness programme, engaging a Trainer, or participating in any physical activity arranged through the Platform, you are strongly advised to consult with a qualified healthcare professional, such as your general practitioner (GP) or a specialist, to assess your fitness for physical exercise.
        </p>
        <p>
          This is particularly important if you:
        </p>
        <ul>
          <li>Have any pre-existing medical condition, including but not limited to heart disease, hypertension, diabetes, respiratory conditions, musculoskeletal disorders, or mental health conditions.</li>
          <li>Are pregnant or have recently given birth.</li>
          <li>Are recovering from surgery, illness, or injury.</li>
          <li>Take medication that may affect your ability to exercise safely.</li>
          <li>Have not exercised regularly in the past six months or more.</li>
          <li>Have a family history of cardiovascular disease or sudden cardiac death.</li>
        </ul>
        <p>
          You acknowledge that Fit Finder and its Trainers are not medical professionals and are not qualified to provide medical advice, diagnose conditions, or determine your medical fitness for exercise. The decision to engage in physical activity is yours alone, and you bear full responsibility for ensuring that you are medically fit to participate.
        </p>
      </LegalSection>

      <LegalSection id="disclosure-of-conditions" title="Disclosure of Conditions">
        <p data-testid="text-disclosure">
          You have a responsibility to fully and accurately disclose to your Trainer any and all medical conditions, injuries, physical limitations, medications, allergies, or other health-related information that may affect your ability to exercise safely. This includes conditions that may not currently cause symptoms but could be relevant to your training.
        </p>
        <p>
          You must promptly inform your Trainer of any changes to your health status, including new injuries, diagnoses, or medications, before participating in further training sessions. Failure to disclose relevant health information may increase your risk of injury and may limit the ability of your Trainer to provide safe and appropriate exercise programming.
        </p>
        <p>
          You acknowledge that withholding or providing inaccurate health information may release your Trainer and Fit Finder from liability for any resulting injury or harm.
        </p>
      </LegalSection>

      <LegalSection id="voluntary-assumption" title="Voluntary Assumption of Risk">
        <p data-testid="text-voluntary-assumption">
          By using the Platform and engaging in fitness training with a Trainer, you voluntarily assume all risks associated with physical exercise and fitness activities, whether known or unknown, foreseeable or unforeseeable. You acknowledge that you are participating in physical activities of your own free will and that no one has coerced, pressured, or required you to do so.
        </p>
        <p>
          You understand that you have the right to:
        </p>
        <ul>
          <li>Refuse to perform any exercise or activity that you believe is unsafe, beyond your ability, or otherwise inappropriate for you.</li>
          <li>Stop any exercise or training session at any time if you experience pain, discomfort, dizziness, or any other symptoms of concern.</li>
          <li>Ask your Trainer for modifications, alternatives, or rest periods at any time during a session.</li>
          <li>Terminate your relationship with any Trainer at any time and for any reason.</li>
        </ul>
        <p>
          Your decision to continue with any exercise or training session constitutes your voluntary assumption of the risks associated with that activity.
        </p>
      </LegalSection>

      <LegalSection id="release-of-claims" title="Release of Claims Against Fit Finder">
        <p data-testid="text-release-claims">
          To the fullest extent permitted by applicable law, you agree to release, waive, and discharge Fit Finder, its officers, directors, employees, agents, and affiliates from any and all claims, demands, actions, or causes of action arising out of or in connection with your use of the Platform and your participation in fitness training activities arranged through the Platform.
        </p>
        <p>
          This release includes, but is not limited to, claims for:
        </p>
        <ul>
          <li>Personal injury, illness, or death arising from fitness training activities.</li>
          <li>Property damage or loss occurring during or in connection with training sessions.</li>
          <li>Emotional distress or psychological harm.</li>
          <li>Financial loss or consequential damages arising from your engagement with a Trainer.</li>
        </ul>
        <p>
          <strong>Important:</strong> Nothing in this Waiver seeks to exclude or limit liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for any other liability that cannot be excluded or limited under the laws of England and Wales. Your statutory rights as a consumer are not affected by this Waiver.
        </p>
      </LegalSection>

      <LegalSection id="not-the-trainer" title="Fit Finder is Not the Trainer">
        <p data-testid="text-not-trainer">
          Fit Finder is a technology platform that facilitates introductions between Clients and independent Trainers. We do not employ, manage, supervise, or control the Trainers who offer their services through the Platform. Trainers are independent contractors who are solely responsible for the services they provide.
        </p>
        <p>
          We do not guarantee the quality, safety, or suitability of any Trainer's services. While we take reasonable steps to verify the qualifications and credentials of Trainers on our Platform, we cannot guarantee the accuracy of information provided by Trainers, and we do not conduct background checks on all Trainers.
        </p>
        <p>
          The contractual relationship for fitness services is between you and the Trainer. Fit Finder is not a party to that contract and bears no responsibility for the Trainer's performance, conduct, or the outcomes of training sessions. You are encouraged to review Trainer profiles, ratings, and reviews before making a booking, and to communicate directly with your Trainer about your goals, needs, and any concerns.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="Governing Law">
        <p data-testid="text-governing-law">
          This Waiver shall be governed by and construed in accordance with the laws of England and Wales. Any dispute arising out of or in connection with this Waiver shall be subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>
        <p>
          If any provision of this Waiver is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. Nothing in this Waiver affects your statutory rights as a consumer under the laws of England and Wales.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p data-testid="text-contact">
          If you have any questions about this Waiver or require further information, please contact us at:
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
