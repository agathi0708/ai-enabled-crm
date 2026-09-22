function ReportExport({
    performanceData = [],
}) {
    function exportCSV() {
        const headers = [
            "Month",
            "Deals",
            "Won Deals",
            "Revenue",
        ];

        const rows = performanceData.map(
            (item) => [
                item.month,
                item.deals,
                item.wonDeals,
                item.revenue,
            ]
        );

        const csvContent = [
            headers,
            ...rows,
        ]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value ?? "").replace(
                            /"/g,
                            '""'
                        )}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csvContent],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download =
            "crm-performance-report.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    function exportPDF() {
        const reportRows =
            performanceData
                .map(
                    (item) => `
            <tr>
              <td>${item.month}</td>
              <td>${item.deals}</td>
              <td>${item.wonDeals}</td>
              <td>₹${Number(
                        item.revenue || 0
                    ).toLocaleString("en-IN")}</td>
            </tr>
          `
                )
                .join("");

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=900,height=700"
            );

        if (!printWindow) {
            return;
        }

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CRM Performance Report</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #0f172a;
            }

            h1 {
              margin-bottom: 8px;
            }

            p {
              color: #64748b;
              margin-bottom: 30px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #e2e8f0;
              padding: 12px;
              text-align: left;
            }

            th {
              background: #f8fafc;
            }

            td:nth-child(2),
            td:nth-child(3),
            td:nth-child(4) {
              text-align: right;
            }
          </style>
        </head>

        <body>
          <h1>CRM Performance Report</h1>

          <p>
            Generated from the AI CRM
            reporting dashboard.
          </p>

          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Deals</th>
                <th>Won Deals</th>
                <th>Revenue</th>
              </tr>
            </thead>

            <tbody>
              ${reportRows}
            </tbody>
          </table>
        </body>
      </html>
    `);

        printWindow.document.close();

        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <button
                type="button"
                onClick={exportCSV}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
                Export CSV
            </button>

            <button
                type="button"
                onClick={exportPDF}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
                Export PDF
            </button>
        </div>
    );
}

export default ReportExport;