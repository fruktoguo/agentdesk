import { MemphisShapes } from "@/components/ui/memphis-shapes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper p-4">
      <MemphisShapes />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
