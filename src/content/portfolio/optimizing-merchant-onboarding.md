---
title: "Optimizing Merchant Onboarding Through Automated KYC Verification Pipelines"
excerpt: "How Protize streamlined merchant onboarding using AI-based KYC verification and automated document workflows to reduce onboarding time by 85%."
pubDate: 2025-11-06
updatedDate: 2025-11-06
author: "Protize Engineering Team"
tags: ["KYC", "Automation", "AI", "Fintech", "Onboarding"]
category: "Process Automation"
featured: true
draft: false
coverImage: "https://images.unsplash.com/photo-1605165566807-508fb529cf3e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
coverAlt: "Automated KYC verification dashboard"
---

# Optimizing Merchant Onboarding Through Automated KYC Verification Pipelines

As Protize expanded its merchant base across fintech and gaming sectors, manual onboarding processes began to hinder growth. Traditional document verification — involving GST certificates, PAN cards, and incorporation proofs — created friction, delays, and human errors. To address this, the engineering team built an **automated KYC verification pipeline** that leverages AI, OCR, and microservices for faster and more accurate onboarding.

---

## 1. Problem Statement

Before automation, onboarding a single merchant could take anywhere between **48 to 72 hours**.  
Manual verification involved cross-checking documents across multiple government APIs, leading to delays and inconsistent approvals.  
Additionally, verifying document authenticity required manual intervention and risked compliance errors.

---

## 2. Objectives

The team set out to:  

1. Automate 95% of KYC checks.  
2. Integrate multiple government and banking APIs seamlessly.  
3. Reduce onboarding time to under 6 hours.  
4. Maintain complete audit trails for compliance review.

---

## 3. Technology Stack

- **NestJS** — orchestrating the backend KYC pipeline.  
- **AWS Textract** — for OCR-based document data extraction.  
- **PostgreSQL** — centralized merchant data repository.  
- **Redis + BullMQ** — asynchronous KYC job queue.  
- **AWS Lambda** — running lightweight validation and API checks.  
- **Slack API + Telegram Bots** — notifying internal risk teams of flagged merchants.  

---

## 4. Pipeline Architecture

The onboarding workflow is divided into distinct asynchronous stages:

1. **Document Upload & Prevalidation** — validates file type, size, and format.  
2. **OCR Data Extraction** — uses AWS Textract to extract PAN, GST, and Incorporation numbers.  
3. **External API Validation** — cross-verifies IDs with government registries (GSTIN, MCA, NSDL).  
4. **AI Risk Scoring** — calculates confidence levels based on document patterns.  
5. **Final Human Review (Optional)** — required only if confidence < 95%.  

Each step emits structured logs to a centralized dashboard built with **Tremor UI**.

---

## 5. Database Design

PostgreSQL tables were optimized with JSONB fields for storing flexible KYC data schemas.  
Sensitive documents were encrypted using AES-256 at rest, with S3 pre-signed URLs for temporary access.  
Each merchant record maintains a full event trail of status transitions — `uploaded → verified → approved → live`.

---

## 6. Queue Management and Retry Logic

All KYC verification tasks are dispatched as **BullMQ jobs**, grouped by merchant ID.  
Retries follow an exponential backoff pattern, ensuring resilience during API rate limits or failures.  
Failed jobs trigger instant Slack alerts tagged to the responsible compliance engineer.

---

## 7. Security and Compliance Enhancements

Protize implemented:  
- End-to-end encryption for all document uploads.  
- Role-based access for verification teams.  
- AWS CloudTrail logging for every API invocation.  
- GDPR and RBI compliance validations built into the workflow.

---

## 8. Integration with Merchant Dashboard

Once verification is complete, the results sync automatically to the **Protize Merchant Portal** via WebSockets.  
Merchants receive live updates — “Documents Under Review,” “KYC Approved,” or “Additional Info Required.”  
This improved transparency reduced support tickets by 60%.

---

## 9. Observability and Reporting

Prometheus metrics expose average verification times, API success ratios, and OCR accuracy rates.  
A daily report — generated via **Python + Streamlit** — summarizes KYC throughput and error breakdowns.

---

## 10. Results

| Metric | Before Automation | After Automation |
|--------|--------------------|------------------|
| Avg Onboarding Time | 48–72 hours | 5.5 hours |
| Manual Effort | 100% | 15% |
| Error Rate | 8% | 0.6% |
| Merchant Activation Rate | 65% | 92% |

---

## 11. Lessons Learned

1. Standardizing document templates simplifies OCR accuracy.  
2. Real-time feedback loops between AI and compliance teams reduce false positives.  
3. Automation must be complemented with transparent manual overrides.  
4. Integration testing with live government APIs is critical before production rollout.

---

## 12. Conclusion

Through automation, Protize transformed merchant onboarding from a manual, time-intensive process into an intelligent, scalable pipeline.  
The KYC system now verifies hundreds of merchants daily without human bottlenecks, maintaining compliance and boosting user satisfaction.  
This initiative serves as the foundation for our **next-gen onboarding platform**, which will include biometric verification and risk-based scoring.

---

*Authored by the Protize Engineering Team — November 2025.*
