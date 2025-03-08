import { pdf } from "@react-pdf/renderer";
import { PLReportPDF } from "./PLReportPDF";

interface PLGeneratorProps {
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

export async function generatePLPDF(props: PLGeneratorProps): Promise<Buffer> {
  try {
    // Create PDF instance
    const instance = pdf(
      <PLReportPDF dateRange={props.dateRange} data={props.data} />,
    );

    // Get PDF as array buffer
    const stream = await instance.toBlob();
    const arrayBuffer = await stream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer || buffer.length === 0) {
      throw new Error("Generated PDF is empty");
    }

    return buffer;
  } catch (error) {
    console.error("Error generating PDF:", {
      error,
      props,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    throw new Error(
      "Failed to generate PDF: " +
        (error instanceof Error ? error.message : "Unknown error"),
    );
  }
}
