import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Calendar,
  CheckCircle2,
  Table,
  Layers,
  ShieldCheck,
  Building2,
  Receipt
} from 'lucide-react';

export default function ReportsExportsPage({ onNavigate, token }) {
  const [downloadMsg, setDownloadMsg] = useState('');

  const handleExport = (reportType, format) => {
    setDownloadMsg(`Preparing ${reportType.toUpperCase()} export in ${format.toUpperCase()}...`);

    setTimeout(() => {
      let content = '';
      let filename = `Yashtitva_${reportType}_${new Date().toISOString().slice(0, 10)}`;

      if (reportType === 'pnl_statement') {
        content = `"Report","Yashtitva SaaS Profit & Loss Statement"\n"Generated At","${new Date().toISOString()}"\n"Currency","INR (₹)"\n\n"Category","Item","Amount (INR)"\n"Revenue","Annual Campus Subscriptions","1800000"\n"Revenue","Setup & Onboarding Fees","140000"\n"Revenue","Add-on Modules","85000"\n"Deductions","Payment Gateway Fees (2%)","-24000"\n"Deductions","Discounts Given","-45000"\n"Net Operating Revenue","Total","1956000"\n"Expenses","Hosting & Cloud Infrastructure (AWS)","48500"\n"Expenses","AI API Tokens (OCR & Verification)","34200"\n"Expenses","Core Engineering Payroll","185000"\n"Expenses","Database & Storage Clusters","30900"\n"Expenses","Customer Support & Marketing","77000"\n"Total Operating Expenses","Total","375600"\n"Net Operating Profit","Operating Profit","1580400"\n"Statutory Compliance","GST 18% Collected","280000"\n`;
        filename += '.csv';
      } else if (reportType === 'colleges_master') {
        content = `"College ID","College Name","Category","State","District","College Code","Unique ID","Licence Status","Annual Fee"\n"1","College of Engineering Pune (COEP)","University","Maharashtra","Pune","COEP-1854","UNQ-MH-COEP-01","Active","250000"\n"2","VJTI Technical Institute","Affiliated College","Maharashtra","Mumbai","VJTI-1887","UNQ-MH-VJTI-02","Active","220000"\n"3","Symbiosis International University","Deemed University","Maharashtra","Pune","SIU-2002","UNQ-MH-SIU-03","Active","300000"\n"4","Grant Medical College","Affiliated College","Maharashtra","Mumbai","GMC-1845","UNQ-MH-GMC-04","Active","280000"\n"5","RV College of Engineering","Affiliated College","Karnataka","Bengaluru Urban","RVCE-1963","UNQ-KA-RVCE-05","Active","240000"\n"6","National Law School of India University","University","Karnataka","Bengaluru Urban","NLSIU-1987","UNQ-KA-NLS-06","Active","200000"\n"7","Madras Christian College","Affiliated College","Tamil Nadu","Chennai","MCC-1837","UNQ-TN-MCC-07","Active","180000"\n"8","AIIMS New Delhi","University","Delhi","New Delhi","AIIMS-ND-1956","UNQ-DL-AIIMS-08","Active","350000"\n"9","Faculty of Management Studies","Affiliated College","Delhi","North Delhi","FMS-1954","UNQ-DL-FMS-09","Active","220000"\n"10","MIT-WPU","University","Maharashtra","Pune","MIT-1983","UNQ-MH-MIT-10","Pending Verification","0"\n`;
        filename += '.csv';
      } else if (reportType === 'gst_ledger') {
        content = `"Invoice No","College Name","State","Taxable Value","CGST 9%","SGST 9%","Total GST 18%","Invoice Total","Payment Status"\n"INV-YASH-202601","College of Engineering Pune","Maharashtra","211864","19068","19068","38136","250000","Paid"\n"INV-YASH-202602","VJTI Technical Institute","Maharashtra","186440","16780","16780","33560","220000","Overdue Balance ₹1.2L"\n"INV-YASH-202603","Symbiosis International University","Maharashtra","254237","22881","22881","45763","300000","Pending Balance ₹1.5L"\n"INV-YASH-202604","Grant Medical College","Maharashtra","237288","21356","21356","42712","280000","Paid"\n"INV-YASH-202605","RV College of Engineering","Karnataka","203390","18305","18305","36610","240000","Overdue Balance ₹80k"\n`;
        filename += '.csv';
      } else {
        content = JSON.stringify({
          platform: 'Yashtitva Super Admin & BI Portal',
          exportedAt: new Date().toISOString(),
          recordType: reportType,
          status: 'SUCCESS'
        }, null, 2);
        filename += '.json';
      }

      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadMsg(`Successfully generated and downloaded ${filename}`);
      setTimeout(() => setDownloadMsg(''), 4000);
    }, 400);
  };

  return (
    <div className="reports-page-wrapper">
      <div className="page-header-card">
        <div className="page-header-info">
          <div className="section-pill">
            <FileSpreadsheet size={14} />
            <span>FINANCIAL AUDIT & DATA EXPORT CENTER</span>
          </div>
          <h2 className="page-title">Executive Reports & Statutory Data Exports</h2>
          <p className="page-description">
            Generate one-click audited CSV and JSON datasets for corporate income tax filing, GST 18% reconciliations, and investor reporting.
          </p>
        </div>
      </div>

      {downloadMsg && (
        <div className="banner-alert success" style={{ marginTop: '1.25rem' }}>
          <CheckCircle2 size={16} />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="reports-catalog-grid" style={{ marginTop: '1.5rem' }}>
        <div className="report-export-card">
          <div className="report-card-top">
            <div className="report-icon-box pnl">
              <FileSpreadsheet size={22} />
            </div>
            <span className="report-badge">Finance & Tax</span>
          </div>
          <h3 className="report-title">Full Profit & Loss Statement (P&L)</h3>
          <p className="report-desc">
            Complete schedule of gross revenue, setup fees, gateway costs, AI token expenditures, developer payroll, and net operating profit.
          </p>
          <div className="report-card-actions">
            <button
              type="button"
              className="btn-primary sm"
              onClick={() => handleExport('pnl_statement', 'csv')}
            >
              <Download size={14} />
              <span>Download CSV</span>
            </button>
            <button
              type="button"
              className="btn-secondary sm"
              onClick={() => handleExport('pnl_statement', 'json')}
            >
              <span>JSON Raw</span>
            </button>
          </div>
        </div>

        <div className="report-export-card">
          <div className="report-card-top">
            <div className="report-icon-box gst">
              <Receipt size={22} />
            </div>
            <span className="report-badge">Tax Compliance</span>
          </div>
          <h3 className="report-title">Statutory GST 18% Tax Ledger</h3>
          <p className="report-desc">
            Itemized CGST (9%) and SGST (9%) breakdown on every college invoice, GSTIN tax IDs, and collected tax provisions for CA filing.
          </p>
          <div className="report-card-actions">
            <button
              type="button"
              className="btn-primary sm"
              onClick={() => handleExport('gst_ledger', 'csv')}
            >
              <Download size={14} />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        <div className="report-export-card">
          <div className="report-card-top">
            <div className="report-icon-box colleges">
              <Building2 size={22} />
            </div>
            <span className="report-badge">Institutions</span>
          </div>
          <h3 className="report-title">Colleges & Licences Master Directory</h3>
          <p className="report-desc">
            Full institutional directory with state, district, verification documents, software licence numbers, and subscription amounts.
          </p>
          <div className="report-card-actions">
            <button
              type="button"
              className="btn-primary sm"
              onClick={() => handleExport('colleges_master', 'csv')}
            >
              <Download size={14} />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
