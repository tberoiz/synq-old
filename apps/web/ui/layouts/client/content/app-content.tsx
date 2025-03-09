export default function AppContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="flex flex-1 flex-col p-4">{children}</div>
    </div>
  );
}
