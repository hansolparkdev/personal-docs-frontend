import { describe, it, expect } from "vitest";
import { fileKeys } from "@/lib/query-keys/files";

describe("fileKeys", () => {
  it("all 키를 반환한다", () => {
    expect(fileKeys.all()).toEqual(["files"]);
  });

  it("list 키를 반환한다", () => {
    expect(fileKeys.list()).toEqual(["files", "list"]);
  });

  it("detail 키를 반환한다", () => {
    expect(fileKeys.detail("abc123")).toEqual(["files", "detail", "abc123"]);
  });
});
