'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Building2,
  FileText,
  Globe,
  MessageSquare,
  Mail,
  Loader2,
  Copy,
  Sparkles,
  Info,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const PHASES = [
  {
    id: 1,
    title: 'Business Profile Configuration',
    duration: '~10 min',
    icon: Building2,
    description: 'Configure your business identity - must match IRS records exactly',
    checklist: [
      'Legal Business Name matches IRS records exactly',
      'Business Email uses a branded domain (no Gmail/Yahoo/Outlook)',
      'Physical address entered (no P.O. Box allowed)',
      'Authorized representative info added',
      'Website URL ready (will be verified)',
    ],
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Data Consistency is Critical</p>
              <p className="text-sm text-amber-700 mt-1">
                Carrier systems and human reviewers will cross-reference everything with IRS databases and your website.
                Any discrepancy will trigger a manual review or rejection.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Legal Business Name</h4>
            <p className="text-sm text-gray-600 mb-2">
              Must be an exact match to your IRS Form CP 575 or 147C.
            </p>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <strong>DBA Rule:</strong> If you operate under a different name, format as: <br />
              <code className="bg-blue-100 px-1 rounded">[Legal Name] DBA [Brand Name]</code>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Business Email</h4>
            <p className="text-sm text-gray-600 mb-2">
              Use a branded domain email (e.g., info@yourchurch.org)
            </p>
            <div className="p-3 bg-red-50 rounded-lg text-sm text-red-800">
              <strong>Rejection Trigger:</strong> Free email domains (@gmail.com, @yahoo.com, @outlook.com)
              will result in automatic rejection for registered organizations.
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Business Address</h4>
            <p className="text-sm text-gray-600 mb-2">
              Enter your official registered physical address.
            </p>
            <div className="p-3 bg-red-50 rounded-lg text-sm text-red-800">
              <strong>Strictly Prohibited:</strong> P.O. Boxes are not allowed and will cause immediate rejection.
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Authorized Representative</h4>
            <p className="text-sm text-gray-600 mb-2">
              Use your real name, title, phone number, and email.
            </p>
            <div className="p-3 bg-purple-50 rounded-lg text-sm text-purple-800">
              <strong>Important:</strong> You'll be required to verify this email via a PIN code. Have immediate access to this inbox.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'Building the Compliance Website',
    duration: '~20 min',
    icon: Globe,
    description: 'Create a compliant website with Home, Privacy Policy, and Terms pages',
    checklist: [
      'Website has 3 pages: Home, Privacy Policy, Terms & Conditions',
      'Home page has logo, business name, headline, opt-in form',
      'Footer includes legal name, address, and links to policies',
      'About Us or Services section included',
      'All pages are live with active SSL (https)',
    ],
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-purple-800">Why This Matters</p>
              <p className="text-sm text-purple-700 mt-1">
                Carriers manually review your website to verify your business is real and the opt-in process is compliant.
                A single-page site with just a form is a red flag.
              </p>
            </div>
          </div>
        </div>

        <h4 className="font-semibold text-gray-900">Required Page Structure</h4>
        
        <div className="grid gap-4">
          <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <h5 className="font-semibold text-gray-900">/home - Main Landing Page</h5>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 ml-10">
              <li>• Header with church logo and name</li>
              <li>• Clear headline explaining your ministry</li>
              <li>• Embedded opt-in form (created in Phase 3)</li>
              <li>• "About Us" or "Our Ministry" section</li>
              <li>• Footer with legal name, address, policy links</li>
            </ul>
          </div>

          <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <h5 className="font-semibold text-gray-900">/privacy-policy</h5>
            </div>
            <p className="text-sm text-gray-600 ml-10">
              Must include required data-sharing paragraph (template in Phase 4)
            </p>
          </div>

          <div className="p-4 border-2 border-amber-200 rounded-lg bg-amber-50/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <h5 className="font-semibold text-gray-900">/terms-and-conditions</h5>
            </div>
            <p className="text-sm text-gray-600 ml-10">
              Must include Carrier Liability and Opt-Out clauses
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Discovery Path Requirement:</strong> The opt-in page must be physically linked from your main website
            (e.g., in the footer). Carriers require this to verify brand legitimacy.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'Creating the Opt-In Form',
    duration: '~15 min',
    icon: FileText,
    description: 'Build the form with strict 2026 dual-checkbox consent rules',
    checklist: [
      'Form has Name, Email, and Phone Number fields',
      'Two SEPARATE consent checkboxes (marketing + non-marketing)',
      'Checkboxes are NOT pre-selected/checked',
      'Checkboxes are NOT marked as required',
      'Disclaimer below submit button links to Privacy Policy and Terms',
    ],
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Strict Rules - Violation = Instant Rejection</p>
              <ul className="text-sm text-red-700 mt-1 space-y-1">
                <li>• Checkboxes CANNOT be pre-selected (checked by default)</li>
                <li>• Checkboxes CANNOT be marked as "Required"</li>
                <li>• User must be able to submit form without agreeing to SMS</li>
              </ul>
            </div>
          </div>
        </div>

        <h4 className="font-semibold text-gray-900">Required Checkbox #1 - Marketing Consent</h4>
        <CopyableTemplate text={'I consent to receive marketing text messages, about special offers, discounts, and service updates, from [Church Name] at the phone number provided. Message frequency may vary. Message & data rates may apply. Text HELP for assistance, reply STOP to opt out.'} />

        <h4 className="font-semibold text-gray-900">Required Checkbox #2 - Non-Marketing Consent</h4>
        <CopyableTemplate text={'I consent to receive non-marketing text messages from [Church Name] about service times, event reminders, and ministry updates. Message frequency may vary, message & data rates may apply. Text HELP for assistance, reply STOP to opt out.'} />

        <h4 className="font-semibold text-gray-900">Disclaimer Below Submit Button</h4>
        <CopyableTemplate text={'By submitting this form, you agree to our Terms & Conditions and Privacy Policy.'} />
        <p className="text-sm text-gray-500 italic">Both "Terms & Conditions" and "Privacy Policy" must be hyperlinked to their respective pages.</p>
      </div>
    ),
  },
  {
    id: 4,
    title: 'Legal Documents',
    duration: '~15 min',
    icon: FileText,
    description: 'Privacy Policy & Terms of Service with required verbatim clauses',
    checklist: [
      'Privacy Policy includes verbatim data-sharing paragraph',
      'Terms include Carrier Liability clause',
      'Terms include Opt-Out & Support clause',
      'Both documents are published and accessible',
    ],
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">These Clauses Must Appear Verbatim</p>
              <p className="text-sm text-amber-700 mt-1">
                Do not paraphrase or modify these clauses. Copy them exactly as written.
              </p>
            </div>
          </div>
        </div>

        <h4 className="font-semibold text-gray-900">Privacy Policy - Data Sharing Clause</h4>
        <CopyableTemplate text={'No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. Information sharing to subcontractors in support services, such as customer service, is permitted. All other use case categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.'} />

        <h4 className="font-semibold text-gray-900">Terms of Service - Carrier Liability Clause</h4>
        <CopyableTemplate text={'Carriers are not liable for delayed or undelivered messages.'} />

        <h4 className="font-semibold text-gray-900">Terms of Service - Opt-Out & Support Clause</h4>
        <CopyableTemplate text={'You can cancel the SMS service at any time by texting STOP. For assistance, text HELP or contact [Your Support Email]. Message frequency varies. Message and data rates may apply.'} />
      </div>
    ),
  },
  {
    id: 5,
    title: 'Domain Connection',
    duration: '~10 min',
    icon: Globe,
    description: 'Link your domain via DNS with active SSL certificate',
    checklist: [
      'Domain or subdomain connected to landing page',
      'SSL certificate is active (https with padlock)',
      'All 3 pages load correctly',
      'Opt-in page is accessible from main website footer',
    ],
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Subdomain Best Practice:</strong> Use a subdomain for your opt-in landing page
            (e.g., <code className="bg-blue-100 px-1 rounded">sms.yourchurch.org</code> or 
            <code className="bg-blue-100 px-1 rounded">join.yourchurch.org</code>).
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Step 1: Configure DNS</h4>
            <p className="text-sm text-gray-600">
              Add the required A Record or CNAME to your domain provider (GoDaddy, Cloudflare, Namecheap, etc.)
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Step 2: Verify Connection</h4>
            <p className="text-sm text-gray-600">
              After adding DNS records, wait for propagation (usually 5-30 minutes) and verify the connection.
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Step 3: Confirm SSL</h4>
            <p className="text-sm text-gray-600">
              Ensure the SSL certificate is active - you should see a padlock icon in the browser address bar.
            </p>
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Final Verification:</strong> Visit your landing page URL and confirm:
          </p>
          <ul className="text-sm text-green-700 mt-2 space-y-1">
            <li>✓ Page loads with https (padlock visible)</li>
            <li>✓ Opt-in form works correctly</li>
            <li>✓ Links to Privacy Policy and Terms work</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: 'Trust Center Registration',
    duration: '~20 min',
    icon: Shield,
    description: 'Submit brand details, campaign info, sample messages & opt-in proof',
    checklist: [
      'Business data verified and matches Phase 1 exactly',
      'Email verification completed via PIN code',
      'Volume tier selected (Low Volume for most churches)',
      'Campaign use case description written',
      'Sample messages provided with brand name and STOP/HELP',
      'Opt-in method selected (Website Form) with URL',
      'Opt-in process description completed',
    ],
    content: (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Campaign Use Case Description Template</h4>
        <CopyableTemplate text={'This campaign is used by [Church Legal Name] to communicate with congregation members and visitors who have opted-in via our website form. Messages are sent to provide service time reminders, event notifications, and ministry updates. Additionally, we may send occasional messages regarding church programs and volunteer opportunities to interested members.'} />

        <h4 className="font-semibold text-gray-900">Sample Message #1 - Event/Reminder</h4>
        <CopyableTemplate text={'Hello [Contact Name], this is [Church Name]. Our Sunday service is at [Time] this week. We hope to see you there! Reply STOP to opt out or HELP for assistance.'} />

        <h4 className="font-semibold text-gray-900">Sample Message #2 - Ministry Update</h4>
        <CopyableTemplate text={'[Church Name] Update: Our [Event Name] is coming up on [Date]. Registration is now open at [URL]. Reply STOP to unsubscribe or HELP for help.'} />

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Checkboxes in Trust Center:</strong> Select "Embedded link" and "Phone number" if your messages may contain these. 
            Only select "Age-gated content" or "Financial content" if specifically applicable.
          </p>
        </div>

        <h4 className="font-semibold text-gray-900">Opt-In Process Description Template</h4>
        <CopyableTemplate text={'End-users opt-in by visiting our website at [Your Landing Page URL] and filling out our contact form. The form contains two distinct, optional, and non-pre-selected checkboxes allowing the user to explicitly consent to either marketing messages, non-marketing messages, or both. Links to our Privacy Policy and Terms of Service are provided at the point of data entry.'} />

        <h4 className="font-semibold text-gray-900">Opt-In Confirmation Message</h4>
        <CopyableTemplate text={'You are now successfully subscribed to receive updates from [Church Name]. Message frequency varies. Msg & Data rates may apply. Reply STOP to unsubscribe, HELP for help.'} />
      </div>
    ),
  },
  {
    id: 7,
    title: 'Final Submission & Review',
    duration: '~5 min',
    icon: CheckCircle2,
    description: 'Double-check everything, submit, and monitor approval status',
    checklist: [
      'All data reviewed for typos (URLs, emails, names)',
      'All compliance acknowledgment boxes checked',
      'Submitted and status shows "Pending"',
    ],
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Final Submission Checklist</p>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>□ Business Profile data matches IRS records exactly</li>
                <li>□ Compliance website is live with all 3 pages published</li>
                <li>□ Opt-in form has two separate, optional, non-pre-checked checkboxes</li>
                <li>□ Privacy Policy contains the verbatim data-sharing paragraph</li>
                <li>□ Terms contain Carrier Liability and Opt-Out clauses</li>
                <li>□ Domain is connected with active SSL</li>
                <li>□ Email verification completed in Trust Center</li>
                <li>□ Campaign description, sample messages, and opt-in process filled</li>
                <li>□ All URLs and email addresses double-checked for typos</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">What Happens Next?</h4>
          <p className="text-sm text-blue-700">
            The manual vetting process typically takes <strong>7 to 14 business days</strong>. 
            You can monitor the status in your provider's Trust Center. If rejected, review the 
            rejection reason carefully and correct the specific issue before resubmitting.
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-2">Common Rejection Reasons</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Business name doesn't match IRS records</li>
            <li>• Using free email domain (Gmail, Yahoo, etc.)</li>
            <li>• P.O. Box used as business address</li>
            <li>• Pre-checked or required consent checkboxes</li>
            <li>• Missing Privacy Policy data-sharing clause</li>
            <li>• Sample messages missing STOP/HELP keywords</li>
            <li>• Website not accessible or missing SSL</li>
          </ul>
        </div>
      </div>
    ),
  },
];

function CopyableTemplate({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="relative p-4 bg-gray-50 border rounded-lg group">
      <p className="text-sm text-gray-700 pr-10">{text}</p>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Copy to clipboard"
      >
        {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function A2PGuidePage() {
  const { data: session } = useSession() || {};
  const [expandedPhase, setExpandedPhase] = React.useState<number | null>(1);
  const [loadingA2P, setLoadingA2P] = React.useState(false);

  const handleA2PCheckout = async () => {
    setLoadingA2P(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'a2p',
          email: session?.user?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setLoadingA2P(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/compliance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back to Compliance
            </Button>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <Badge className="mb-2 bg-blue-100 text-blue-700">2026 Compliance Guidelines</Badge>
            <h1 className="text-2xl font-semibold text-gray-900">A2P 10DLC Registration Guide</h1>
            <p className="text-gray-500 mt-1">
              Complete walkthrough for registering your church for A2P 10DLC messaging
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Estimated time: ~90 minutes</span>
          </div>
        </div>

        {/* Help CTA */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Need Help? Let Us Handle It</p>
                  <p className="text-sm text-gray-600">
                    A2P registration is complex. We'll submit your brand and campaign and get you approved in 7-14 days.
                  </p>
                </div>
              </div>
              <Button
                variant="gold"
                onClick={handleA2PCheckout}
                disabled={loadingA2P}
                className="shrink-0"
              >
                {loadingA2P ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <>Get Help for $197 <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip A2P CTA */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-0">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Skip A2P Registration Entirely</p>
                  <p className="text-sm text-slate-300">
                    Church Posting Blue uses iMessage + RCS which doesn't require A2P registration. Get 92% reply rates.
                  </p>
                </div>
              </div>
              <Button variant="gold" asChild className="shrink-0">
                <Link href="/blue">
                  Learn About Blue <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Phases */}
        <div className="space-y-4">
          {PHASES.map((phase) => (
            <Card key={phase.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                className="w-full text-left"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <phase.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Phase {phase.id}</Badge>
                          <span className="text-sm text-gray-500">{phase.duration}</span>
                        </div>
                        <CardTitle className="mt-1">{phase.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{phase.description}</p>
                      </div>
                    </div>
                    {expandedPhase === phase.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
              </button>
              
              {expandedPhase === phase.id && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4 mt-2">
                    {/* Checklist */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Checklist</h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {phase.checklist.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <div className="h-5 w-5 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Detailed Instructions</h4>
                      {phase.content}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
              A2P registration can be time-consuming and rejections are common. Let Church Posting handle it for you and get approved faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="gold"
                size="lg"
                onClick={handleA2PCheckout}
                disabled={loadingA2P}
              >
                {loadingA2P ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <>Get Professional A2P Registration - $197 <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
              <span className="text-gray-500">or</span>
              <Button variant="outline" size="lg" asChild>
                <Link href="/blue">
                  Skip A2P with Church Posting Blue
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
