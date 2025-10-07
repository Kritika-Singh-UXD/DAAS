'use client';

import { useState, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useFilters } from '@/hooks/useFilters';
import { QAData } from '@/types';
import { Pill, Stethoscope, TrendingUp, ArrowRight, Users, Activity } from 'lucide-react';

export default function AspirinAnalytics() {
  const { data } = useDashboardStore();
  const { setPartial } = useFilters();
  const [activeTab, setActiveTab] = useState<'specialties' | 'treatments' | 'replacements' | 'related'>('specialties');

  // Filter data to only show aspirin-related entries
  const aspirinData = useMemo(() => {
    return data.filter(entry => 
      entry.drugNames.some(drug => 
        drug.toLowerCase().includes('aspirin') || 
        drug.toLowerCase().includes('acetylsalicylic')
      )
    );
  }, [data]);

  // Mock data for aspirin analytics (in real app, this would come from your API)
  const aspirinAnalytics = useMemo(() => {
    // Extract specialty data from aspirin entries
    const specialtyStats = aspirinData.reduce((acc, entry) => {
      const specialty = entry.specialty;
      if (!acc[specialty]) {
        acc[specialty] = { count: 0, treatments: new Set(), roles: new Set() };
      }
      acc[specialty].count++;
      acc[specialty].treatments.add(entry.treatmentType);
      acc[specialty].roles.add(entry.professionalRole);
      return acc;
    }, {} as Record<string, { count: number; treatments: Set<string>; roles: Set<string> }>);

    // Convert to array and sort by count
    const topSpecialties = Object.entries(specialtyStats)
      .map(([specialty, stats]) => ({
        specialty,
        searchCount: stats.count,
        percentage: Math.round((stats.count / aspirinData.length) * 100),
        treatments: Array.from(stats.treatments).length,
        roles: Array.from(stats.roles)
      }))
      .sort((a, b) => b.searchCount - a.searchCount)
      .slice(0, 8);

    // Mock aspirin treatments based on real medical use cases
    const treatments = [
      {
        name: 'Cardiovascular Prevention',
        usage: 'Primary & Secondary Prevention',
        dosage: '75-100mg daily',
        prescribingDoctors: ['Cardiology', 'Internal Medicine'],
        searchVolume: 245
      },
      {
        name: 'Acute Coronary Syndrome',
        usage: 'Emergency Treatment',
        dosage: '300mg loading, then 75mg daily',
        prescribingDoctors: ['Emergency Medicine', 'Cardiology'],
        searchVolume: 189
      },
      {
        name: 'Pain Management',
        usage: 'Analgesic & Anti-inflammatory',
        dosage: '500mg-1000mg every 4-6 hours',
        prescribingDoctors: ['Family Medicine', 'Rheumatology'],
        searchVolume: 156
      },
      {
        name: 'Stroke Prevention',
        usage: 'Antiplatelet Therapy',
        dosage: '75mg daily',
        prescribingDoctors: ['Neurology', 'Internal Medicine'],
        searchVolume: 134
      },
      {
        name: 'Fever Reduction',
        usage: 'Antipyretic',
        dosage: '500mg every 4 hours',
        prescribingDoctors: ['Pediatrics', 'Family Medicine'],
        searchVolume: 98
      }
    ];

    // Mock aspirin alternatives/replacements
    const replacements = [
      {
        drug: 'Clopidogrel',
        reason: 'Antiplatelet therapy alternative',
        recommendedBy: ['Cardiology', 'Neurology'],
        searchCount: 87,
        advantage: 'Better for aspirin-intolerant patients'
      },
      {
        drug: 'Warfarin',
        reason: 'Anticoagulation for AFib patients',
        recommendedBy: ['Cardiology', 'Internal Medicine'],
        searchCount: 76,
        advantage: 'More potent anticoagulation'
      },
      {
        drug: 'Ibuprofen',
        reason: 'NSAID alternative for pain',
        recommendedBy: ['Rheumatology', 'Family Medicine'],
        searchCount: 65,
        advantage: 'Better GI tolerance in some patients'
      },
      {
        drug: 'Acetaminophen',
        reason: 'Analgesic without bleeding risk',
        recommendedBy: ['Family Medicine', 'Pediatrics'],
        searchCount: 54,
        advantage: 'No antiplatelet effects'
      },
      {
        drug: 'Ticagrelor',
        reason: 'Dual antiplatelet therapy',
        recommendedBy: ['Cardiology', 'Emergency Medicine'],
        searchCount: 43,
        advantage: 'Faster onset, reversible'
      }
    ];

    // Mock related suggestions
    const relatedSuggestions = [
      {
        category: 'Dosing Optimization',
        suggestions: [
          'Low-dose aspirin for cardiovascular protection',
          'Enteric-coated formulations for GI protection',
          'Timing considerations with other medications'
        ],
        searchVolume: 198
      },
      {
        category: 'Drug Interactions',
        suggestions: [
          'Warfarin + Aspirin bleeding risk',
          'ACE inhibitors interaction monitoring',
          'Proton pump inhibitor co-prescription'
        ],
        searchVolume: 167
      },
      {
        category: 'Patient Selection',
        suggestions: [
          'Bleeding risk assessment tools',
          'Age-related dosing considerations',
          'Renal function monitoring'
        ],
        searchVolume: 134
      },
      {
        category: 'Monitoring Parameters',
        suggestions: [
          'Platelet function testing',
          'GI bleeding surveillance',
          'Hepatic function monitoring'
        ],
        searchVolume: 112
      }
    ];

    return {
      topSpecialties,
      treatments,
      replacements,
      relatedSuggestions,
      totalSearches: aspirinData.length
    };
  }, [aspirinData]);

  const applySpecialtyFilter = (specialty: string) => {
    setPartial({ 
      drug: ['Aspirin', 'Acetylsalicylic acid'],
      specialty: [specialty]
    });
  };

  const SpecialtiesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Specialty Doctors Searching About Aspirin</h3>
        <span className="text-sm text-gray-500">{aspirinAnalytics.totalSearches} total searches</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aspirinAnalytics.topSpecialties.map((item, index) => (
          <div 
            key={item.specialty}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => applySpecialtyFilter(item.specialty)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{item.specialty}</h4>
                  <p className="text-sm text-gray-500">{item.searchCount} searches ({item.percentage}%)</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
              <span>{item.treatments} treatment types</span>
              <span>{item.roles.length} role types</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TreatmentsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Treatments Using Aspirin</h3>
      
      <div className="space-y-4">
        {aspirinAnalytics.treatments.map((treatment, index) => (
          <div key={treatment.name} className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                <p className="text-sm text-gray-600">{treatment.usage}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-blue-600">{treatment.searchVolume} searches</span>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  Popular
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Dosage: </span>
                <span className="text-gray-600">{treatment.dosage}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Prescribing Specialties: </span>
                <span className="text-gray-600">{treatment.prescribingDoctors.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ReplacementsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Aspirin Alternatives & Replacements</h3>
      
      <div className="space-y-4">
        {aspirinAnalytics.replacements.map((replacement, index) => (
          <div key={replacement.drug} className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{replacement.drug}</h4>
                <p className="text-sm text-gray-600">{replacement.reason}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-green-600">{replacement.searchCount} recommendations</span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Recommended by: </span>
                <span className="text-gray-600">{replacement.recommendedBy.join(', ')}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Advantage: </span>
                <span className="text-gray-600">{replacement.advantage}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RelatedTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Related Suggestions & Insights</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aspirinAnalytics.relatedSuggestions.map((category, index) => (
          <div key={category.category} className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{category.category}</h4>
              <span className="text-xs text-gray-500">{category.searchVolume} searches</span>
            </div>
            
            <ul className="space-y-2">
              {category.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Aspirin Analytics</h2>
              <p className="text-sm text-gray-600">Comprehensive analysis of aspirin usage patterns</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Showing results for Aspirin
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'specialties', label: 'Specialty Doctors', icon: Users },
            { id: 'treatments', label: 'Treatments', icon: Activity },
            { id: 'replacements', label: 'Replacements', icon: Pill },
            { id: 'related', label: 'Related Insights', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'specialties' && <SpecialtiesTab />}
        {activeTab === 'treatments' && <TreatmentsTab />}
        {activeTab === 'replacements' && <ReplacementsTab />}
        {activeTab === 'related' && <RelatedTab />}
      </div>
    </div>
  );
}