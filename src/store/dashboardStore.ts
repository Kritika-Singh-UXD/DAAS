import { create } from 'zustand';
import { FilterState, QAData } from '@/types';
import { mockData } from '@/lib/mockData';

interface DashboardStore {
  data: QAData[];
  filteredData: QAData[];
  applyFilters: (filters: FilterState) => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  data: mockData,
  filteredData: mockData,
  
  applyFilters: (filters: FilterState) => {
    const { data } = get();
    
    let filtered = [...data];
    
    // Apply drug filter
    if (filters.drug && filters.drug.length > 0) {
      filtered = filtered.filter(item => 
        item.drugNames.some(drug => filters.drug!.includes(drug))
      );
    }
    
    // Apply company filter (using manufacturers field)
    if (filters.company && filters.company.length > 0) {
      filtered = filtered.filter(item => 
        item.manufacturers?.some(company => filters.company!.includes(company))
      );
    }
    
    // Apply therapeutic area filter
    if (filters.therapeuticArea && filters.therapeuticArea.length > 0) {
      filtered = filtered.filter(item => 
        item.therapeuticAreas.some(area => filters.therapeuticArea!.includes(area))
      );
    }
    
    // Apply country filter
    if (filters.country && filters.country.length > 0) {
      filtered = filtered.filter(item => filters.country!.includes(item.country));
    }
    
    // Apply specialty filter
    if (filters.specialty && filters.specialty.length > 0) {
      filtered = filtered.filter(item => filters.specialty!.includes(item.specialty));
    }
    
    // Apply profession filter (using professionalRole field)
    if (filters.profession && filters.profession.length > 0) {
      filtered = filtered.filter(item => filters.profession!.includes(item.professionalRole));
    }
    
    // Apply age group filter
    if (filters.ageGroup && filters.ageGroup.length > 0) {
      filtered = filtered.filter(item => filters.ageGroup!.includes(item.predictedAgeGroup));
    }
    
    // Apply gender filter
    if (filters.gender && filters.gender.length > 0) {
      filtered = filtered.filter(item => filters.gender!.includes(item.predictedGender));
    }
    
    // Apply date range filter
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1900-01-01');
        const toDate = filters.dateTo ? new Date(filters.dateTo) : new Date('2100-12-31');
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }
    
    set({ filteredData: filtered });
  },
}));