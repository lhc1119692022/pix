import { describe, expect, it } from "vite-plus/test";
import {
  attachmentPathsFromDrop,
  canDropAttachment,
  PIX_ATTACHMENT_DRAG_TYPE,
  setAttachmentDragPath,
} from "./composer-attachments.ts";

function fakeDataTransfer(files: File[] = [], initialTypes: string[] = []): DataTransfer {
  const values = new Map<string, string>();
  const types = [...initialTypes];
  const fileList = {
    length: files.length,
    item(index: number) {
      return files[index] ?? null;
    },
  } as unknown as FileList;

  return {
    types,
    files: fileList,
    setData(type: string, value: string) {
      values.set(type, value);
      if (!types.includes(type)) types.push(type);
    },
    getData(type: string) {
      return values.get(type) ?? "";
    },
  } as unknown as DataTransfer;
}

describe("composer attachment drag protocol", () => {
  it("marks rendered-image drags as an accepted attachment drop", () => {
    const dataTransfer = fakeDataTransfer();
    setAttachmentDragPath(dataTransfer, "C:\\Downloads\\generated.png");

    expect(dataTransfer.types).toContain(PIX_ATTACHMENT_DRAG_TYPE);
    expect(canDropAttachment(dataTransfer)).toBe(true);
    expect(attachmentPathsFromDrop(dataTransfer, () => "")).toEqual([
      "C:\\Downloads\\generated.png",
    ]);
  });

  it("combines rendered-image and native file drops without duplicates", () => {
    const rendered = {} as File;
    const native = {} as File;
    const dataTransfer = fakeDataTransfer([rendered, native]);
    setAttachmentDragPath(dataTransfer, "/tmp/generated.png");

    expect(
      attachmentPathsFromDrop(dataTransfer, (file) =>
        file === rendered ? "/tmp/generated.png" : "/tmp/source.txt",
      ),
    ).toEqual(["/tmp/generated.png", "/tmp/source.txt"]);
  });

  it("accepts native file drags", () => {
    const dataTransfer = fakeDataTransfer([{} as File], ["Files"]);

    expect(canDropAttachment(dataTransfer)).toBe(true);
    expect(attachmentPathsFromDrop(dataTransfer, () => "C:\\tmp\\photo.jpg")).toEqual([
      "C:\\tmp\\photo.jpg",
    ]);
  });
});
