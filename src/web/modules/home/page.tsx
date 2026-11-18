import {useWorkspaceAuth} from '../../platform';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui";
import { AsyncState, ContentBoundary } from "@workspace/ui/blocks/async-state";
import { MainLayout } from "@workspace/ui/layouts/main-layout";
import { appBrand, appVersion } from "../../app-shell";
import { NavigationProvider, useNavigation } from "../../navigation";
import {
  getSession,
  WorkspaceAccess,
  type WorkspaceSession,
} from "../../session";
const moduleRoutes = [
  {
    path: "/countries",
    label: "Countries",
    permission: "common/country",
    Component: lazy(() => import("../common/country/page")),
  },
  {
    path: "/states",
    label: "States",
    permission: "common/state",
    Component: lazy(() => import("../common/state/page")),
  },
  {
    path: "/districts",
    label: "Districts",
    permission: "common/district",
    Component: lazy(() => import("../common/district/page")),
  },
  {
    path: "/cities",
    label: "Cities",
    permission: "common/city",
    Component: lazy(() => import("../common/city/page")),
  },
  {
    path: "/pincodes",
    label: "Pincodes",
    permission: "common/pincode",
    Component: lazy(() => import("../common/pincode/page")),
  },
  {
    path: "/ledger-groups",
    label: "Ledger Groups",
    permission: "common/ledger-group",
    Component: lazy(() => import("../common/ledger-group/page")),
  },
  {
    path: "/ledgers",
    label: "Ledgers",
    permission: "common/ledger",
    Component: lazy(() => import("../common/ledger/page")),
  },
  {
    path: "/address-types",
    label: "Address Types",
    permission: "common/address-type",
    Component: lazy(() => import("../common/address-type/page")),
  },
  {
    path: "/bank-names",
    label: "Bank Names",
    permission: "common/bank-name",
    Component: lazy(() => import("../common/bank-name/page")),
  },
  {
    path: "/contact-groups",
    label: "Contact Groups",
    permission: "common/contact-group",
    Component: lazy(() => import("../common/contact-group/page")),
  },
  {
    path: "/contact-types",
    label: "Contact Types",
    permission: "common/contact-type",
    Component: lazy(() => import("../common/contact-type/page")),
  },
  {
    path: "/currencies",
    label: "Currencies",
    permission: "common/currency",
    Component: lazy(() => import("../common/currency/page")),
  },
  {
    path: "/months",
    label: "Months",
    permission: "common/month",
    Component: lazy(() => import("../common/month/page")),
  },
  {
    path: "/payment-terms",
    label: "Payment Terms",
    permission: "common/payment-term",
    Component: lazy(() => import("../common/payment-term/page")),
  },
  {
    path: "/priorities",
    label: "Priorities",
    permission: "common/priority",
    Component: lazy(() => import("../common/priority/page")),
  },
  {
    path: "/sales-types",
    label: "Sales Types",
    permission: "common/sales-type",
    Component: lazy(() => import("../common/sales-type/page")),
  },
  {
    path: "/brands",
    label: "Brands",
    permission: "common/brand",
    Component: lazy(() => import("../common/brand/page")),
  },
  {
    path: "/colours",
    label: "Colours",
    permission: "common/colour",
    Component: lazy(() => import("../common/colour/page")),
  },
  {
    path: "/hsn-codes",
    label: "Hsn Codes",
    permission: "common/hsn-code",
    Component: lazy(() => import("../common/hsn-code/page")),
  },
  {
    path: "/product-categories",
    label: "Product Categories",
    permission: "common/product-category",
    Component: lazy(() => import("../common/product-category/page")),
  },
  {
    path: "/product-groups",
    label: "Product Groups",
    permission: "common/product-group",
    Component: lazy(() => import("../common/product-group/page")),
  },
  {
    path: "/product-types",
    label: "Product Types",
    permission: "common/product-type",
    Component: lazy(() => import("../common/product-type/page")),
  },
  {
    path: "/sizes",
    label: "Sizes",
    permission: "common/size",
    Component: lazy(() => import("../common/size/page")),
  },
  {
    path: "/styles",
    label: "Styles",
    permission: "common/style",
    Component: lazy(() => import("../common/style/page")),
  },
  {
    path: "/taxes",
    label: "Taxes",
    permission: "common/tax",
    Component: lazy(() => import("../common/tax/page")),
  },
  {
    path: "/units",
    label: "Units",
    permission: "common/unit",
    Component: lazy(() => import("../common/unit/page")),
  },
  {
    path: "/destinations",
    label: "Destinations",
    permission: "common/destination",
    Component: lazy(() => import("../common/destination/page")),
  },
  {
    path: "/stock-rejection-types",
    label: "Stock Rejection Types",
    permission: "common/stock-rejection-type",
    Component: lazy(() => import("../common/stock-rejection-type/page")),
  },
  {
    path: "/transports",
    label: "Transports",
    permission: "common/transport",
    Component: lazy(() => import("../common/transport/page")),
  },
  {
    path: "/warehouses",
    label: "Warehouses",
    permission: "common/warehouse",
    Component: lazy(() => import("../common/warehouse/page")),
  },
  {
    path: "/work-order-types",
    label: "Work Order Types",
    permission: "common/work-order-type",
    Component: lazy(() => import("../common/work-order-type/page")),
  },
  {
    path: "/companies",
    label: "Companies",
    permission: "master/company",
    Component: lazy(() => import("../master/company/page")),
  },
  {
    path: "/financial-years",
    label: "Financial Years",
    permission: "master/financial-year",
    Component: lazy(() => import("../master/financial-year/page")),
  },
  {
    path: "/contacts",
    label: "Contacts",
    permission: "master/contact",
    Component: lazy(() => import("../master/contact/page")),
  },
  {
    path: "/products",
    label: "Products",
    permission: "master/product",
    Component: lazy(() => import("../master/product/page")),
  },
  {
    path: "/work-orders",
    label: "Work Orders",
    permission: "master/work-order",
    Component: lazy(() => import("../master/work-order/page")),
  },
  {
    path: "/default-companies",
    label: "Default Companies",
    permission: "master/default-company",
    Component: lazy(() => import("../master/default-company/page")),
  },
];
const Settings = lazy(() => import("../settings/page"));
export function Application() {
  return (
    <NavigationProvider>
      <Workspace />
    </NavigationProvider>
  );
}
function Workspace() {
 const identity=useWorkspaceAuth();
  const { path, navigate } = useNavigation();
  const [session, setSession] = useState<WorkspaceSession | null>(null);
  const [localAccess, setLocalAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [actions, setActions] = useState<{ path: string; value: ReactNode }>();
  const header = useCallback(
    (value: ReactNode) => setActions({ path, value }),
    [path],
  );
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getSession()
      .then((value) => {
        if (active) {
          setSession(value.context);
          setLocalAccess(value.localAccess);
        }
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  const route = moduleRoutes.find(
    (value) => path === value.path || path.startsWith(value.path + "/"),
  );
  const module = route?.label ?? null;
  const label =
    module ??
    (path.startsWith("/settings")
      ? "Settings"
      : path === "/"
        ? "Overview"
        : "Page not found");
  useEffect(() => {
    document.title = label + " · Core";
  }, [label]);
  const tail = path.split("/").filter(Boolean);
  const permission = route?.permission ?? "";
  const ModulePage = route?.Component;
  const canRead = session?.permissions.includes(permission + ":read") ?? false;
  const canWrite =
    session?.permissions.includes(permission + ":write") ?? false;
  return (
    <MainLayout
      className="w-full min-w-0"
      onLogout={()=>void identity?.logout()} applicationName="Core"
      companyBrand={{...appBrand,name:identity?.session.tenant?.name??appBrand.name}}
      appItems={[]}
      navigation={[
        {
          label: "Locations",
          items: [
            { label: "Countries", onSelect: () => navigate("/countries") },
            { label: "States", onSelect: () => navigate("/states") },
            { label: "Districts", onSelect: () => navigate("/districts") },
            { label: "Cities", onSelect: () => navigate("/cities") },
            { label: "Pincodes", onSelect: () => navigate("/pincodes") },
          ],
        },
        {
          label: "Accounts",
          items: [
            {
              label: "Ledger Groups",
              onSelect: () => navigate("/ledger-groups"),
            },
            { label: "Ledgers", onSelect: () => navigate("/ledgers") },
          ],
        },
        {
          label: "Contacts",
          items: [
            {
              label: "Address Types",
              onSelect: () => navigate("/address-types"),
            },
            { label: "Bank Names", onSelect: () => navigate("/bank-names") },
            {
              label: "Contact Groups",
              onSelect: () => navigate("/contact-groups"),
            },
            {
              label: "Contact Types",
              onSelect: () => navigate("/contact-types"),
            },
          ],
        },
        {
          label: "General",
          items: [
            { label: "Currencies", onSelect: () => navigate("/currencies") },
            { label: "Months", onSelect: () => navigate("/months") },
            {
              label: "Payment Terms",
              onSelect: () => navigate("/payment-terms"),
            },
            { label: "Priorities", onSelect: () => navigate("/priorities") },
            { label: "Sales Types", onSelect: () => navigate("/sales-types") },
          ],
        },
        {
          label: "Products",
          items: [
            { label: "Brands", onSelect: () => navigate("/brands") },
            { label: "Colours", onSelect: () => navigate("/colours") },
            { label: "Hsn Codes", onSelect: () => navigate("/hsn-codes") },
            {
              label: "Product Categories",
              onSelect: () => navigate("/product-categories"),
            },
            {
              label: "Product Groups",
              onSelect: () => navigate("/product-groups"),
            },
            {
              label: "Product Types",
              onSelect: () => navigate("/product-types"),
            },
            { label: "Sizes", onSelect: () => navigate("/sizes") },
            { label: "Styles", onSelect: () => navigate("/styles") },
            { label: "Taxes", onSelect: () => navigate("/taxes") },
            { label: "Units", onSelect: () => navigate("/units") },
          ],
        },
        {
          label: "Work orders",
          items: [
            {
              label: "Destinations",
              onSelect: () => navigate("/destinations"),
            },
            {
              label: "Stock Rejection Types",
              onSelect: () => navigate("/stock-rejection-types"),
            },
            { label: "Transports", onSelect: () => navigate("/transports") },
            { label: "Warehouses", onSelect: () => navigate("/warehouses") },
            {
              label: "Work Order Types",
              onSelect: () => navigate("/work-order-types"),
            },
          ],
        },
        {
          label: "Organisation",
          items: [
            { label: "Companies", onSelect: () => navigate("/companies") },
            {
              label: "Financial Years",
              onSelect: () => navigate("/financial-years"),
            },
            {
              label: "Default Companies",
              onSelect: () => navigate("/default-companies"),
            },
          ],
        },
        {
          label: "Master data",
          items: [
            { label: "Contacts", onSelect: () => navigate("/contacts") },
            { label: "Products", onSelect: () => navigate("/products") },
            { label: "Work Orders", onSelect: () => navigate("/work-orders") },
          ],
        },
      ]}
      user={{
        name: identity?.session.user.displayName ?? "Not connected",
        email: "",
        fallback: "CO",
      }}
      selectedPage={label}
      workspaceTitle="Overview"
      onOverviewSelect={() => navigate("/")}
      onSettingsSelect={() => navigate("/settings/appearance")}
      headerName={null}
      headerActions={session && actions?.path === path ? actions.value : null}
      headerBreadcrumbs={[
        {
          label,
          ...(module && tail.length > 1 ? { href: "/" + tail[0] } : {}),
        },
        ...(module && tail.length > 1
          ? [
              {
                label:
                  tail[1] === "new"
                    ? "New"
                    : tail[2] === "edit"
                      ? "Edit"
                      : "Details",
              },
            ]
          : []),
      ]}
      statusLabel={session ? "Connected" : "Not connected"}
      versionLabel={"v " + appVersion}
    >
      <main className={module && tail.length === 1 ? "workspace-list-content space-y-5" : "mx-auto w-full max-w-7xl space-y-5 p-6 sm:p-10"}>
        <h1 className="sr-only">{label}</h1>
        <ContentBoundary resetKey={path}>
          <Suspense fallback={<AsyncState loading>{null}</AsyncState>}>
            {loading || error ? (
              <AsyncState
                loading={loading}
                error={error || undefined}
                onRetry={() => setAttempt((value) => value + 1)}
              >
                {null}
              </AsyncState>
            ) : !session ? (
              <WorkspaceAccess
                localAccess={localAccess}
                onConnected={() => setAttempt((value) => value + 1)}
              />
            ) : path.startsWith("/settings") ? (
              <Settings />
            ) : module && !canRead ? (
              <p role="alert">
                You do not have permission to view this module.
              </p>
            ) : ModulePage ? (
              <ModulePage onHeaderActionsChange={header} canWrite={canWrite} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {label === "Overview" ? "Core master data" : label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    {label === "Overview"
                      ? "Manage all 37 Core modules, including organisation, contacts, products, locations and billing reference data."
                      : "This page could not be found."}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate("/companies")}>
                      Companies
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/financial-years")}
                    >
                      Financial years
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/contacts")}
                    >
                      Contacts
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/default-companies")}
                    >
                      Default company
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </Suspense>
        </ContentBoundary>
      </main>
    </MainLayout>
  );
}
