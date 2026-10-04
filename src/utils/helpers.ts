export class DashProError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "DashProError";
  }
}

export function getErrorMessage(error: unknown, fallback = "حدث خطأ غير متوقع.") {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function copyText(text: string) {
  if (!navigator.clipboard) throw new DashProError("النسخ غير متاح في هذا المتصفح.");
  await navigator.clipboard.writeText(text);
}

export async function readClipboardText() {
  if (!navigator.clipboard) throw new DashProError("اللصق غير متاح في هذا المتصفح.");
  return navigator.clipboard.readText();
}

export function assertNonEmpty(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) throw new DashProError(`${label} مطلوب.`);
  return normalized;
}
