/** Shared drag-and-drop protocol for local attachments inside the renderer. */
export const PIX_ATTACHMENT_DRAG_TYPE = "application/x-pix-attachment-path";

function hasType(dataTransfer: DataTransfer, type: string): boolean {
  return Array.from(dataTransfer.types ?? []).includes(type);
}

export function canDropAttachment(dataTransfer: DataTransfer | null | undefined): boolean {
  if (!dataTransfer) return false;
  return hasType(dataTransfer, "Files") || hasType(dataTransfer, PIX_ATTACHMENT_DRAG_TYPE);
}

/** Put a local path on a drag started by a rendered Pix image. */
export function setAttachmentDragPath(
  dataTransfer: DataTransfer | null | undefined,
  path: string,
): void {
  const value = path.trim();
  if (!dataTransfer || !value) return;
  try {
    dataTransfer.setData(PIX_ATTACHMENT_DRAG_TYPE, value);
    dataTransfer.effectAllowed = "copy";
  } catch {
    // Some browser-managed drags expose a read-only data transfer object.
  }
}

/** Read both Pix image drags and native file-system drags into attachment paths. */
export function attachmentPathsFromDrop(
  dataTransfer: DataTransfer | null | undefined,
  pathForFile: (file: File) => string,
): string[] {
  if (!dataTransfer) return [];

  const paths: string[] = [];
  const seen = new Set<string>();
  const add = (path: string | undefined) => {
    const value = path?.trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    paths.push(value);
  };

  try {
    add(dataTransfer.getData(PIX_ATTACHMENT_DRAG_TYPE));
  } catch {
    // The custom type is unavailable for this drag source.
  }

  const files = dataTransfer.files;
  for (let index = 0; index < (files?.length ?? 0); index += 1) {
    const file = files.item(index);
    if (!file) continue;
    try {
      add(pathForFile(file));
    } catch {
      // Ignore individual files that Electron cannot resolve to a native path.
    }
  }

  return paths;
}
