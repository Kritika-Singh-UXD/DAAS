import { create } from 'zustand';
import { FilterState, LegacyFilterState, QAData } from '@/types';
import { mockData } from '@/lib/mockData';

interface DashboardStore {
  data: QAData[];
  filteredData: QAData[];
  legacyFilters: LegacyFilterState;
  setLegacyFilter: <K extends keyof LegacyFilterState>(key: K, value: LegacyFilterState[K]) => void;
  resetLegacyFilters: () => void;
  applyLegacyFilters: () => void;
  applyNewFilters: (filters: FilterState) => void;
}

const initialLegacyFilters: LegacyFilterState = {
  country: [],
  specialty: [],
  professionalRole: [],
  yearsExperience: [0, 50],
  timeRange: [new Date('2024-01-01'), new Date('2024-12-31')],
  atcCode: [],
  icd10Code: [],
  ageGroup: [],
  gender: [],
  confidenceThreshold: 0.5,
  dataSource: 'all',
  therapeuticArea: [],
  drugName: [],
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  data: mockData,
  filteredData: mockData,
  legacyFilters: initialLegacyFilters,
  
  setLegacyFilter: (key, value) => {
    set((state) => ({
      legacyFilters: { ...state.legacyFilters, [key]: value }
    }));
    get().applyLegacyFilters();
  },
  
  resetLegacyFilters: () => {
    set({ legacyFilters: initialLegacyFilters, filteredData: get().data });
  },
  
  applyNewFilters: (filters: FilterState) => {
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
  
  applyLegacyFilters: () => {
    const { data, legacyFilters } = get();
    
    let filtered = [...data];
    
    // Apply country filter
    if (legacyFilters.country.length > 0) {
      filtered = filtered.filter(item => legacyFilters.country.includes(item.country));
    }
    
    // Apply specialty filter
    if (legacyFilters.specialty.length > 0) {
      filtered = filtered.filter(item => legacyFilters.specialty.includes(item.specialty));
    }
    
    // Apply professional role filter
    if (legacyFilters.professionalRole.length > 0) {
      filtered = filtered.filter(item => legacyFilters.professionalRole.includes(item.professionalRole));
    }
    
    // Apply years of experience filter
    filtered = filtered.filter(item => 
      item.yearsExperience >= legacyFilters.yearsExperience[0] && 
      item.yearsExperience <= legacyFilters.yearsExperience[1]
    );
    
    // Apply time range filter
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= legacyFilters.timeRange[0] && itemDate <= legacyFilters.timeRange[1];
    });
    
    // Apply therapeutic area filter
    if (legacyFilters.therapeuticArea.length > 0) {
      filtered = filtered.filter(item => 
        item.therapeuticAreas.some(area => legacyFilters.therapeuticArea.includes(area))
      );
    }
    
    // Apply drug name filter
    if (legacyFilters.drugName.length > 0) {
      filtered = filtered.filter(item => 
        item.drugNames.some(drug => legacyFilters.drugName.includes(drug))
      );
    }
    
    // Apply age group filter
    if (legacyFilters.ageGroup.length > 0) {
      filtered = filtered.filter(item => legacyFilters.ageGroup.includes(item.predictedAgeGroup));
    }
    
    // Apply gender filter
    if (legacyFilters.gender.length > 0) {
      filtered = filtered.filter(item => legacyFilters.gender.includes(item.predictedGender));
    }
    
    // Apply confidence threshold
    filtered = filtered.filter(item => 
      item.atcConfidence >= legacyFilters.confidenceThreshold && 
      item.icd10Confidence >= legacyFilters.confidenceThreshold
    );
    
    set({ filteredData: filtered });
  },
}));