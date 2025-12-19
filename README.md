# WORKer - HRMS Application

**WORKer** adalah aplikasi Human Resource Management System (HRMS) berbasis web yang dibangun dengan Next.js 14, TypeScript, dan Tailwind CSS.

## ✨ Fitur Utama

### 📊 Dashboard & KPI
- Real-time KPI tracking per karyawan
- Visual progress indicators
- Edit dan manage KPI targets

### 👥 Employee Management
- Data karyawan lengkap dengan hierarchy level
- Master data management (Department & Position)
- Editable dropdown untuk easy customization
- Currency formatting untuk input gaji (xxx.xxx.xxx)

### ⏰ Attendance & Overtime
- Daily attendance dengan check-in/check-out
- Automatic overtime calculation (1.5x rate)
- Work hours tracking (regular vs overtime)
- Real-time overtime statistics

### 🏖️ Leave Management
- Multiple leave types (Annual, Sick, Personal, Unpaid)
- Leave quota tracking
- Multi-level approval system based on hierarchy

### 💰 Payroll System
- Automatic payroll generation with overtime
- BPJS (Kesehatan & Ketenagakerjaan) calculation
- PPh 21 progressive tax calculation
- Printable payroll slips
- Latest payroll quick view per employee
- Link payroll to employee records

### 📄 Reports & Printing
- Employee detail reports
- Summary reports
- Payroll slip printing
- Export functionality

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **Storage**: localStorage (client-side)

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/logikaistudio/worker.git

# Install dependencies
cd worker
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project to Vercel
3. Deploy automatically

### Manual Build
```bash
npm run build
npm start
```

## 💡 Key Features Details

### Overtime System
- **Formula**: (Basic Salary / 173) × 1.5 × Overtime Hours
- **Standard Hours**: 8 hours/day
- **Auto-Detection**: Hours > 8 = overtime

### Payroll Calculation
- **Gross Salary**: Basic + Allowances + Overtime Pay
- **BPJS Kesehatan**: 1% of basic salary
- **BPJS Ketenagakerjaan**: 2% of basic salary
- **PPh 21**: Progressive tax (5%-30%)
- **Net Salary**: Gross - All Deductions

### Currency Format
All monetary inputs use Indonesian format:
- Input: `15.000.000`
- Display: `Rp 15.000.000`

## 📝 Usage Examples

### Adding Employee
1. Click "Tambah Karyawan"
2. Fill form with currency format (e.g., `15.000.000`)
3. Select/add Department and Position
4. Set hierarchy level (1-5)
5. Save

### Processing Overtime
1. Employee check-in (e.g., 09:00)
2. Employee check-out (e.g., 19:00)
3. System calculates: 10 hours work → 8 regular + 2 overtime
4. Overtime reflected in monthly payroll

### Generating Payroll
1. Go to Payroll page
2. Click "Generate Payroll Bulan Ini"
3. System automatically:
   - Fetches overtime from attendance
   - Calculates all components
   - Links to employee records
4. View/print individual slips

## 🎨 UI/UX Highlights

- **Mobile-First**: Responsive design
- **Modern Aesthetics**: Glassmorphism, gradients, smooth animations
- **Interactive**: Real-time feedback, modals, print previews
- **Accessible**: Clear labels, proper contrast, keyboard navigation

## 📖 Project Structure

```
worker/
├── app/                    # Next.js app router pages
│   ├── attendance/        # Attendance module
│   ├── employees/         # Employee management
│   ├── kpi/              # KPI dashboard
│   ├── payroll/          # Payroll system
│   └── ...
├── components/            # Reusable components
│   ├── ui/               # UI primitives
│   ├── employees/        # Employee components
│   ├── payroll/          # Payroll components
│   └── ...
├── context/              # React Context providers
├── types/                # TypeScript definitions
├── utils/                # Helper functions
│   ├── currencyHelpers.ts
│   ├── overtimeHelpers.ts
│   ├── payrollHelpers.ts
│   └── masterData.ts
└── ...
```

## 🔧 Configuration

No environment variables required for basic usage. All data stored in localStorage.

## 📄 License

MIT License

## 👨‍💻 Author

Developed with ❤️ by Logika Studio

---

**Version**: 1.0.0  
**Last Updated**: December 2025
