# CogniTill
## Investor Pitch Document — Pre-Seed Round

**Confidential | April 2026**

---

> *"The repair shop industry runs on paper tickets and gut instinct. CogniTill changes that."*

---

## Table of Contents

1. Executive Summary
2. The Problem
3. Our Solution
4. Product Walkthrough
5. Market Opportunity
6. Competitive Landscape
7. Business Model & Unit Economics
8. Go-to-Market Strategy
9. Traction & Key Metrics
10. Technology & Platform Architecture
11. The Team
12. Financial Projections (5-Year)
13. The Ask & Use of Funds
14. Risks & Mitigations
15. Vision & Roadmap
16. Appendix

---

## 1. Executive Summary

**CogniTill** is an AI-powered, cloud-based Point-of-Sale (POS) and shop management platform purpose-built for mobile device repair businesses. We replace the fragmented patchwork of paper tickets, generic POS systems, and manual spreadsheets that the $4.7B device repair industry still relies on today.

Our platform unifies repair intake, inventory management, sales processing, end-of-day reconciliation, and business intelligence into a single, role-aware system — with embedded AI that predicts stock needs, generates marketplace listings, and flags operational anomalies before they become problems.

**The opportunity is clear:** There are approximately 67,000 independent mobile repair shops in North America. None of the dominant POS players (Square, Lightspeed, Shopify) were built for repair workflows. Vertical-specific tools like RepairDesk are expensive, bloated, and built for enterprise chains — leaving the SMB segment underserved and paying too much for too little.

**CogniTill targets the 95% of repair shops with 1–5 locations** that need a purpose-built solution at a price point they can actually afford.

| Metric | Value |
|---|---|
| Target Market (SAM) | 34,000 shops (North America) |
| Addressable Revenue (SAM) | $50M+ ARR at full penetration |
| Pricing | $49 / $99 / $149 per month |
| Revenue Model | SaaS subscription + optional add-ons |
| Stage | Pre-Seed |
| Round Size | $500,000 |

---

## 2. The Problem

### 2.1 The Repair Shop Operator Is Being Failed

The mobile device repair industry is growing — but the tools powering it have not kept pace. Shop owners are duct-taping together 4–6 disconnected tools to run their daily operations: a generic POS for sales, a paper logbook for repairs, a spreadsheet for inventory, a separate voucher portal for insurance claims, and a manual cash count at close.

Every one of these touch points creates friction, waste, and lost revenue.

We conducted in-depth research with three operators at a Metro Vancouver repair shop. Their feedback revealed **22 distinct pain points** across four categories: functional gaps, emotional burden, usability failures, and process inefficiency.

---

### 2.2 Who We Talked To

**Danees** — Shop Owner / Admin
> *"I am paying more every month for features I don't even use, and the ones I actually need, the system doesn't have."*

Danees manages a multi-staff operation and needs visibility into every repair, sale, and reconciliation without being physically present. His current tools force him to piece together reports from three different systems to get a picture that should be one click away.

**Kiran** — Manager / Inventory Lead
> *"After every iGen delivery I have to search for every single product one by one and update the quantity. It takes me 45 minutes every time."*

Kiran manages incoming stock, monitors low inventory, and handles returns. His current system has no bulk update capability, no velocity tracking, and no early warning before items go out of stock.

**Waseem** — Front-Desk Employee / Sales
> *"At the end of the day I have to open the voucher website, check every sale, match it to the POS, then check Clover, then count the till. By the time I am done it is almost an hour."*

Waseem handles customer intake, sales, and end-of-day close. He navigates three separate systems nightly to reconcile cash — a process that takes 45–60 minutes, is prone to human error, and generates unnecessary stress.

---

### 2.3 The 22 Pain Points (Summary)

**Functional (F1–F8)**
- No unified repair tracking tied to sales
- No bulk inventory update on delivery
- Manual, multi-system EOD reconciliation
- No role-based access — everyone sees everything
- No automated customer notification on repair completion
- No AI-assisted pricing or stock forecasting
- No integrated insurance voucher reconciliation
- No digital repair intake (paper tickets still used)

**Emotional (E1–E4)**
- Anxiety around cash discrepancies at close
- Frustration from repetitive manual data entry
- Stress from lack of real-time visibility for owners
- Loss of confidence in data accuracy

**Usability (U1–U5)**
- UI not optimized for high-volume front-desk use
- No PIN-based customer pickup verification
- No guided workflows — relies on staff memory
- Mobile-unfriendly interfaces
- No audit trail for edits or overrides

**Process Inefficiency (P1–P5)**
- Repair status updates communicated verbally
- Inventory shortages discovered mid-repair
- End-of-day takes 45–60 minutes per shift
- Insurance voucher matching done manually
- No data to support purchasing or staffing decisions

---

### 2.4 Root Causes

Five root causes drive the majority of the 22 pain points:

1. **Tool fragmentation** — no single system owns the repair lifecycle
2. **Generic POS design** — tools built for retail don't understand "repair" as a workflow
3. **No automation** — notifications, reorders, and reconciliation all require manual effort
4. **No AI or intelligence layer** — operators make decisions without data
5. **Enterprise-first pricing** — the tools that do exist are priced for chains, not independents

---

## 3. Our Solution

CogniTill is a purpose-built, AI-enhanced POS and shop management platform that eliminates every one of these pain points in a single, unified system.

### Core Principles

| Principle | What It Means |
|---|---|
| **Repair-Native** | Every workflow is designed around the repair lifecycle, not retail |
| **Role-Aware** | Admin, Manager, and Employee views are distinct and permission-controlled |
| **AI-Assisted** | Intelligence is embedded, not bolted on |
| **Guided by Default** | Wizards and step-by-step flows replace staff memory |
| **Affordable** | Priced for the 1–5 location SMB, not enterprise chains |

### What CogniTill Replaces

| Old Stack | CogniTill Feature |
|---|---|
| Paper repair tickets | Digital intake with PIN-based pickup verification |
| Verbal status updates | 4-stage repair tracker + automated SMS on completion |
| Manual inventory entry | Bulk delivery update + AI stock velocity alerts |
| Clover + voucher portal + spreadsheet | Integrated EOD Close Wizard (5-step guided reconciliation) |
| Generic dashboard | Role-specific dashboards for Owner, Manager, Employee |
| Gut-feel purchasing | AI predictive stock analysis |
| Manual Facebook listings | AI-generated Marketplace titles, descriptions & prices |

---

## 4. Product Walkthrough

### 4.1 Repair Intake & Tracking (F01, F02, F03)

When a customer walks in with a broken device, the staff creates a digital repair ticket in under 60 seconds. The system captures:

- Customer name and contact
- Device type and reported issue
- Quoted price
- A **unique 4-digit pickup PIN** (PIN-based security replaces paper ticket retrieval)

The repair then moves through a **4-stage status pipeline**:

```
Received → In Progress → Complete → Collected
```

When status changes to **Complete**, the system automatically fires an SMS to the customer via Twilio — eliminating the need for a staff member to call.

When the customer arrives to collect, staff verify identity with the PIN. No ticket needed.

### 4.2 Role-Based Dashboards (F04, F05)

Three distinct dashboard views, each showing only what that role needs:

**Admin (Danees):**
- Daily revenue, repair count, payment breakdown
- Inventory alerts and low-stock warnings
- Full audit log and EOD report history
- Team performance overview

**Manager (Kiran):**
- Inventory management with bulk delivery update
- Stock velocity indicators (AI-powered)
- Pending and in-progress repairs
- Supplier order planning

**Employee (Waseem):**
- Repair intake and status updates
- Sales processing (Cash / Debit / Credit / Voucher)
- Discount and tax controls
- End-of-day Close Wizard

### 4.3 Inventory Management (F06, F07, F08)

- Every SKU tracked with cost price, sell price, and quantity on hand
- **Low-stock threshold** alerts (configurable per item, default: 5 units)
- **Bulk delivery update**: scan or select items, enter quantity — done in 2 minutes instead of 45
- **AI stock velocity analysis**: identifies fast-moving items, predicts stockout dates, flags overstock

### 4.4 Sales & Payment Processing (F09, F10)

- Full POS for accessory and device sales
- Payment modes: Cash, Debit, Credit
- Discount support (amount or percentage)
- Tax toggle per transaction
- Insurance voucher reconciliation (F10) — match voucher to sale in one step

### 4.5 Close Wizard — Guided EOD Reconciliation (F11)

The most requested feature from our research. A **5-step guided workflow** that takes Waseem from 60 minutes to under 10:

```
Step 1: Count physical cash by denomination
Step 2: System calculates expected cash (opening float + cash sales)
Step 3: Display variance — flag discrepancies instantly
Step 4: Remove float ($200 standard), calculate deposit
Step 5: Generate and submit EOD report
```

The Close Wizard eliminates the multi-system shuffle. Everything is in one place.

### 4.6 AI Features (F12, F13)

**AI Stock Velocity (F12)**
- Analyzes historical sales patterns per SKU
- Predicts days-until-stockout
- Surfaces reorder recommendations before shortages occur

**AI Marketplace Listing Generator (F13)**
- Staff selects a device from inventory
- AI generates a complete Facebook Marketplace listing: title, description, suggested price
- Reduces listing time from 10+ minutes to under 60 seconds

---

## 5. Market Opportunity

### 5.1 Industry Context

Mobile device repair is a resilient, growing market. Device ownership is universal, repair is often more cost-effective than replacement, and independent repair shops benefit from the Right to Repair movement expanding their addressable repair pool.

| Market Segment | Data |
|---|---|
| Global mobile device repair market (2025) | $4.7B |
| Projected CAGR (2025–2030) | 6.8% |
| Repair shops in North America | ~67,000 |
| Shops with 1–5 locations (SMB target) | ~63,650 (95%) |
| Average current POS spend (SMB) | $100–$200/month |

### 5.2 TAM — Total Addressable Market

All repair shops globally that could benefit from a POS system:

- **~150,000 shops worldwide**
- At $99/month average: **$178M ARR**

### 5.3 SAM — Serviceable Addressable Market

English-language markets with digital infrastructure (North America, UK, Australia) where we can realistically sell and support:

- **~34,000 shops**
- At $99/month average: **$40M ARR**

### 5.4 SOM — Serviceable Obtainable Market

Year 1–3 target: Canadian market entry, expand to US Pacific Coast

- **~2,000 shops (Year 3 target)**
- At $89/month blended: **$2.1M ARR**

```
TAM  ████████████████████████████████████████  $178M
SAM  ████████████████                          $40M
SOM  ██                                        $2.1M
```

### 5.5 Why Now

- **Right to Repair legislation** (Canada, US) expanding the addressable repair market
- **AI API costs falling** — making embedded AI economically viable for SMB pricing
- **Post-COVID digitization** — paper-based operators now actively seeking modern alternatives
- **iGen / Wireless Vision / CPR expansion** — franchise chains validating the category

---

## 6. Competitive Landscape

### 6.1 The Competitor Map

| Feature | RepairDesk | Lightspeed | RepairShopr | Square | Shopify POS | **CogniTill** |
|---|---|---|---|---|---|---|
| Repair-native workflow | Yes | No | Yes | No | No | **Yes** |
| Role-based access | Partial | Yes | Partial | No | Partial | **Yes** |
| Bulk inventory update | No | Yes | No | No | Yes | **Yes** |
| Guided EOD reconciliation | No | No | No | No | No | **Yes** |
| AI stock velocity | No | No | No | No | No | **Yes** |
| AI marketplace listing | No | No | No | No | No | **Yes** |
| SMS on repair completion | Yes | No | Yes | No | No | **Yes** |
| PIN-based pickup | No | No | No | No | No | **Yes** |
| SMB-friendly pricing | No | No | Partial | Yes | Yes | **Yes** |
| Built for 1–5 locations | No | No | Partial | Yes | Yes | **Yes** |

### 6.2 Competitor Profiles

**RepairDesk** — Closest vertical competitor. Feature-rich but priced for enterprise chains ($75–$300+/month), complex UI, and steep onboarding curve. Not designed for the SMB independent operator.

**Lightspeed** — Powerful retail POS with no repair-specific workflows. Requires heavy customization. Pricing starts at $89/month but escalates with add-ons.

**RepairShopr** — Similar to RepairDesk. Targeted at multi-location MSPs and IT shops, not the 1–3 location mobile repair operator. UI is dated.

**Square** — Affordable and widely adopted, but zero repair-native features. Operators must build their own workflows on top of a generic system.

**Shopify POS** — Retail-first. No repair tracking, no reconciliation tools, no AI features. Commonly used for accessory sales only.

### 6.3 Our Differentiation

CogniTill is the only platform that combines:
1. Repair-native workflows (intake → tracking → PIN pickup → SMS)
2. Guided EOD reconciliation (Close Wizard)
3. Embedded AI (stock velocity + marketplace listings)
4. SMB-friendly pricing ($49–$149/month)

No competitor has all four. Most have one or two.

---

## 7. Business Model & Unit Economics

### 7.1 Pricing Tiers

| Plan | Price/Month | Target Customer | Key Features |
|---|---|---|---|
| **Starter** | $49 | 1-person solo shop | Repair tracker, basic POS, inventory |
| **Professional** | $99 | 2–5 staff shops | All Starter + role dashboards, Close Wizard, SMS, AI stock |
| **Business** | $149 | Multi-location or high volume | All Pro + AI listings, advanced reports, priority support |

Expected blended ARPU: **$89/month** ($1,068/year)

### 7.2 Unit Economics

| Metric | Value |
|---|---|
| Monthly ARPU | $89 |
| Annual ARPU | $1,068 |
| Estimated CAC (digital + referral) | $300 |
| Payback period | ~3.4 months |
| Gross margin (SaaS) | ~82% |
| Target Monthly Churn | <2% |
| LTV (at 2% churn, 50-month avg life) | $4,450 |
| LTV : CAC | ~14.8x |

### 7.3 Revenue Streams

**Primary:**
- Monthly SaaS subscriptions (recurring)

**Secondary (Year 2+):**
- Hardware bundle (tablet + receipt printer + cash drawer): one-time $299–$499
- White-label reseller program for repair franchises
- Data insights product for suppliers/distributors

### 7.4 Why SaaS Works Here

Repair shops are operationally dependent on their POS. Switching costs are high once staff are trained and data is in the system. This drives low churn, long contract duration, and strong NPS-driven referral loops within regional repair shop communities (Facebook groups, WhatsApp chains, trade shows).

---

## 8. Go-to-Market Strategy

### 8.1 Phase 1: Owned Community (Months 1–6)

Start with the network we already have access to. Metro Vancouver has a concentrated repair shop community connected through supplier relationships, trade WhatsApp groups, and in-person meetups.

**Tactics:**
- Direct outreach to 50 shops in Metro Vancouver
- Referral incentive: 1 month free for each signed referral
- Founder-led demos (in-person and Zoom)
- Free 30-day trial, no credit card required

**Target:** 25 paying shops by Month 6

### 8.2 Phase 2: Digital Acquisition (Months 6–18)

**Tactics:**
- SEO content targeting "repair shop POS", "mobile repair management software"
- Google Ads targeting competitor brand terms (RepairDesk, RepairShopr)
- YouTube demo channel showing Close Wizard and AI features
- Facebook/Reddit community presence in repair shop owner groups
- Partnership with parts suppliers (iGen, Wireless Vision) for co-marketing

**Target:** 200 paying shops by Month 18

### 8.3 Phase 3: Channel & Geographic Expansion (Months 18–36)

**Tactics:**
- Franchise partnerships (CPR Cell Phone Repair, uBreakiFix)
- US Pacific Coast expansion (Seattle, Portland, Bay Area)
- Reseller program for repair shop consultants and IT MSPs
- Trade show presence (Wireless industry events)

**Target:** 1,000 paying shops by Month 36

### 8.4 Funnel

```
Awareness → Trial → Activation → Conversion → Retention → Referral
(SEO/Ads)   (Free)  (First Close  (Paid Plan)  (<2% churn) (Referral
                     Wizard run)                             program)
```

---

## 9. Traction & Key Metrics

### 9.1 Where We Are Today

CogniTill is a fully functional, deployed product. The platform is live in production on Railway (backend) and Netlify (frontend), connected to a Supabase PostgreSQL database with Row Level Security enforced at the data layer.

**Product Status:**
- All 9 MVP features (F01–F09) are built and deployed
- Close Wizard (F11) live and in active use
- AI stock velocity and AI listing generator in beta
- SMS notifications via Twilio operational
- Supabase real-time sync across all dashboards

**Pilot:**
- Active pilot with 1 Metro Vancouver repair shop (the research participants — Danees, Kiran, Waseem)
- EOD reconciliation time reduced from ~60 minutes to ~8 minutes
- Bulk inventory update time reduced from ~45 minutes to ~3 minutes
- Zero paper repair tickets since go-live

### 9.2 Product Milestones

| Milestone | Status |
|---|---|
| PRD research (22 pain points, 3 personas) | Complete |
| MVP feature set (F01–F09) | Complete |
| Production deployment | Complete |
| Pilot customer live | Complete |
| Close Wizard (F11) | Complete |
| AI stock velocity (F12) | Beta |
| AI listing generator (F13) | Beta |
| Insurance voucher integration (F10) | In Development |
| Multi-location support | Roadmap |

---

## 10. Technology & Platform Architecture

### 10.1 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS | Fast, type-safe, modern — optimized for tablet use |
| Backend | Node.js + Express (Railway) | Lightweight, scalable, easy deploy |
| Database | PostgreSQL via Supabase | Row Level Security, real-time subscriptions, managed |
| AI | Anthropic Claude API | Best-in-class reasoning for structured outputs |
| SMS | Twilio | Reliable, programmatic, global |
| Auth | Supabase Auth (JWT + RLS) | Role-based access enforced at database level |

### 10.2 Security Model

Security is not an afterthought — it is enforced at the data layer.

- **Row Level Security (RLS)** on all Supabase tables means no query can bypass role permissions
- **Role hierarchy**: Admin > Manager > Employee — each role can only access what their role permits
- **JWT authentication** on all API endpoints
- **PIN-based repair pickup** eliminates impersonation at the counter
- **Audit trail** on all repair status changes and EOD submissions

### 10.3 Data Model (Key Tables)

```
users           → role (admin | manager | employee), shop_id
repairs         → status (Received | In Progress | Complete | Collected), pickup_pin
inventory       → sku, quantity, cost_price, sell_price, low_stock_threshold
sales           → payment_mode (Cash | Debit | Credit), discount_amount, tax_enabled
sale_items      → sale_id, inventory_id, quantity, unit_price
close_wizard_sessions → cash_counted, expected_cash, variance, deposit_amount, float_removed
eod_reports     → session_id, total_cash, total_card, total_revenue, submitted_at
vouchers        → code, amount, redeemed, sale_id
```

### 10.4 AI Architecture

The AI layer sits between the application server and the Claude API:

```
App Server → Prompt Builder → Claude API → Response Parser → UI
```

For stock velocity: the system aggregates 30/60/90-day sales history per SKU, formats it as structured context, and asks Claude to rank by velocity and flag reorder urgency.

For marketplace listings: the system passes device model, condition, and price range to Claude, which returns a structured JSON object with title, description, and suggested sell price.

All AI calls are logged for quality monitoring and cost tracking.

### 10.5 Scalability Path

Current architecture supports single-shop and small multi-shop deployments. Scaling path:

- **Year 1:** Single-tenant per shop (current model)
- **Year 2:** Multi-tenant with shop isolation via Supabase RLS policies
- **Year 3:** Dedicated DB clusters for enterprise/franchise accounts

---

## 11. The Team

### Founders

**Sandy [Founder / CEO / Product]**
- Designed the full product from user research through PRD, wireframes, and implementation
- Conducted 3-persona, 22-pain-point research study that drives the entire product roadmap
- Built and deployed the production application (React, Node.js, Supabase, Claude API)
- Operator background in the repair industry — understands the customer intimately

*We are actively recruiting a co-founder with enterprise sales or SaaS GTM experience.*

### Advisors (In Discussion)
- Repair industry operator network (Metro Vancouver)
- SaaS growth advisor (TBD)

### Why We Will Win

The founder has done something rare: built a product by living inside the problem. The 22 pain points came from real operators. The Close Wizard was designed around Waseem's actual 60-minute EOD process. The bulk update feature was built because Kiran told us about his 45-minute delivery ritual. This is not a solution looking for a problem — it is a direct, validated response to documented pain.

---

## 12. Financial Projections (5-Year)

### 12.1 Assumptions

- Blended ARPU: $89/month ($1,068/year)
- Monthly churn: 2% (improving to 1.5% by Year 3 with onboarding improvements)
- CAC: $300 (Year 1–2), declining to $200 (Year 3+) with referral flywheel
- Gross margin: 82%
- Growth rate: conservative ramp — community-led Year 1, digital Year 2, channel Year 3+

### 12.2 Revenue Projections

| Year | Shops (End of Year) | ARR | Gross Profit | Net Burn |
|---|---|---|---|---|
| Year 1 | 50 | $53K | $44K | ($380K) |
| Year 2 | 250 | $267K | $219K | ($280K) |
| Year 3 | 800 | $854K | $701K | ($120K) |
| Year 4 | 2,000 | $2.14M | $1.75M | $420K |
| Year 5 | 4,500 | $4.81M | $3.94M | $2.1M |

### 12.3 Path to Profitability

Breakeven at approximately **1,700 shops / $1.8M ARR** — achievable in late Year 3 / early Year 4 with the proposed use of funds.

### 12.4 Key Drivers

```
Shop Count Growth:
Y1: 50  ██
Y2: 250 ██████████
Y3: 800 ████████████████████████████████
Y4: 2K  ████████████████████████████████████████████████████████████████████████████████
Y5: 4.5K ████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
```

---

## 13. The Ask & Use of Funds

### 13.1 Round Details

| Item | Detail |
|---|---|
| Round Type | Pre-Seed |
| Amount | $500,000 |
| Instrument | SAFE (with valuation cap) |
| Valuation Cap | $3.5M |
| Minimum Check | $25,000 |

### 13.2 Use of Funds

| Category | Allocation | Amount |
|---|---|---|
| Product & Engineering | 40% | $200,000 |
| Sales & Marketing | 30% | $150,000 |
| Operations & Infrastructure | 15% | $75,000 |
| General & Administrative | 15% | $75,000 |
| **Total** | **100%** | **$500,000** |

### 13.3 What This Round Achieves

**Product & Engineering ($200K)**
- Complete F10 (voucher reconciliation), F14 (multi-location), F15 (advanced analytics)
- Hire 1 full-stack engineer (6-month contract)
- AI infrastructure hardening and cost optimization

**Sales & Marketing ($150K)**
- Founder-led sales coverage for Metro Vancouver + Toronto + Seattle
- SEO content build-out (12-month runway)
- Google Ads targeting competitor terms
- Repair industry trade show presence (2 events)

**Operations & Infrastructure ($75K)**
- Supabase scaling and backups
- Twilio capacity and failover
- Customer support tooling (Intercom or equivalent)
- Legal (SAFE documentation, IP assignment)

**G&A ($75K)**
- Accounting, compliance, incorporation costs
- Founder salaries (modest, 12 months)

### 13.4 18-Month Milestones (Funded)

- 250 paying shops
- $267K ARR
- Insurance voucher integration live
- US market entry (Seattle pilot)
- Seed round prepared

---

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Slow SMB sales cycle | Medium | Medium | Free trial + referral incentive removes friction; pilot success is social proof |
| Competitor response (RepairDesk pricing) | Low | Medium | Feature differentiation (AI, Close Wizard) not easily copied; community loyalty |
| AI API cost escalation | Medium | Low | Claude API costs falling; output caching reduces redundant calls |
| Churn from poor onboarding | Medium | High | Guided Close Wizard is sticky; invest in video onboarding and live setup calls |
| Single-founder execution risk | High | High | Active co-founder search; advisor network; clear hiring plan from Day 1 of funding |
| Regulatory (payment processing) | Low | High | Not a payment processor — integrate with existing licensed processors (Stripe, Square Terminal) |
| Data breach / security | Low | High | Supabase RLS at DB layer, JWT auth, no PII beyond name/phone, Canadian data residency option |

---

## 15. Vision & Roadmap

### 15.1 Where We Are Going

CogniTill's 5-year vision is to become the **operating system for the independent repair shop** — the single platform that runs every aspect of shop operations, from the customer's first call to the owner's monthly P&L.

In doing so, we build a data asset that no generic POS can replicate: repair velocity by device model, parts demand by region, technician efficiency benchmarks. This data becomes a platform for supplier partnerships, insurance integrations, and industry intelligence.

### 15.2 Product Roadmap

**MVP (Complete)**
- F01: Digital repair intake
- F02: 4-stage repair tracker
- F03: PIN-based pickup verification
- F04: Role-based dashboards (Admin, Manager, Employee)
- F05: SMS notification on repair completion
- F06: Inventory management with low-stock alerts
- F07: Bulk delivery inventory update
- F08: AI stock velocity analysis
- F09: Sales POS (Cash/Debit/Credit)
- F10: Close Wizard (5-step EOD reconciliation)

**Phase 2 (Months 6–12 post-funding)**
- F11: Insurance voucher reconciliation
- F12: AI marketplace listing generator (GA)
- F13: Advanced analytics dashboard for admins
- F14: Multi-location support
- F15: Customer history and repair log

**Phase 3 (Year 2)**
- F16: Supplier integration (direct purchase orders from inventory alerts)
- F17: Franchise/white-label deployment
- Mobile app for field technicians
- Customer-facing repair status portal (self-serve)

**Phase 4 (Year 3+)**
- Industry benchmarking data product
- Insurance company direct integration
- Technician marketplace (connect shops with contract techs)

### 15.3 The Long View

```
2026: Vertical POS for repair shops
2027: Operating system for the repair SMB
2028: Data platform for the repair industry
2030: Infrastructure layer for the device lifecycle economy
```

---

## 16. Appendix

### A. Feature List (F01–F17)

| ID | Feature | Priority | Status |
|---|---|---|---|
| F01 | Digital Repair Intake | MVP | Live |
| F02 | 4-Stage Repair Tracker | MVP | Live |
| F03 | PIN-Based Pickup Verification | MVP | Live |
| F04 | Role-Based Dashboards | MVP | Live |
| F05 | Automated SMS on Completion | MVP | Live |
| F06 | Inventory Management | MVP | Live |
| F07 | Bulk Delivery Update | MVP | Live |
| F08 | AI Stock Velocity | MVP | Beta |
| F09 | Sales POS | MVP | Live |
| F10 | Close Wizard (EOD) | MVP | Live |
| F11 | Insurance Voucher Reconciliation | Phase 2 | In Dev |
| F12 | AI Marketplace Listing Generator | Phase 2 | Beta |
| F13 | Advanced Analytics | Phase 2 | Roadmap |
| F14 | Multi-Location Support | Phase 2 | Roadmap |
| F15 | Customer Repair History | Phase 2 | Roadmap |
| F16 | Supplier Integration | Phase 3 | Roadmap |
| F17 | Franchise/White-Label | Phase 3 | Roadmap |

### B. User Research Methodology

Research was conducted over 4 weeks with 3 participants at a Metro Vancouver repair shop. Methods included:
- Semi-structured interviews (60–90 minutes each)
- Direct observation of daily workflows (repair intake, EOD, inventory update)
- Affinity mapping: 5 clusters from raw observations
- Problem statements: 10 derived from clusters
- Root cause analysis: 5 causes driving the 22 pain points
- HMW questions: 10 "How Might We" prompts driving ideation
- 47 ideas brainstormed, 10 concepts selected, 9 MVP features defined

### C. Database Schema (Key Tables)

```sql
-- Repairs
CREATE TABLE repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  device_type TEXT,
  issue_description TEXT,
  status TEXT CHECK(status IN ('Received', 'In Progress', 'Complete', 'Collected')),
  quoted_price NUMERIC,
  pickup_pin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  quantity INTEGER DEFAULT 0,
  cost_price NUMERIC,
  sell_price NUMERIC,
  low_stock_threshold INTEGER DEFAULT 5
);

-- Sales
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_mode TEXT CHECK(payment_mode IN ('Cash', 'Debit', 'Credit')),
  total_amount NUMERIC,
  discount_amount NUMERIC DEFAULT 0,
  tax_enabled INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Close Wizard Sessions
CREATE TABLE close_wizard_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_counted NUMERIC,
  expected_cash NUMERIC,
  float_removed NUMERIC DEFAULT 200,
  deposit_amount NUMERIC,
  variance NUMERIC,
  denominations TEXT,
  submitted_at TIMESTAMPTZ
);
```

### D. Competitive Pricing Comparison

| Platform | Entry Price | Mid Tier | Enterprise | Repair-Native |
|---|---|---|---|---|
| RepairDesk | $75/mo | $175/mo | $300+/mo | Yes |
| Lightspeed | $89/mo | $149/mo | $289+/mo | No |
| RepairShopr | $59/mo | $99/mo | $199+/mo | Partial |
| Square | $0 + 2.6% | $60/mo | Custom | No |
| Shopify POS | $29/mo | $79/mo | $299+/mo | No |
| **CogniTill** | **$49/mo** | **$99/mo** | **$149/mo** | **Yes** |

### E. Glossary

| Term | Definition |
|---|---|
| ARR | Annual Recurring Revenue |
| ARPU | Average Revenue Per User (per shop, per month) |
| CAC | Customer Acquisition Cost |
| LTV | Lifetime Value |
| RLS | Row Level Security (Supabase data access control) |
| Close Wizard | CogniTill's 5-step guided end-of-day reconciliation flow |
| EOD | End of Day (cash reconciliation) |
| SKU | Stock Keeping Unit (inventory item identifier) |
| PIN | 4-digit pickup verification code for repair collection |
| TAM / SAM / SOM | Total / Serviceable / Obtainable Addressable Market |

---

*CogniTill is confidential. This document is intended solely for prospective investors and may not be reproduced or distributed without permission.*

**Contact:** [Founder Name] | [Email] | [Phone]

---

*Document Version 1.0 | April 2026*
