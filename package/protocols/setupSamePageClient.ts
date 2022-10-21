import {
  addNotebookListener,
  removeNotebookListener,
} from "../internal/setupMessageHandlers";
import setupP2PFeatures from "../internal/setupP2PFeatures";
import type {
  AddCommand,
  RemoveCommand,
  RenderOverlay,
  GetSetting,
  SetSetting,
  LogEvent,
} from "../types";
import APPS, { appIdByName } from "../internal/apps";
import setupRegistry from "../internal/registry";
import sendToNotebook from "../internal/sendToNotebook";
import setupWsFeatures from "../internal/setupWsFeatures";
import { onAppEvent } from "package/internal/registerAppEventListener";

const setupSamePageClient = ({
  app,
  workspace,
  addCommand,
  removeCommand,
  renderOverlay,
  getSetting,
  setSetting,
  appRoot,
  onAppLog = (e) => console.log(`(${e.id}) ${e.content}`),
}: {
  addCommand?: AddCommand;
  removeCommand?: RemoveCommand;
  renderOverlay?: RenderOverlay;
  getSetting?: GetSetting;
  setSetting?: SetSetting;
  workspace?: string;
  app?: typeof APPS[number]["name"];
  appRoot?: HTMLElement;
  onAppLog?: (e: LogEvent) => void;
} = {}) => {
  setupRegistry({
    addCommand,
    removeCommand,
    renderOverlay,
    getSetting,
    setSetting,
    app: app ? appIdByName[app] : undefined,
    workspace,
    appRoot,
  });
  const unloadWS = setupWsFeatures();
  const unloadP2P = setupP2PFeatures();
  onAppEvent("log", onAppLog);

  if (typeof window !== "undefined") {
    window.samepage = {
      addNotebookListener,
      removeNotebookListener,
      sendToNotebook,
    };
    document.body.dispatchEvent(new CustomEvent("samepage:loaded"));
  }

  return {
    unload: () => {
      unloadP2P();
      unloadWS();
    },
    addNotebookListener,
    removeNotebookListener,
    sendToNotebook,
  };
};

export default setupSamePageClient;
