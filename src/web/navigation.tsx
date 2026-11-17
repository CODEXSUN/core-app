import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Guard = (action: () => void) => boolean;
type Navigation = {
  path: string;
  navigate: (path: string, committed?: boolean) => void;
  setGuard: (guard: Guard | null) => void;
};
const NavigationContext = createContext<Navigation | null>(null);
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname);
  const index = useRef(Number(window.history.state?.coreIndex ?? 0));
  const guard = useRef<Guard | null>(null);
  const restore = useRef<null | { delta: number }>(null);
  const bypass = useRef(false);
  const setGuard = useCallback((value: Guard | null) => {
    guard.current = value;
  }, []);
  const navigate = useCallback((next: string, committed = false) => {
    const action = () => {
      if (window.location.pathname !== next) {
        index.current++;
        window.history.pushState({ coreIndex: index.current }, "", next);
      }
      setPath(next);
    };
    if (committed || !guard.current) action();
    else guard.current(action);
  }, []);
  useEffect(() => {
    window.history.replaceState(
      { ...window.history.state, coreIndex: index.current },
      "",
    );
    const sync = (event: PopStateEvent) => {
      const next = Number(event.state?.coreIndex ?? 0);
      if (restore.current) {
        const { delta } = restore.current;
        restore.current = null;
        const action = () => {
          bypass.current = true;
          window.history.go(delta);
        };
        if (guard.current) guard.current(action);
        else action();
        return;
      }
      if (!bypass.current && guard.current && next !== index.current) {
        const delta = next - index.current;
        restore.current = { delta };
        window.history.go(-delta);
        return;
      }
      bypass.current = false;
      index.current = next;
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  useEffect(() => {
    const follow = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target ||
        link.hasAttribute("download")
      )
        return;
      const url = new URL(link.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname.startsWith("/api/")
      )
        return;
      event.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", follow);
    return () => document.removeEventListener("click", follow);
  }, [navigate]);
  return (
    <NavigationContext.Provider value={{ path, navigate, setGuard }}>
      {children}
    </NavigationContext.Provider>
  );
}
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("Navigation is unavailable.");
  return context;
}
