import React from "react";
import { Classes, Dialog } from "@blueprintjs/core";

export type UsageChartProps = {
  minutes: number;
  messages: number;
  date: string;
  portalContainer?: HTMLElement;
  onClose: () => void;
};

const UsageChart = ({
  onClose,
  portalContainer,
  ...stats
}: UsageChartProps) => {
  // just doing this to skirt around the React unused import error/umd global catch 22 for now
  const minsConnected = React.useMemo(() => stats.minutes.toFixed(2), []);
  return (
    <Dialog
      onClose={onClose}
      isOpen={true}
      title={"Usage Chart"}
      autoFocus={false}
      enforceFocus={false}
      portalContainer={portalContainer}
    >
      <div className={Classes.DIALOG_BODY}>
        <div className={"flex justify-between items-center"}>
          <b>Description</b>
          <span>
            <b className={"inline-block w-20"}>Price</b>
            <b className={"inline-block w-20"}>Qty</b>
            <b className={"inline-block w-20"}>Total</b>
          </span>
        </div>
        <div className={"flex justify-between items-center"}>
          <span>Mins Conn.</span>
          <span>
            <span className={"inline-block w-20"}>$0.002</span>
            <span className={"inline-block w-20"}>{minsConnected}</span>
            <span className={"inline-block w-20"}>
              ${(stats.minutes * 0.002).toFixed(2)}
            </span>
          </span>
        </div>
        <div className={"flex justify-between items-center"}>
          <span>Messages</span>
          <span>
            <span className={"inline-block w-20"}>$0.01</span>
            <span className={"inline-block w-20"}>
              {stats.messages.toFixed(2)}
            </span>
            <span className={"inline-block w-20"}>
              ${(stats.messages * 0.01).toFixed(2)}
            </span>
          </span>
        </div>
        <hr />
        <div className={"flex justify-between items-center"}>
          <span>
            <b>Total</b> {stats.date && `(Billed: ${stats.date})`}
          </span>
          <span className={"flex items-center"}>
            <b className={"inline-block w-20"}>
              ${(stats.minutes * 0.002 + stats.messages * 0.01).toFixed(2)}
            </b>
          </span>
        </div>
      </div>
    </Dialog>
  );
};

export default UsageChart;
