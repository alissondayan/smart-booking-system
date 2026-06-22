"use client";

import { sortServicesForDisplay } from "../services/catalog.service";
import { useServices } from "../hooks/use-services";
import { ServiceCard } from "./service-card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";

export function ServicesCatalog() {
  const servicesQuery = useServices();

  if (servicesQuery.isPending) {
    return <EmptyState title="Loading services" description="Fetching available services from the backend." />;
  }

  if (servicesQuery.isError) {
    return <ErrorState description={servicesQuery.error.message} />;
  }

  const services = sortServicesForDisplay(servicesQuery.data);

  if (!services.length) {
    return <EmptyState title="No services available" description="This business has not published active services yet." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
