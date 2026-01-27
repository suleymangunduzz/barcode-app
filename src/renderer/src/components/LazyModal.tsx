import React, { lazy, Suspense, useMemo } from "react";
import ReactDOM from "react-dom";

type Loader = () => Promise<{ default: React.ComponentType<any> }>;
type LazyComponent = React.LazyExoticComponent<React.ComponentType<any>>;

type Props = {
  /** A dynamic import loader, e.g. `() => import("./MyModal")` */
  loader?: Loader;
  /** Or pass a pre-created lazy component: `lazy(() => import(...))` */
  component?: LazyComponent;
  open: boolean;
  onClose: () => void;
  fallback?: React.ReactNode;
  portalTarget?: Element | null;
  [key: string]: any;
};

export default function LazyModal({
  loader,
  component,
  open,
  onClose,
  fallback = null,
  portalTarget = null,
  ...props
}: Props) {
  const Component: LazyComponent = useMemo(() => {
    if (component) return component;
    if (!loader)
      throw new Error("LazyModal requires either `loader` or `component`");
    return lazy(loader);
    // Intentionally only recreate when the provided references change
  }, [loader, component]);

  if (!open) return null;

  const target = portalTarget ?? document.body;

  return ReactDOM.createPortal(
    <Suspense fallback={fallback}>
      <Component onClose={onClose} {...props} />
    </Suspense>,
    target,
  );
}
