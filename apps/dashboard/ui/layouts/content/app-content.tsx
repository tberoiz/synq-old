export default function AppContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full">
        <div className="flex flex-1 flex-col gap-4 p-4 z-10">{children}</div>
    </div>
  );
}
