export interface TermsSection {
  heading: string;
  body: string[];
}

// Shown in the Terms & Conditions popup on Register and reusable anywhere
// else the platform needs to display the same agreement (e.g. a future
// standalone /terms page). Keep this the single source of truth so the
// checkbox on Register always reflects what the user actually read.
export const TERMS_LAST_UPDATED = "11 September 2026";

export const TERMS_SECTIONS: TermsSection[] = [
  {
    heading: "1. Who this agreement is with",
    body: [
      'These Terms & Conditions ("Terms") are an agreement between you and JomDekan, a platform for Malaysian university students to share academic resources, discuss coursework, and connect with tutors. By creating an account, you confirm you are a current or prospective student, tutor, or staff member affiliated with a Malaysian institution of higher learning, and that the information you provide during registration is accurate.',
    ],
  },
  {
    heading: "2. Consent to data collection and use",
    body: [
      "By registering, you consent to JomDekan collecting and processing your account details, university/programme information, and platform activity (uploads, downloads, forum/discussion posts, tutoring requests) to operate the service, personalise your experience, and produce aggregated, anonymised analytics to improve the platform. This processing is carried out in line with the Personal Data Protection Act 2010 (PDPA), which governs how organisations operating in Malaysia handle personal data.",
      "We will not sell your personal data to third parties. Where analytics or service providers (e.g. hosting, email delivery) need limited access to operate the platform, they are bound to use it only for that purpose. Consistent with your rights as a data subject under the PDPA, you may request a copy of, correction to, or withdraw your consent to the processing of your personal data at any time by contacting JomDekan support, subject to any records we are legally required to keep.",
    ],
  },
  {
    heading: "3. Email and notification communications",
    body: [
      "By creating an account, you agree that JomDekan may email you service and account communications — such as verification, security, password-reset, and moderation notices — that are necessary to operate your account. These cannot be opted out of while your account remains active.",
      "By registering, you also consent to receive marketing and promotional communications from JomDekan by email, including product announcements, platform updates, relevant advertisements, sponsored opportunities, and partner offers. This consent is separate from the service communications above: every marketing email includes an unsubscribe link, and you may withdraw this consent at any time — either through that link or from your account settings — without affecting your access to the platform or its essential account communications, in line with your right under the PDPA to control the use of your personal data for direct marketing.",
    ],
  },
  {
    heading: "4. User-uploaded content and disclaimer of responsibility",
    body: [
      "Resources, notes, past papers, and other materials on JomDekan are uploaded by users, not verified line-by-line by JomDekan for accuracy, completeness, or compliance with any third party's copyright or an institution's academic policies.",
      "JomDekan is not responsible for the accuracy, legality, or consequences of using any user-uploaded material. You use shared resources at your own risk and remain solely responsible for complying with your institution's academic integrity rules. By uploading content, you confirm you own it or have the right to share it, and you grant JomDekan a non-exclusive licence to host, display, and distribute it on the platform for as long as your account or the content remains active.",
    ],
  },
  {
    heading: "5. Prohibited content",
    body: [
      "You must not upload, post, or share any material that is inappropriate for a public academic platform, including but not limited to content that is: obscene, pornographic, or sexually explicit; defamatory, threatening, or harassing; hateful or discriminatory on the basis of race, religion, ethnicity, gender, or disability; promotes violence, self-harm, or illegal activity; infringes a third party's copyright, trademark, or other intellectual property rights; contains malware or malicious code; or discloses another person's personal data without their consent.",
      "Sharing such material may also breach Malaysian law — including the Communications and Multimedia Act 1998 (which makes it an offence to transmit indecent, obscene, or offensive content with intent to annoy, abuse, threaten, or harass another person via a network service), the Penal Code, and the Copyright Act 1987 — and you are solely responsible for any legal consequences that follow from content you upload.",
      "JomDekan reserves the right to remove any content that breaches this section without notice, and may suspend or permanently ban accounts responsible for it. Where content appears to be unlawful, JomDekan may report it to the relevant Malaysian authorities.",
    ],
  },
  {
    heading: "6. Community conduct and academic integrity",
    body: [
      "You agree to treat other users with respect and professionalism at all times — no harassment, hate speech, threats, discrimination, spam, or scams.",
      'You agree to act with academic integrity: JomDekan is a platform for sharing notes, discussing coursework, and finding legitimate tutoring/mentoring. It must never be used to commission or complete graded assignments, exams, or assessments on another person\'s behalf ("contract cheating"), or to solicit or provide answers during a live examination.',
      "JomDekan reserves the right to remove content, suspend, or permanently ban any account that violates these standards, with or without prior notice, at its sole discretion.",
    ],
  },
  {
    heading: "7. Tutoring and marketplace connections",
    body: [
      "JomDekan facilitates introductions between students and tutors for mentoring, proofreading, and study guidance. JomDekan is not a party to, and does not supervise, guarantee, or take responsibility for, any arrangement, payment, deliverable, or dispute between a tutor and a student made through or outside the platform.",
      "Verification badges (if shown) reflect checks made at a point in time and are not a guarantee of a tutor's ongoing conduct or quality of service. Exercise your own judgement before engaging any tutor or opportunity listed on the platform.",
    ],
  },
  {
    heading: "8. Limitation of liability",
    body: [
      'JomDekan is provided on an "as is" and "as available" basis, without warranties of any kind, express or implied, including uninterrupted availability or fitness for a particular purpose.',
      "To the fullest extent permitted by law, JomDekan and its team are not liable for any indirect, incidental, or consequential loss — including lost academic grades, lost income, or lost data — arising from your use of the platform, content posted by other users, or any tutoring/marketplace arrangement made through it.",
    ],
  },
  {
    heading: "9. Account security and data leaks caused by users",
    body: [
      "You are responsible for keeping your login credentials confidential and for all activity under your account. Notify JomDekan immediately if you suspect unauthorised access.",
      "JomDekan is not responsible for data exposure or account compromise resulting from your own actions — including sharing your password, using a compromised device, or falling for phishing attempts — beyond JomDekan's own obligation to secure the systems it directly controls.",
    ],
  },
  {
    heading: "10. Indemnity against third-party claims",
    body: [
      "You agree to indemnify and hold JomDekan harmless from any claim, loss, or legal action brought by a third party (including another user, an institution, or a copyright holder) arising from content you uploaded, your breach of these Terms, or your violation of any law or third-party right.",
    ],
  },
  {
    heading: "11. Intellectual property and takedown requests",
    body: [
      "JomDekan's branding, design, and platform code are owned by JomDekan. Users retain ownership of content they upload, subject to the licence granted in Section 4.",
      "If you believe content on JomDekan infringes your copyright or other rights, contact JomDekan support with details of the material and your claim; we will review and remove infringing content where appropriate, consistent with the Copyright Act 1987.",
    ],
  },
  {
    heading: "12. Changes to these Terms",
    body: [
      "JomDekan may update these Terms from time to time to reflect changes to the platform or legal requirements. Material changes will be flagged in the app. Continued use of JomDekan after an update constitutes acceptance of the revised Terms.",
    ],
  },
  {
    heading: "13. Governing law",
    body: [
      "These Terms are governed by the laws of Malaysia — including, where applicable, the Personal Data Protection Act 2010, the Communications and Multimedia Act 1998, and the Copyright Act 1987 — and any dispute arising from them will be subject to the exclusive jurisdiction of the Malaysian courts.",
    ],
  },
];
