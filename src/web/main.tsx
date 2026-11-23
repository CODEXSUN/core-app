import {PlatformGate} from './platform';
import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@workspace/ui/components/sonner";
import { DesignSystemProvider } from "@workspace/ui";
import { GlobalLoaderProvider } from "@workspace/ui/components/global-loader";
import { appBrand } from "./app-shell";
import { appDetails } from "../../contracts/app";
import { Application } from "./modules/home/page";
import "../styles/index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DesignSystemProvider migrateToSilver storageKey={`${appDetails.name}.ui.preferences`}>
      <GlobalLoaderProvider brand={appBrand}>
        <PlatformGate><Application /></PlatformGate>
        <Toaster />
      </GlobalLoaderProvider>
    </DesignSystemProvider>
  </React.StrictMode>,
);
