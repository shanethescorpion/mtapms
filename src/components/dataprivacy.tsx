import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  markdownText: string;
}

export function MarkdownRenderer({ markdownText }: MarkdownRendererProps) {
  return (
    <div className="markdown-container">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownText}</ReactMarkdown>
    </div>
  )
}

/* Terms and Conditions (using Markdown language) */
export const dataPrivacyAct = /*markdown*/`
# **Terms and Conditions Agreement on Data Privacy**

**Effective Date**: _[Insert Date]_

Welcome to **[Your Company/Organization Name]**! By accessing or using our services, you agree to the following Terms and Conditions regarding data privacy. Please read them carefully.

---

## **1. Data Collection and Usage**
1. We collect personal information, such as **name**, **email**, **contact details**, and any other data you provide, to deliver and improve our services.
2. Usage data, such as **IP address**, **browser type**, and **usage patterns**, may be collected automatically to analyze service performance and ensure security.
3. By using our services, you consent to the collection, processing, and storage of your data as described in our Privacy Policy.

---

## **2. Purpose of Data Processing**
We process your data to:
- Provide and enhance our services.
- Communicate important updates or promotions _(with your consent)_.
- Comply with legal obligations.
- Prevent fraud or unauthorized access.

---

## **3. Data Sharing and Disclosure**
1. We do **not** sell, trade, or rent your personal information to third parties.
2. We may share your data with trusted service providers or partners solely for operational purposes, provided they comply with strict confidentiality agreements.
3. Data may be disclosed to legal authorities if required by law or to protect our rights and interests.

---

## **4. Data Security**
1. We implement robust security measures, including **encryption**, **secure servers**, and **access controls**, to protect your data from unauthorized access, alteration, or destruction.
2. Despite our best efforts, no method of electronic storage or transmission is 100% secure. By using our services, you acknowledge this inherent risk.

---

## **5. Your Rights**
You have the right to:
- Access your personal data and request a copy.
- Request correction or deletion of your data.
- Withdraw consent for specific data processing activities.
- Lodge a complaint with a data protection authority if you believe your rights are violated.

_To exercise your rights, please contact us at_ **[Insert Contact Information]**.

---

## **6. Retention of Data**
We retain personal data only for as long as necessary to fulfill the purposes outlined in this agreement or comply with legal obligations. Once no longer required, we securely delete or anonymize the data.

---

## **7. Cookies and Tracking Technologies**
We use **cookies** and similar technologies to improve user experience and analyze website performance. By using our website, you consent to the use of cookies as detailed in our [Cookie Policy](#).

---

## **8. Updates to this Agreement**
We may update this agreement from time to time to reflect changes in laws or business practices. Any updates will be posted on our website, and we encourage you to review them periodically.

---

## **9. Contact Us**
If you have questions or concerns about this agreement or how we handle your data, please contact us:
- **Email**: [Insert Email Address]
- **Phone**: [Insert Phone Number]
- **Address**: [Insert Office Address]

---

**By using our services, you agree to these terms. If you do not agree, please discontinue use immediately.**

`


export function DataPrivacyAct() {
  return <MarkdownRenderer markdownText={dataPrivacyAct} />
}