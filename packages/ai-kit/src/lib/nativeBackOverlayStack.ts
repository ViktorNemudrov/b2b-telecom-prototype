import * as React from "react";

type NativeBackHandler = () => boolean;

const stack: NativeBackHandler[] = [];

export function pushNativeBackHandler(handler: NativeBackHandler): () => void {
  stack.push(handler);
  return () => {
    const i = stack.lastIndexOf(handler);
    if (i !== -1) stack.splice(i, 1);
  };
}

export function tryConsumeNativeBack(): boolean {
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    if (stack[i]()) return true;
  }
  return false;
}

export function useOverlayNativeBack(open: boolean, onClose: () => void) {
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (!open) return;
    return pushNativeBackHandler(() => {
      onCloseRef.current();
      return true;
    });
  }, [open]);
}
