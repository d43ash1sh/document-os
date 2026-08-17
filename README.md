# Document OS — Local-First Business Document & Invoice Management System

![License](https://img.shields.io/badge/license-MIT-purple.svg)
![React](https://img.shields.io/badge/React-19.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.1-purple.svg)
![Dexie](https://img.shields.io/badge/Dexie.js-IndexedDB-green.svg)

**Document OS** is a high-performance, local-first web application designed for freelancers, agency owners, software engineers, and small businesses to generate professional, multi-page business documents—including **Quotations, Invoices, Proposals, Estimates, Proforma Invoices, Work Orders, Receipts, Payment Proofs, and Annual Maintenance Contracts (AMC)**.

It operates **100% offline** with client-side browser storage (IndexedDB), client-side PDF compilation, and editable Word (`.docx`) file generation.

---

## 🌟 Key Features

### 1. 100% Local-First & Privacy-Focused
- **Zero Cloud Database Dependency**: Runs fully offline in your browser using IndexedDB (via Dexie.js).
- **Client-Side Document Compilation**: PDF compilation and editable `.docx` document generation happen locally inside the browser.
- **Repository Pattern Architecture**: Abstracted data access layer (`ClientRepository`, `ServiceRepository`, `DocumentRepository`, `PaymentRepository`, `SettingsRepository`) allowing future cloud database synchronization if needed.

### 2. 9 Supported Document Types & Distinct Visual Layouts
Each document type features a distinct header, banner badge, disclaimers, specialized sections, and signature blocks:
- **Quotations**: Commercial proposals with validity periods, milestone schedules, and client acceptance sign-off boxes.
- **Tax Invoices**: Official bills with payment status badges (`PAID`, `PARTIAL`, `UNPAID`), HSN/SAC columns, CGST/SGST/IGST tax splits, bank transfer boxes, and scan-to-pay UPI QR code cards.
- **Cost Estimates**: Non-binding budget estimates with validity timeframes and disclaimers.
- **Proforma Invoices**: Pre-billing advance payment requests with bank transfer deposit details.
- **Project Proposals**: Executive summaries, proposed solutions, technology stack roadmaps, and commercial terms.
- **Work Orders**: Authorized project commencement dates, target completion dates, deliverables checklists, and dual signatures.
- **Official Receipts**: Payment vouchers with payment method, transaction UTR #, and balance remaining callouts.
- **Payment Receipts**: Detailed payment proof vouchers with invoice reference and received stamps.
- **AMC Contracts**: Annual maintenance contracts with contract period dates, SLA 4-hour response window notices, and covered services lists.

### 3. Financial & Calculation Engine
- **Item & Document Discounts**: Percentage or fixed discounts at line-item and document levels.
- **GST & Custom Tax Logic**: Automatic split into **CGST (50%) + SGST (50%)** for intra-state transactions vs **IGST (100%)** for inter-state transactions based on client GST type. Supports tax exclusive and tax inclusive pricing.
- **Indian Numbering & Currency**: Formats currency as `₹1,17,500` (Indian comma standard) and converts amounts to Indian Rupee words (`"Rupees One Lakh Seventeen Thousand Five Hundred Only"`).
- **Payment Milestones Auto-Calculator**: Computes milestone rupee amounts from target percentages against document total.

### 4. Accounting & Payment Tracking
- **Record Payments**: Track cash, bank transfer, UPI, card, and cheque payments against issued invoices.
- **Auto Balance Recalculation**: Automatically updates document status (`unpaid`, `partially_paid`, `paid`, `overpaid`) and balance due.
- **JSON Backup Export & Restore**: Export full database state into a single `.json` backup file and restore transactionally anytime.

### 5. Workspace Security
- **Local SHA-256 Authentication**: Browser-native Web Crypto SHA-256 password hashing.
- **Offline Password Recovery**: Offline 2-factor reset wizard using a configurable Security Answer or Master Recovery Key.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/document-os.git
   cd document-os
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000`.

---

## 🛠️ Tech Stack & Dependencies

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Modern CSS Design System (Modern Purple Token Palette)
- **Icons**: `lucide-react`
- **Database**: `dexie` & `dexie-react-hooks` (IndexedDB Wrapper)
- **PDF Generation**: `jspdf`, `html2canvas`
- **DOCX Generation**: `docx` package

---

## 🌐 Deploying to Vercel (Step-by-Step)

You can deploy **Document OS** to Vercel for free in less than 2 minutes.

### Step 1: Push Code to GitHub
1. Create a new public repository on GitHub named `document-os`.
2. Push your local project code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Document OS"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/document-os.git
   git push -u origin main
   ```

### Step 2: Import into Vercel
1. Log in to your [Vercel Account](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Select your GitHub repository **`document-os`**.
4. Vercel will automatically detect **Vite** settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

### Step 3: Access Your Live Application
Vercel will generate a secure HTTPS live URL (e.g. `https://document-os.vercel.app`).
Since all storage and document generation run client-side in the user's browser, your live Vercel web app works 100% offline and requires zero backend server fees!

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
