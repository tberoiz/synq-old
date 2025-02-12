import IntegrationCard from "@ui/cards/integration-card";
import { createClient } from "@decko/supabase/server";

export default async function IntegrationsPage() {
  // Initialize Supabase client
  const supabase = await createClient();

  // Fetch integration data from the database
  const { data: integrationsData, error: integrationsError } = await supabase
    .from("integration_channels")
    .select("*");

  // Fetch the user's installed integrations
  const { data: userIntegrations, error: userIntegrationsError } = await supabase
    .from("user_integrations")
    .select("integration_channel_id")
    .eq("is_enabled", true);

  // Handle errors
  if (integrationsError || userIntegrationsError) {
    console.error("Error fetching data:", integrationsError || userIntegrationsError);
    return <div>Failed to load integrations. Please try again later.</div>;
  }

  // Extract the IDs of installed integrations
  const installedIntegrationIds = userIntegrations.map(
    (ui) => ui.integration_channel_id
  );

  // Map the fetched data to the expected format
  const mappedIntegrations = integrationsData.map((integration) => ({
    id: integration.id,
    name: integration.name,
    description: integration.description,
    icon_url: `/icons/${integration.name.toLowerCase()}.svg`,
    isComingSoon: integration.status === "coming_soon",
    isInstalled: installedIntegrationIds.includes(integration.id), // Add this field
  }));

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mappedIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            name={integration.name}
            description={integration.description}
            icon_url={integration.icon_url}
            isComingSoon={integration.isComingSoon}
            isInstalled={integration.isInstalled} // Pass this prop
          />
        ))}
      </div>
    </>
  );
}
