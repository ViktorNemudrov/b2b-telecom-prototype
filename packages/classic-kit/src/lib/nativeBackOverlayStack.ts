import * as React from "react";

type NativeBackHandler = () => boolean;

const stack: NativeBackHandler[] = [];

/**
 * Регистрирует обработчик аппаратной кнопки «Назад» (Capacitor): LIFO по стеку оверлеев.
 * Возвращает отписку (снять при размонтировании / закрытии).
 */
export function pushNativeBackHandler(handler: NativeBackHandler): () => void {
  stack.push(handler);
  return () => {
    const i = stack.lastIndexOf(handler);
    if (i !== -1) stack.splice(i, 1);
  };
}

/** Вызывать с конца стека; true — поглотили событие (оверлей закрыт). */
export function tryConsumeNativeBack(): boolean {
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    if (stack[i]()) return true;
  }
  return false;
}

/**
 * Пока оверлей открыт — системный back (Capacitor) сначала закрывает его, а не history.
 */
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
