import React from "react";

export const metadata = {
  title: "Terms of Service — CyberLS",
  description:
    "Terms of service and contract guidelines for using CyberLS Google Workspace backup service.",
};

export default function TermsAndConditionsPage() {
  return (
    <main>
      <section className="cy-legal-hero">
        <div className="cy-legal-hero__bg" />
        <div className="cy-container">
          <h1 className="cy-legal-hero__title">Terms of Service</h1>
          <p className="cy-legal-hero__meta">A division of Indsoft Systems</p>
        </div>
      </section>

      <section className="cy-legal-content">
        <div className="cy-container">
          <div className="cy-legal-doc cy-glass">
            <h3 style={{ marginTop: 0 }}>1. Acceptance of Terms</h3>
            <p>
              These Terms of Service (“Terms”) govern your access to and use of
              CyberLS, a division of Indsoft Systems (“CyberLS”, “we”, “us”, or
              “our”), including our website and Google Workspace backup service
              (the “Service”). By creating an account, starting a free trial, or
              otherwise using the Service, you agree to be bound by these Terms.
            </p>

            <h3>2. Description of the Service</h3>
            <p>
              CyberLS provides an independent, automated backup service for
              Google Workspace, covering Gmail, Google Drive, Calendar,
              Contacts, Shared Drives, and related applications as described on
              our website. The Service connects to your Google Workspace account
              via Google's OAuth 2.0 authorisation protocol and creates
              encrypted backups of your data on a schedule determined by your
              subscription plan.
            </p>
            <p>
              CyberLS is an independent backup product. It is not affiliated
              with, endorsed by, or a representative of Google LLC.
            </p>

            <h3>3. Accounts and Eligibility</h3>
            <ul>
              <li>
                You must be authorised to act on behalf of your organisation and
                to grant CyberLS access to your Google Workspace environment in
                order to create an account.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                CyberLS account credentials and for all activity that occurs
                under your account.
              </li>
              <li>
                You agree to provide accurate and current information when
                creating an account and when making any payment.
              </li>
            </ul>

            <h3>4. Subscription Plans, Pricing, and Billing</h3>
            <p>
              CyberLS offers subscription plans as described on our pricing
              page, including a free 14-day trial that does not require a credit
              card. As of the date of this document, published pricing is as
              follows; current pricing at the time of purchase, as shown on our
              pricing page, will always govern:
            </p>
            <ul>
              <li>All fees are quoted and billed in Indian Rupees (INR).</li>
              <li>
                Subscriptions renew automatically for successive billing periods
                unless cancelled in accordance with Section 7.
              </li>
              <li>
                Applicable taxes, including GST, will be added to invoices in
                accordance with Indian tax law.
              </li>
            </ul>

            <h3>5. Refunds</h3>
            <p>
              At first activation, we offer a 30 day refund policy. Any refunds
              policy post 30 days are subject to approval from the management
              pro-rata on a case to case basis.
            </p>

            <h3>6. Your Responsibilities</h3>
            <p>As a customer, you agree that:</p>
            <ul>
              <li>
                You have the necessary rights, consents, and legal basis to
                authorise CyberLS to access and back up the data contained in
                your Google Workspace environment, including any personal data
                of your employees, customers, or other individuals.
              </li>
              <li>
                You remain the Data Fiduciary (as defined under the DPDPA) in
                respect of personal data contained within your Workspace backup
                data, and CyberLS acts as your Data Processor in accordance with
                the Data Processing Agreement applicable to your plan.
              </li>
              <li>
                You will not use the Service for any unlawful purpose or in
                violation of Google's terms of service applicable to your
                Workspace account.
              </li>
              <li>
                You are responsible for maintaining appropriate administrative
                access controls over who within your organisation can configure,
                pause, or restore backups via CyberLS.
              </li>
            </ul>

            <h3>7. Cancellation and Termination</h3>
            <ul>
              <li>
                You may cancel your subscription at any time through your
                account settings or by contacting support; cancellation will
                take effect at the end of your current billing period unless
                otherwise stated.
              </li>
              <li>
                CyberLS may suspend or terminate access to the Service if you
                breach these Terms, fail to pay applicable fees, or if required
                to do so by law or by a competent authority.
              </li>
              <li>
                Upon termination, CyberLS will handle your backup data in
                accordance with the retention and deletion process described in
                our Privacy Policy.
              </li>
            </ul>

            <h3>8. Service Availability and Limitations</h3>
            <p>
              CyberLS will use reasonable efforts to provide the Service in
              accordance with the features described for your subscription plan,
              including backup frequency and retention period. CyberLS does not
              guarantee uninterrupted or error-free operation of the Service.
            </p>

            <h3>9. Intellectual Property</h3>
            <p>
              CyberLS and its licensors retain all right, title, and interest in
              and to the Service, including all software, branding, and
              documentation. These Terms do not grant you any rights to
              CyberLS's intellectual property except the limited right to use
              the Service in accordance with these Terms. You retain all rights
              to your own data, including the Google Workspace data backed up
              through the Service.
            </p>

            <h3>10. Disclaimers and Limitation of Liability</h3>
            <p>
              The Service is provided on an “as is” and “as available” basis.
              While CyberLS is designed to provide reliable backup and recovery
              of your Google Workspace data, CyberLS does not guarantee that
              data loss, corruption, or service interruption will never occur.
              The maximum liability of CyberLS, IndSoft systems would be limited
              to 12 months charges paid by the client in previous year. The
              client accept to not claim any further damages direct or indirect
              caused due to such activities.
            </p>

            <h3>11. Indemnification</h3>
            <p>
              You agree to indemnify and hold CyberLS harmless from any claims,
              damages, or expenses arising from your breach of these Terms, your
              violation of applicable law, or your lack of authorisation to
              grant CyberLS access to the data backed up through the Service.
            </p>

            <h3>12. Governing Law and Dispute Resolution</h3>
            <p>
              <span className="cy-placeholder">
                The Governing law (expected to be the laws of India) and
                specific to Mumbai, Maharashtra, Any disputes are first subject
                to arbitration
              </span>
            </p>

            <h3>13. Changes to These Terms</h3>
            <p>
              We may update these Terms from time to time. We will notify
              customers of material changes through the Service or by email.
              Continued use of the Service after such changes constitutes
              acceptance of the updated Terms.
            </p>

            <h3>14. Contact</h3>
            <p>
              The official Email address for communication is{" "}
              <span className="cy-placeholder">mktg@indsoft.net</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
