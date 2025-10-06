import { QAData } from '@/types';

const generateMockData = (): QAData[] => {
  const specialties = ['Cardiology', 'Oncology', 'Neurology', 'Endocrinology', 'Rheumatology', 'Psychiatry', 'Pediatrics', 'Internal Medicine'];
  const countries = ['USA', 'UK', 'Germany', 'France', 'Japan', 'Canada', 'Australia', 'Spain', 'Italy', 'Netherlands'];
  const roles = ['Physician', 'Nurse Practitioner', 'Pharmacist', 'Medical Student', 'Resident', 'Fellow'];
  const drugs = ['Metformin', 'Atorvastatin', 'Lisinopril', 'Omeprazole', 'Amlodipine', 'Metoprolol', 'Simvastatin', 'Losartan', 'Gabapentin', 'Sertraline', 'Levothyroxine', 'Azithromycin'];
  const therapeuticAreas = ['Cardiovascular', 'Metabolic', 'CNS', 'Oncology', 'Immunology', 'Infectious Disease', 'Respiratory', 'Gastrointestinal'];
  const adverseReactions = ['renal', 'hepatic', 'neurological', 'cardiovascular', 'gastrointestinal', 'hematological'];
  
  const data: QAData[] = [];
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < 500; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 365));
    
    const selectedDrugs = drugs
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 1);
    
    const selectedTherapeuticAreas = therapeuticAreas
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 1);
    
    const selectedAdverseReactions = adverseReactions
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3));
    
    data.push({
      id: `qa_${i + 1}`,
      question: `What is the recommended treatment approach for ${selectedDrugs[0]} in patients with ${selectedTherapeuticAreas[0]} conditions?`,
      answer: `The recommended approach involves careful monitoring and dose adjustment based on patient response. Consider potential interactions with other medications.`,
      questionLanguage: 'en',
      answerLanguage: 'en',
      specialty: specialties[Math.floor(Math.random() * specialties.length)],
      professionalRole: roles[Math.floor(Math.random() * roles.length)],
      yearsExperience: Math.floor(Math.random() * 30) + 1,
      country: countries[Math.floor(Math.random() * countries.length)],
      timestamp: date.toISOString(),
      
      therapeuticAreas: selectedTherapeuticAreas,
      atcCode: `${['A', 'B', 'C', 'D', 'G', 'H', 'J', 'L', 'M', 'N'][Math.floor(Math.random() * 10)]}${Math.floor(Math.random() * 10)}${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}`,
      atcDescription: `${selectedTherapeuticAreas[0]} therapeutic agent`,
      atcConfidence: 0.7 + Math.random() * 0.3,
      icd10Code: `${['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'][Math.floor(Math.random() * 10)]}${Math.floor(Math.random() * 90) + 10}`,
      icd10Description: `${selectedTherapeuticAreas[0]} disorder`,
      icd10Confidence: 0.6 + Math.random() * 0.4,
      drugClass: `${selectedTherapeuticAreas[0]} agents`,
      drugNames: selectedDrugs,
      drugCount: selectedDrugs.length,
      treatmentType: ['diagnostic', 'acute', 'standard_protocol'][Math.floor(Math.random() * 3)] as 'diagnostic' | 'acute' | 'standard_protocol',
      drugUseCategory: ['OTC', 'prescription', 'specialty'][Math.floor(Math.random() * 3)] as 'OTC' | 'prescription' | 'specialty',
      adverseReactionCategory: selectedAdverseReactions,
      interactionSeverity: ['none', 'moderate', 'severe'][Math.floor(Math.random() * 3)] as 'none' | 'moderate' | 'severe',
      predictedAgeGroup: ['child', 'adolescent', 'adult', 'elderly'][Math.floor(Math.random() * 4)] as 'child' | 'adolescent' | 'adult' | 'elderly',
      predictedGender: ['male', 'female', 'both'][Math.floor(Math.random() * 3)] as 'male' | 'female' | 'both',
      
      citationCount: Math.floor(Math.random() * 10),
      doiList: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => `10.${1000 + Math.floor(Math.random() * 9000)}/journal.${2024}.${100000 + j}`),
      sourceTypes: Math.random() > 0.5 ? ['journal'] : ['guideline'],
    });
  }
  
  return data;
};

export const mockData = generateMockData();