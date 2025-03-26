import { jsPDF } from "jspdf";

export interface PLReportData {
  revenue: {
    totalSales: number;
    byPlatform: Record<string, number>;
  };
  expenses: {
    shippingCosts: number;
    platformFees: number;
    taxes: number;
    otherCosts: number;
  };
  profitability: {
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
  };
}

export async function generatePLReport(sales: any[]): Promise<PLReportData> {
  // Calculate revenue
  const revenue = {
    totalSales: 0,
    byPlatform: {} as Record<string, number>,
  };

  // Calculate expenses
  const expenses = {
    shippingCosts: 0,
    platformFees: 0,
    taxes: 0,
    otherCosts: 0,
  };

  // Process each sale
  sales.forEach((sale) => {
    // Add to total revenue (using total_revenue from the view)
    const saleAmount = sale.total_revenue || 0;
    revenue.totalSales += saleAmount;

    // Add to platform-specific revenue
    const platform = sale.platform || "Other";
    revenue.byPlatform[platform] = (revenue.byPlatform[platform] || 0) + saleAmount;

    // Add expenses (using correct field names from the view)
    expenses.shippingCosts += sale.shipping_cost || 0;
    expenses.platformFees += sale.platform_fees || 0;
    expenses.taxes += sale.tax_amount || 0;
    expenses.otherCosts += sale.total_cogs || 0; // Using total_cogs as other costs
  });

  // Calculate profitability
  const grossProfit = revenue.totalSales - expenses.shippingCosts;
  const netProfit = grossProfit - expenses.platformFees - expenses.taxes - expenses.otherCosts;
  const profitMargin = revenue.totalSales > 0 ? (netProfit / revenue.totalSales) * 100 : 0;

  return {
    revenue,
    expenses,
    profitability: {
      grossProfit,
      netProfit,
      profitMargin,
    },
  };
}

export async function generatePLReportPDF(data: PLReportData): Promise<Buffer> {
  const doc = new jsPDF();
  const lineHeight = 10;
  let y = 20;

  // Add title
  doc.setFontSize(20);
  doc.text("Profit & Loss Report", doc.internal.pageSize.width / 2, y, { align: "center" });
  y += lineHeight * 2;

  // Helper function to add sections
  const addSection = (title: string, items: [string, string | number][]) => {
    doc.setFontSize(16);
    doc.text(title, 20, y);
    y += lineHeight;

    doc.setFontSize(12);
    items.forEach(([label, value]) => {
      const formattedValue = typeof value === "number" ? `$${value.toFixed(2)}` : value;
      doc.text(`${label}: ${formattedValue}`, 30, y);
      y += lineHeight;
    });
    y += lineHeight / 2;
  };

  // Add revenue section
  const revenueItems: [string, number][] = [
    ["Total Sales", data.revenue.totalSales],
    ...Object.entries(data.revenue.byPlatform).map(([platform, amount]): [string, number] => [
      `${platform} Sales`,
      amount,
    ]),
  ];
  addSection("Revenue", revenueItems);

  // Add expenses section
  const expenseItems: [string, number][] = [
    ["Shipping Costs", data.expenses.shippingCosts],
    ["Platform Fees", data.expenses.platformFees],
    ["Taxes", data.expenses.taxes],
    ["Other Costs", data.expenses.otherCosts],
  ];
  addSection("Expenses", expenseItems);

  // Add profitability section
  const profitabilityItems: [string, string | number][] = [
    ["Gross Profit", data.profitability.grossProfit],
    ["Net Profit", data.profitability.netProfit],
    ["Profit Margin", `${data.profitability.profitMargin.toFixed(2)}%`],
  ];
  addSection("Profitability", profitabilityItems);

  // Convert to Buffer
  return Buffer.from(doc.output("arraybuffer"));
} 