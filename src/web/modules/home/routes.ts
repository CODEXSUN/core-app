export type Page =
  | "Overview"
  | "Settings"
  | "Records"
  | "Cities"
  | "Page not found"
  | `Module:${string}`;
export type ModuleRoute = { key: string; label: string; path: string };
export function pageLabel(
  page: Page,
  modules: readonly ModuleRoute[] = [],
): string {
  return page.startsWith("Module:")
    ? (modules.find((module) => "Module:" + module.key === page)?.label ??
        "Page not found")
    : page;
}
export function pageForPath(
  path: string,
  cityEnabled = false,
  modules: readonly ModuleRoute[] = [],
): Page {
  const module = modules.find(
    (module) =>
      module.path === path ||
      module.path + "/new" === path ||
      (path.startsWith(module.path + "/") &&
        /^[a-z0-9]{8}\/edit$/.test(path.slice(module.path.length + 1))),
  );
  if (module) return `Module:${module.key}`;
  if (cityEnabled && path === "/cities") return "Cities";
  if (path === "/") return "Overview";
  if (path === "/settings" || path === "/settings/appearance")
    return "Settings";
  if (path === "/records") return "Records";
  return "Page not found";
}
export function pathForPage(
  page: Page,
  modules: readonly ModuleRoute[] = [],
): string {
  if (page.startsWith("Module:"))
    return (
      modules.find((module) => "Module:" + module.key === page)?.path ?? "/"
    );
  if (page === "Cities") return "/cities";
  if (page === "Settings") return "/settings/appearance";
  if (page === "Records") return "/records";
  return "/";
}
