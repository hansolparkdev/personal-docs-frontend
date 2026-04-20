import { Dropzone } from "@/features/docs/components/Dropzone";
import { DocList } from "@/features/docs/components/DocList";

export default function DocsPage() {
  return (
    <div className="p-10 space-y-6 overflow-auto flex-1">
      <div>
        <h1 className="text-xl font-semibold">내 문서</h1>
        <p className="text-sm text-[var(--fg-3)] mt-1">
          업로드한 문서를 관리하고 AI와 대화하세요
        </p>
      </div>

      <Dropzone />

      <DocList />
    </div>
  );
}
