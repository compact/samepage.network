export { default as CatchBoundary } from "~/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "~/components/DefaultErrorBoundary";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import loadActiveAnalytics from "~/data/loadActiveAnalytics.server";
import { Chart, ChartOptions } from "react-charts";
import { useMemo } from "react";

const AnalyticsActivePage = () => {
  const { data } =
    useLoaderData<Awaited<ReturnType<typeof loadActiveAnalytics>>>();
  const lineChartOptions = useMemo<
    Omit<ChartOptions<typeof data[number]>, "data">
  >(
    () => ({
      primaryAxis: { getValue: (data) => data.date },
      secondaryAxes: [
        {
          getValue: (data) => data.users,
          elementType: "line",
          min: 0,
          tickCount: 4,
        },
      ],
    }),
    []
  );
  return (
    <div className="h-96">
      <Chart
        options={{
          ...lineChartOptions,
          data: [{ label: "Daily Active Users", data }],
        }}
      />
    </div>
  );
};

export const loader: LoaderFunction = ({ context }) => {
  return loadActiveAnalytics({
    // @ts-ignore TODO move remix*Loader from app.* to samepage
    requestId: context?.lambdaContext?.awsRequestId as string,
  });
};

export default AnalyticsActivePage;
