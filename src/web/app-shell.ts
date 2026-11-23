import logoSrc from "./assets/brand-logo.svg";
import logoDarkSrc from "./assets/brand-logo-dark.svg";
import manifest from "../../package.json";
import { appDetails } from "../../contracts/app";

// Replace these app-owned assets and brand name when creating a different brand.
export const appBrand = { name: "Codebiz", logoSrc, logoDarkSrc };
export const appVersion = manifest.version;
export const appVersionLabel = `${appDetails.title} - V${appVersion}`;
