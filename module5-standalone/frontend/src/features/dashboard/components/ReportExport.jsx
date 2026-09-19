import jsPDF from "jspdf";

const ReportExport = ({ data }) => {
    const exportCSV = () => {
        if (!data || data.length === 0) {
            return;
        }

        const headers = Object.keys(data[0]);

        const rows = data.map((item) =>
            headers.map((header) => item[header])
        );

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "crm-performance-report.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const exportPDF = () => {
        if (!data || data.length === 0) {
            return;
        }

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("CRM Performance Report", 20, 20);

        doc.setFontSize(11);
        doc.text(
            "Generated from AI-Enabled CRM Dashboard",
            20,
            30
        );

        let yPosition = 45;

        data.forEach((item) => {
            doc.setFontSize(11);

            doc.text(`Month: ${item.month}`, 20, yPosition);
            yPosition += 7;

            doc.text(`Leads: ${item.leads}`, 30, yPosition);
            yPosition += 7;

            doc.text(`Deals: ${item.deals}`, 30, yPosition);
            yPosition += 7;

            doc.text(
                `Won Deals: ${item.wonDeals}`,
                30,
                yPosition
            );
            yPosition += 7;

            doc.text(
                `Revenue: ₹${item.revenue.toLocaleString()}`,
                30,
                yPosition
            );
            yPosition += 12;

            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
        });

        doc.save("crm-performance-report.pdf");
    };

    return (
        <div className="report-export">
            <h2>Reports</h2>

            <button onClick={exportCSV}>
                Export CSV
            </button>

            <button onClick={exportPDF}>
                Export PDF
            </button>
        </div>
    );
};

export default ReportExport;