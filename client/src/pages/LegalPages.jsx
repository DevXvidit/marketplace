import { motion } from 'framer-motion';

const container = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

function LegalShell({ title, subtitle, children }) {
  return (
    <div className="pt-24 min-h-screen bg-luxury-black">
      <div className="relative py-16 border-b border-luxury-border bg-luxury-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold-500 mb-3">Akshar Jewellers</p>
          <h1 className="font-display text-4xl md:text-5xl text-white">{title}</h1>
          {subtitle && (
            <p className="font-sans text-xs text-luxury-muted mt-3">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14 pb-24">
        <motion.div variants={container} initial="initial" animate="animate">
          <div className="prose prose-invert max-w-none prose-p:font-serif prose-p:text-lg prose-p:leading-relaxed prose-p:text-white/60 prose-li:font-serif prose-li:text-lg prose-li:text-white/60 prose-headings:font-display prose-headings:text-white prose-h2:text-2xl prose-h2:mt-10">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      subtitle="Effective Date: April 1, 2026"
    >
      <p>
        This Privacy Policy explains how Akshar Jewellers ("we", "us", "our") collects,
        uses, and protects personal information when you visit our website or interact
        with us online. By using the site, you agree to the practices described below.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>Contact details you provide, such as name, email, phone number, and messages.</li>
        <li>Account information when you register, including login credentials.</li>
        <li>Usage data such as pages viewed, time on site, and device or browser details.</li>
        <li>Wishlist or preference data you save while browsing collections.</li>
      </ul>

      <h2>How We Use Information</h2>
      <ul>
        <li>To respond to inquiries and provide customer support.</li>
        <li>To personalize your browsing experience and show relevant collections.</li>
        <li>To operate and improve the website, including security and analytics.</li>
        <li>To communicate updates, offers, or announcements (you can opt out anytime).</li>
      </ul>

      <h2>Sharing and Disclosure</h2>
      <p>
        We do not sell your personal information. We may share limited data with trusted
        service providers that help us operate the website (such as hosting, analytics,
        or email services). These providers are required to protect your information
        and use it only for the services they provide to us. We may also disclose
        information if required by law.
      </p>

      <h2>Cookies and Analytics</h2>
      <p>
        We use cookies and similar technologies to keep the site functional, remember
        preferences, and understand how the site is used. You can control cookies
        through your browser settings. Disabling cookies may affect some features.
      </p>

      <h2>Data Retention and Security</h2>
      <p>
        We retain personal information only as long as needed for the purposes outlined
        above or as required by law. We apply reasonable security measures to protect
        data, but no online system can be guaranteed 100 percent secure.
      </p>

      <h2>Your Choices and Rights</h2>
      <ul>
        <li>You can request access, correction, or deletion of your personal data.</li>
        <li>You can opt out of promotional communications at any time.</li>
        <li>You may disable cookies through your browser settings.</li>
      </ul>

      <h2>Children's Privacy</h2>
      <p>
        Our website is not intended for children under 13. We do not knowingly collect
        personal information from children.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Updates will be posted on
        this page with a revised effective date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about this policy, contact us at
        aksharjewellers98@gmail.com or call +91 9586607262. You may also visit us at
        Akshar Jewellers, Sardarchowk, Krishnanagar, Ahmedabad 382345.
      </p>
    </LegalShell>
  );
}

export function TermsOfServicePage() {
  return (
    <LegalShell
      title="Terms of Service"
      subtitle="Effective Date: April 1, 2026"
    >
      <p>
        These Terms of Service ("Terms") govern your use of the Akshar Jewellers website.
        By accessing or using the site, you agree to these Terms. If you do not agree,
        please do not use the site.
      </p>

      <h2>Website Use</h2>
      <ul>
        <li>You may browse, view products, and save items to a wishlist for personal use.</li>
        <li>You agree not to misuse the site, interfere with its operation, or attempt unauthorized access.</li>
        <li>Content, images, and designs are owned by Akshar Jewellers and may not be copied without permission.</li>
      </ul>

      <h2>Product Information and Pricing</h2>
      <p>
        We strive to display accurate product details and prices. Prices may change
        based on market rates and availability. Product images are for representation
        only and may differ slightly from the final piece.
      </p>

      <h2>Purchases and Availability</h2>
      <p>
        Akshar Jewellers completes purchases only in-store at our physical location.
        We do not fulfill orders outside our store. Availability and final pricing are
        confirmed in-store at the time of purchase.
      </p>

      <h2>Accounts</h2>
      <p>
        If you create an account, you are responsible for maintaining the confidentiality
        of your login credentials and for all activities that occur under your account.
      </p>

      <h2>Third-Party Links</h2>
      <p>
        The site may contain links to third-party websites. We are not responsible for
        the content or practices of those sites.
      </p>

      <h2>Disclaimers</h2>
      <p>
        The website is provided "as is" without warranties of any kind, express or implied.
        We do not guarantee uninterrupted access or that the site will be error-free.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Akshar Jewellers will not be liable for
        any indirect, incidental, or consequential damages arising from your use of the site.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Updates will be posted on this page
        with a revised effective date.
      </p>

      <h2>Contact Us</h2>
      <p>
        For questions about these Terms, contact us at aksharjewellers98@gmail.com or
        call +91 9586607262. You may also visit us at Akshar Jewellers, Sardarchowk,
        Krishnanagar, Ahmedabad 382345.
      </p>
    </LegalShell>
  );
}
