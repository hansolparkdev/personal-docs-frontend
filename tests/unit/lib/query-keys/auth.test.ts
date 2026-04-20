import { describe, it, expect } from "vitest";
import { authKeys } from "@/lib/query-keys/auth";

describe("authKeys", () => {
  it("all 키를 반환한다", () => {
    expect(authKeys.all()).toEqual(["auth"]);
  });

  it("me 키를 반환한다", () => {
    expect(authKeys.me()).toEqual(["auth", "me"]);
  });
});
