import { useState } from "react";
import UsageChart, { UsageChartProps } from "package/components/UsageChart";
import Button from "@dvargas92495/app/components/Button";
import apiClient from "package/internal/apiClient";

const UsageChartPage = () => {
  const [usageProps, setUsageProps] = useState<UsageChartProps>();
  return (
    <>
      <Button
        type={"button"}
        onClick={() =>
          apiClient<UsageChartProps>({ method: "usage" }).then(setUsageProps)
        }
      >
        View Usage Chart
      </Button>
      {usageProps && (
        <UsageChart
          isOpen={!!usageProps}
          onClose={() => setUsageProps(undefined)}
          {...usageProps}
        />
      )}
    </>
  );
};

export default UsageChartPage;
