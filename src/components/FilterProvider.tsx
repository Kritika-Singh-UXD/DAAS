'use client';

import { useEffect } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { useDashboardStore } from '@/store/dashboardStore';

interface FilterProviderProps {
  children: React.ReactNode;
}

export default function FilterProvider({ children }: FilterProviderProps) {
  const { filters } = useFilters();
  const { applyFilters } = useDashboardStore();

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters(filters);
  }, [filters, applyFilters]);

  return <>{children}</>;
}