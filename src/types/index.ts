export interface QAData {
  id: string;
  question: string;
  answer: string;
  questionLanguage: string;
  answerLanguage: string;
  specialty: string;
  professionalRole: string;
  yearsExperience: number;
  country: string;
  timestamp: string;
  
  // Model-derived columns
  therapeuticAreas: string[];
  atcCode: string;
  atcDescription: string;
  atcConfidence: number;
  icd10Code: string;
  icd10Description: string;
  icd10Confidence: number;
  icd11Code?: string;
  icd11Description?: string;
  drugClass: string;
  drugNames: string[];
  drugCount: number;
  treatmentType: 'diagnostic' | 'acute' | 'standard_protocol';
  drugUseCategory: 'OTC' | 'prescription' | 'specialty';
  adverseReactionCategory: string[];
  interactionSeverity: 'none' | 'moderate' | 'severe';
  predictedAgeGroup: 'child' | 'adolescent' | 'adult' | 'elderly';
  predictedGender: 'male' | 'female' | 'both';
  
  // Citation columns
  citationCount: number;
  doiList: string[];
  sourceTypes: ('journal' | 'guideline')[];
  
  // Additional placeholders
  englishTranslation?: {
    question: string;
    answer: string;
  };
  commercialDrugNames?: string[];
  manufacturers?: string[];
}

export interface FilterState {
  drug?: string[];            // multi
  company?: string[];         // multi
  therapeuticArea?: string[]; // multi
  country?: string[];         // multi (ISO or names based on current code)
  specialty?: string[];       // multi
  profession?: string[];      // multi
  ageGroup?: string[];        // multi
  gender?: string[];          // multi
  dateFrom?: string;          // ISO
  dateTo?: string;            // ISO
}

// Legacy interface for backward compatibility
export interface LegacyFilterState {
  country: string[];
  specialty: string[];
  professionalRole: string[];
  yearsExperience: [number, number];
  timeRange: [Date, Date];
  atcCode: string[];
  icd10Code: string[];
  ageGroup: string[];
  gender: string[];
  confidenceThreshold: number;
  dataSource: 'all' | 'user' | 'model';
  therapeuticArea: string[];
  drugName: string[];
}

export interface SignalCard {
  id: string;
  title: string;    // drug or therapeutic area
  context: string;  // e.g., "Oncology · Germany"
  pctChange: number;// last 30 vs previous 30
  apply: Partial<FilterState>;
}

export interface GeoAggregate {
  country: string;     // matches current code
  count: number;
  pctChange: number;
  spark: number[];     // small trend sequence
}