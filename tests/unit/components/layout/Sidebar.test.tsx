import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPush = vi.fn();
const mockPathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}));

import { Sidebar } from "@/components/layout/Sidebar";

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/");
  });

  it("WordMark를 렌더링한다", () => {
    render(<Sidebar />);
    expect(screen.getByTestId("wordmark-dot")).toBeInTheDocument();
    expect(screen.getByText("Personal Docs")).toBeInTheDocument();
  });

  it("새 챗 시작 버튼을 렌더링한다", () => {
    render(<Sidebar />);
    expect(screen.getByText("새 챗 시작")).toBeInTheDocument();
  });

  it("내 문서 메뉴 항목을 렌더링한다", () => {
    render(<Sidebar />);
    expect(screen.getByText("내 문서")).toBeInTheDocument();
  });

  it("챗 메뉴 항목을 렌더링한다", () => {
    render(<Sidebar />);
    expect(screen.getByText("챗")).toBeInTheDocument();
  });

  it("유저 푸터를 렌더링한다", () => {
    render(<Sidebar />);
    expect(screen.getByText("박한솔")).toBeInTheDocument();
  });

  it("로그아웃 버튼이 있고 클릭 시 /login 으로 이동한다", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    const logoutBtn = screen.getByRole("button", { name: "로그아웃" });
    await user.click(logoutBtn);
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("새 챗 시작 클릭 시 /chat 으로 이동한다", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    await user.click(screen.getByText("새 챗 시작"));
    expect(mockPush).toHaveBeenCalledWith("/chat");
  });

  it("/docs 경로일 때 내 문서가 활성화된다", () => {
    mockPathname.mockReturnValue("/docs");
    render(<Sidebar />);
    const docsButton = screen.getByText("내 문서").closest("button");
    expect(docsButton?.className).toContain("bg-accent");
  });

  it("/chat 경로일 때 챗이 활성화된다", () => {
    mockPathname.mockReturnValue("/chat");
    render(<Sidebar />);
    const chatButton = screen.getByText("챗").closest("button");
    expect(chatButton?.className).toContain("bg-accent");
  });

  it("recentChats 없으면 빈 상태 문구를 표시한다", () => {
    render(<Sidebar />);
    expect(screen.getByText("아직 대화 기록이 없어요")).toBeInTheDocument();
  });

  it("recentChats 3개를 렌더링한다", () => {
    const chats = [
      { id: "1", title: "첫 번째 대화" },
      { id: "2", title: "두 번째 대화" },
      { id: "3", title: "세 번째 대화" },
    ];
    render(<Sidebar recentChats={chats} />);
    expect(screen.getByText("첫 번째 대화")).toBeInTheDocument();
    expect(screen.getByText("두 번째 대화")).toBeInTheDocument();
    expect(screen.getByText("세 번째 대화")).toBeInTheDocument();
  });

  it("Sidebar 는 w-[260px] 클래스를 가진다", () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("w-[260px]");
  });
});
