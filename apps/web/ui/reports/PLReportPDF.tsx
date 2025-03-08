import { format } from "date-fns";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 30,
    fontFamily: "Helvetica",
  } satisfies Style,
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#1a1a1a",
  } satisfies Style,
  subHeader: {
    fontSize: 14,
    marginBottom: 10,
    color: "#666",
  } satisfies Style,
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  } satisfies Style,
  table: {
    display: "flex",
    width: "auto",
    marginVertical: 10,
  } satisfies Style,
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
    alignItems: "center",
    minHeight: 30,
  } satisfies Style,
  tableHeader: {
    backgroundColor: "#f7f7f7",
  } satisfies Style,
  tableCell: {
    flex: 1,
    padding: 5,
  } satisfies Style,
  tableCellAmount: {
    flex: 1,
    padding: 5,
    textAlign: "right",
  } satisfies Style,
  text: {
    fontSize: 10,
    color: "#333",
  } satisfies Style,
  bold: {
    fontWeight: "bold",
  } satisfies Style,
  total: {
    borderTopWidth: 2,
    borderTopColor: "#333",
    borderTopStyle: "solid",
  } satisfies Style,
});

interface PLReportPDFProps {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  data: {
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
  };
}

export function PLReportPDF({ dateRange, data }: PLReportPDFProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.header}>Profit & Loss Statement</Text>
          <Text style={styles.subHeader}>
            {format(dateRange.startDate, "PPP")} -{" "}
            {format(dateRange.endDate, "PPP")}
          </Text>
        </View>

        {/* Revenue Section */}
        <View style={styles.section}>
          <Text style={[styles.text, styles.bold]}>Revenue</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCell}>
                <Text style={[styles.text, styles.bold]}>Category</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={[styles.text, styles.bold]}>Amount</Text>
              </View>
            </View>
            {Object.entries(data.revenue.byPlatform).map(
              ([platform, amount]) => (
                <View key={platform} style={styles.tableRow}>
                  <View style={styles.tableCell}>
                    <Text style={styles.text}>{platform} Sales</Text>
                  </View>
                  <View style={styles.tableCellAmount}>
                    <Text style={styles.text}>{formatCurrency(amount)}</Text>
                  </View>
                </View>
              ),
            )}
            <View style={[styles.tableRow, styles.total]}>
              <View style={styles.tableCell}>
                <Text style={[styles.text, styles.bold]}>Total Revenue</Text>
              </View>
              <View style={styles.tableCellAmount}>
                <Text style={[styles.text, styles.bold]}>
                  {formatCurrency(data.revenue.totalSales)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Expenses Section */}
        <View style={styles.section}>
          <Text style={[styles.text, styles.bold]}>Expenses</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCell}>
                <Text style={[styles.text, styles.bold]}>Category</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={[styles.text, styles.bold]}>Amount</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.text}>Shipping Costs</Text>
              </View>
              <View style={styles.tableCellAmount}>
                <Text style={styles.text}>
                  {formatCurrency(data.expenses.shippingCosts)}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.text}>Platform Fees</Text>
              </View>
              <View style={styles.tableCellAmount}>
                <Text style={styles.text}>
                  {formatCurrency(data.expenses.platformFees)}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.text}>Taxes</Text>
              </View>
              <View style={styles.tableCellAmount}>
                <Text style={styles.text}>
                  {formatCurrency(data.expenses.taxes)}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.text}>Other Costs</Text>
              </View>
              <View style={styles.tableCellAmount}>
                <Text style={styles.text}>
                  {formatCurrency(data.expenses.otherCosts)}
                </Text>
              </View>
            </View>
            <View style={[styles.tableRow, styles.total]}>
              <View style={styles.tableCell}>
                <Text style={[styles.text, styles.bold]}>Total Expenses</Text>
              </View>
              <View style={styles.tableCellAmount}>
                <Text style={[styles.text, styles.bold]}>
                  {formatCurrency(
                    data.expenses.shippingCosts +
                      data.expenses.platformFees +
                      data.expenses.taxes +
                      data.expenses.otherCosts,
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profitability Section */}
        <View style={styles.section}>
          <Text style={[styles.text, styles.bold]}>Profitability</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCell}>
                <Text style={[styles.text, styles.bold]}>Metric</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={[styles.text, styles.bold]}>Amount</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.text}>Gross Profit</Text>
              </View>
              <View style={styles.tableCellAmount}>
                <Text style={styles.text}>
                  {formatCurrency(data.profitability.grossProfit)}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.text}>Net Profit</Text>
              </View>
              <View style={styles.tableCellAmount}>
                <Text style={styles.text}>
                  {formatCurrency(data.profitability.netProfit)}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.text}>Profit Margin</Text>
              </View>
              <View style={styles.tableCellAmount}>
                <Text style={styles.text}>
                  {formatPercentage(data.profitability.profitMargin)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
