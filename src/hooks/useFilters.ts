'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { FilterState } from '@/types';

const DEFAULT_DATE_FROM = '2024-01-01'; // Match mock data start date
const DEFAULT_DATE_TO = new Date().toISOString().split('T')[0]; // today

export function useFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  // Read filters from URL params
  const readFromUrl = useCallback((): FilterState => {
    const params = new URLSearchParams(searchParams.toString());
    
    const parseMultiValue = (key: string): string[] | undefined => {
      const value = params.get(key);
      return value ? value.split(',').filter(Boolean) : undefined;
    };
    
    return {
      drug: parseMultiValue('drug'),
      company: parseMultiValue('company'),
      therapeuticArea: parseMultiValue('ta'),
      country: parseMultiValue('country'),
      specialty: parseMultiValue('sp'),
      profession: parseMultiValue('prof'),
      ageGroup: parseMultiValue('age'),
      gender: parseMultiValue('gender'),
      dateFrom: params.get('from') || DEFAULT_DATE_FROM,
      dateTo: params.get('to') || DEFAULT_DATE_TO,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<FilterState>(readFromUrl);

  // Write filters to URL
  const writeToUrl = useCallback((nextFilters: FilterState) => {
    const params = new URLSearchParams();
    
    const addMultiValue = (key: string, values?: string[]) => {
      if (values && values.length > 0) {
        params.set(key, values.join(','));
      }
    };
    
    const addSingleValue = (key: string, value?: string) => {
      if (value) {
        params.set(key, value);
      }
    };
    
    addMultiValue('drug', nextFilters.drug);
    addMultiValue('company', nextFilters.company);
    addMultiValue('ta', nextFilters.therapeuticArea);
    addMultiValue('country', nextFilters.country);
    addMultiValue('sp', nextFilters.specialty);
    addMultiValue('prof', nextFilters.profession);
    addMultiValue('age', nextFilters.ageGroup);
    addMultiValue('gender', nextFilters.gender);
    addSingleValue('from', nextFilters.dateFrom);
    addSingleValue('to', nextFilters.dateTo);
    
    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router]);

  // Set partial filters
  const setPartial = useCallback((patch: Partial<FilterState>) => {
    const nextFilters = { ...filters, ...patch };
    setFilters(nextFilters);
    writeToUrl(nextFilters);
  }, [filters, writeToUrl]);

  // Clear all filters
  const clearAll = useCallback((keepDateDefault = true) => {
    const clearedFilters: FilterState = keepDateDefault ? {
      dateFrom: DEFAULT_DATE_FROM,
      dateTo: DEFAULT_DATE_TO,
    } : {};
    
    setFilters(clearedFilters);
    writeToUrl(clearedFilters);
  }, [writeToUrl]);

  // Update filters when URL changes
  useEffect(() => {
    const urlFilters = readFromUrl();
    setFilters(urlFilters);
  }, [readFromUrl]);

  // Apply defaults when no filters are present
  useEffect(() => {
    const hasAnyFilters = Object.values(filters).some(value => 
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    );
    
    if (!hasAnyFilters) {
      // Set default date range if no filters are present
      const defaultFilters: FilterState = {
        dateFrom: DEFAULT_DATE_FROM,
        dateTo: DEFAULT_DATE_TO,
      };
      setFilters(defaultFilters);
      writeToUrl(defaultFilters);
    }
  }, []); // Only run on mount

  return {
    filters,
    setPartial,
    clearAll,
    readFromUrl,
    writeToUrl,
  };
}