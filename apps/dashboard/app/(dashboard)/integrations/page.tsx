import IntegrationCard from "@ui/cards/integration-card";

// TODO: Simulated data (to be fetched from the database)
const integrationsData = [
  { id: 1, name: "Integration A", description: "Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings and view sales data seamlessly.", isCommingSoon: false},
  { id: 2, name: "Integration B", description: "Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings and view sales data seamlessly.", isCommingSoon: false},
  { id: 3, name: "Integration C", description: "Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings and view sales data seamlessly.", isCommingSoon: true},
  { id: 4, name: "Integration D", description: "Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings and view sales data seamlessly.", isCommingSoon: true},
];

export default function IntegrationsPage() {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {integrationsData.map((integration) => (
          <IntegrationCard
            key={integration.id}
            name={integration.name}
            description={integration.description}
            isComingSoon={integration.isCommingSoon}
          />
        ))}
      </div>
    </>
  );
}
