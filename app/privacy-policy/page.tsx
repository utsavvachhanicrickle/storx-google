import React from "react";

export const metadata = {
  title: "Privacy Policy — CyberLS",
  description: "Privacy policy and compliance information for CyberLS backup service.",
};

export default function PrivacyPolicyPage() {
  return (
    <main>
      <section className="cy-legal-hero">
        <div className="cy-legal-hero__bg" />
        <div className="cy-container">
          <h1 className="cy-legal-hero__title">Privacy Policy</h1>
          <p className="cy-legal-hero__meta">
            A division of Indsoft Systems
          </p>
        </div>
      </section>

      <section className="cy-legal-content">
        <div className="cy-container">
          <div className="cy-legal-doc cy-glass">
            <h3 style={{ marginTop: 0 }}>1. Who We Are</h3>
            <p>
              This Privacy Policy describes how CyberLS (“CyberLS”, “we”, “us”, or “our”), a division of Indsoft Systems, collects, uses, discloses, and protects information when you use our Google Workspace backup service (the “Service”), including our website, applications, and any related tools.<br />
              <span className="cy-placeholder">Cyberls, DBA Indsoft Systems, Mumbai, India</span>
            </p>
            <p>
              This Policy applies to: (a) personal information you provide to us directly as a customer or prospective customer (such as your name, email address, and billing details), and (b) personal information contained within the Google Workspace data that CyberLS backs up on behalf of your organisation, where CyberLS acts as a Data Processor on your instructions.
            </p>

            <h3>2. Our Role: Data Fiduciary and Data Processor</h3>
            <p>
              Under India's Digital Personal Data Protection Act, 2023 (“DPDPA”), two distinct roles are relevant to how CyberLS handles personal data:
            </p>
            <ul>
              <li>Where you are our customer (e.g. you sign up for an account, we bill you, we communicate with you about your subscription), CyberLS acts as a Data Fiduciary and determines why and how that information is processed.</li>
              <li>Where CyberLS backs up your organisation's Google Workspace data on your instructions — which may include personal data of your employees, customers, or other individuals — CyberLS acts as a Data Processor on your behalf. Your organisation remains the Data Fiduciary for that data, and is responsible for ensuring it has the appropriate legal basis to have that data processed by CyberLS.</li>
            </ul>
            <p>
              A Data Processing Agreement (“DPA”) governing CyberLS's obligations as a Data Processor is made available to Business and Enterprise plan customers and forms part of the contractual relationship between CyberLS and the customer.
            </p>

            <h3>3. Information We Collect</h3>
            <p>We collect the following categories of information:</p>
            <ul>
              <li><strong>Account information:</strong> name, email address, organisation name, billing address, and payment details provided when you create a CyberLS account or subscribe to the Service.</li>
              <li><strong>Authentication information:</strong> when you connect your Google Workspace account to CyberLS, we receive an OAuth 2.0 authorisation token from Google. CyberLS does not collect, store, or have access to your Google Workspace password at any point.</li>
              <li><strong>Workspace backup data:</strong> the content of your organisation's Gmail, Google Drive, Calendar, Contacts, Shared Drives, and other Google Workspace data that you authorise CyberLS to back up. This may include personal data relating to your employees, customers, vendors, or other individuals named in that content.</li>
              <li><strong>Usage and technical information:</strong> log data, IP addresses, device and browser information, and activity within the CyberLS dashboard, including backup and restore actions.</li>
              <li><strong>Communications:</strong> information you provide when you contact our support team, request a demo, or otherwise communicate with us.</li>
            </ul>

            <h3>4. How We Use Information</h3>
            <p>We use the information described above to:</p>
            <ul>
              <li>Provide, operate, and maintain the Service, including performing automated backups and enabling restores of your Google Workspace data.</li>
              <li>Process payments and manage your subscription, billing, and account.</li>
              <li>Communicate with you about your account, the Service, support requests, and updates.</li>
              <li>Monitor and improve the security, reliability, and performance of the Service.</li>
              <li>Comply with applicable legal obligations, including under the DPDPA, the DPDP Rules 2025, and CERT-In's directions.</li>
            </ul>
            <p>
              We do not use the content of your Google Workspace backup data for advertising, profiling, or any purpose other than providing the backup and restore service you have instructed us to perform.
            </p>

            <h3>5. How We Store and Protect Information</h3>
            <p>CyberLS applies the following safeguards to information it holds:</p>
            <ul>
              <li>Workspace backup data is encrypted using AES-256 encryption.</li>
              <li>Backup data is stored on infrastructure around the world with option to store in India.</li>
              <li>Access to backup data within CyberLS's systems is restricted on a least-privilege basis, with access logs maintained.</li>
            </ul>

            <h3>6. Data Retention</h3>
            <p>
              We retain account information for as long as your CyberLS account remains active and for a reasonable period thereafter to comply with legal, tax, and accounting obligations.
            </p>
            <p>
              Workspace backup data is retained according to the retention period associated with your subscription plan (for example, 1-year retention on the Starter plan, or unlimited/custom retention on higher plans).
            </p>
            <p>
              Customers can request for permanent deletion of their account. Non payment of services charges also leads to permanent deletion of data.
            </p>

            <h3>7. Your Rights Under the DPDPA</h3>
            <p>
              If you are a Data Principal whose personal data CyberLS processes directly (for example, as an account holder), you have the right to:
            </p>
            <ul>
              <li>Request access to a summary of your personal data and how it is processed.</li>
              <li>Request correction, completion, or updating of inaccurate or incomplete personal data.</li>
              <li>Request erasure of your personal data, subject to our legal and contractual obligations.</li>
              <li>Withdraw consent where processing is based on consent, and to nominate another person to exercise these rights on your behalf in the event of death or incapacity.</li>
              <li>Raise a grievance with our designated grievance contact, and to escalate to the Data Protection Board of India if your grievance is not resolved.</li>
            </ul>
            <p>
              If your personal data appears within a customer's Google Workspace backup data, requests relating to that data should ordinarily be directed to the relevant customer organisation (as the Data Fiduciary), who may in turn instruct CyberLS as their Data Processor.
            </p>

            <h3>8. Grievance Officer / Contact</h3>
            <p>
              <span className="cy-placeholder">Mr. Michael C - Email : Billing@indsoft.net</span>
            </p>

            <h3>9. Cookies and Website Analytics</h3>
            <p>
              We use google analytics as our user tracking and analytics tools (e.g. Google Analytics) are used on the CyberLS marketing website. The usage of such tools is based on the benefits and limitation of Google Analytics.
            </p>

            <h3>10. Children's Data</h3>
            <p>
              The Service is intended for business use by organisations and is not directed at individuals under the age of 18. We do not knowingly collect personal data directly from children. Where backup data incidentally contains personal data relating to a minor (for example, in an email), the customer organisation remains responsible for ensuring lawful processing of such data.
            </p>

            <h3>11. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. We will notify customers of material changes through the Service or by email, and will indicate the date of the most recent update at the top of this Policy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
