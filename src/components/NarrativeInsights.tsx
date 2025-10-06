'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useFilters } from '@/hooks/useFilters';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  Users,
  Globe,
  Clock,
  Lightbulb,
  ChevronRight
} from 'lucide-react';

export default function NarrativeInsights() {
  const { filteredData } = useDashboardStore();
  const { filters } = useFilters();

  const insights = useMemo(() => {
    if (filteredData.length === 0) return [];

    const narratives = [];

    // 1. Volume Insight
    const totalInteractions = filteredData.length;
    const uniquePhysicians = new Set(filteredData.map(d => `${d.specialty}-${d.country}`)).size;
    
    narratives.push({
      type: 'volume',
      icon: Users,
      title: 'Physician Engagement Level',
      main: `${totalInteractions.toLocaleString()} interactions from approximately ${uniquePhysicians} physician profiles`,
      detail: totalInteractions > 100 
        ? 'High engagement indicates strong interest in this topic area'
        : 'Limited engagement - consider expanding reach or education efforts',
      actionable: false
    });

    // 2. Top Drug Insight
    const drugCounts = new Map<string, number>();
    filteredData.forEach(item => {
      item.drugNames.forEach(drug => {
        drugCounts.set(drug, (drugCounts.get(drug) || 0) + 1);
      });
    });
    
    const topDrugs = Array.from(drugCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    if (topDrugs.length > 0) {
      const [topDrug, topCount] = topDrugs[0];
      const percentage = Math.round((topCount / totalInteractions) * 100);
      
      narratives.push({
        type: 'drug-focus',
        icon: Target,
        title: 'Drug Focus Analysis',
        main: `${topDrug} dominates with ${percentage}% of all interactions`,
        detail: topDrugs.length > 1 
          ? `Followed by ${topDrugs[1][0]} (${Math.round((topDrugs[1][1] / totalInteractions) * 100)}%) ${topDrugs[2] ? `and ${topDrugs[2][0]}` : ''}`
          : 'No significant secondary drugs in this dataset',
        actionable: percentage > 60
      });
    }

    // 3. Geographic Concentration
    const countryCounts = new Map<string, number>();
    filteredData.forEach(item => {
      countryCounts.set(item.country, (countryCounts.get(item.country) || 0) + 1);
    });
    
    const topCountries = Array.from(countryCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    if (topCountries.length > 0) {
      const [topCountry, topCountryCount] = topCountries[0];
      const geoConcentration = Math.round((topCountryCount / totalInteractions) * 100);
      
      narratives.push({
        type: 'geography',
        icon: Globe,
        title: 'Geographic Distribution',
        main: `${topCountry} leads with ${geoConcentration}% of activity`,
        detail: geoConcentration > 50 
          ? 'High geographic concentration - consider expansion opportunities'
          : `Well distributed across ${countryCounts.size} countries`,
        actionable: geoConcentration > 70
      });
    }

    // 4. Specialty Patterns
    const specialtyCounts = new Map<string, number>();
    filteredData.forEach(item => {
      specialtyCounts.set(item.specialty, (specialtyCounts.get(item.specialty) || 0) + 1);
    });
    
    const topSpecialties = Array.from(specialtyCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);
    
    if (topSpecialties.length > 0) {
      const [topSpecialty] = topSpecialties[0];
      const specialtyDiversity = specialtyCounts.size;
      
      narratives.push({
        type: 'specialty',
        icon: Users,
        title: 'Specialty Engagement',
        main: `${topSpecialty} physicians are most active`,
        detail: specialtyDiversity > 5 
          ? `Diverse interest across ${specialtyDiversity} specialties`
          : `Limited to ${specialtyDiversity} specialties - consider targeted education`,
        actionable: specialtyDiversity < 3
      });
    }

    // 5. Time Pattern (if we have recent data)
    const dates = filteredData.map(d => new Date(d.timestamp));
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
    const dateRange = sortedDates[sortedDates.length - 1].getTime() - sortedDates[0].getTime();
    const daysInRange = Math.floor(dateRange / (1000 * 60 * 60 * 24));
    
    if (daysInRange > 7) {
      // Calculate weekly trend
      const midPoint = new Date(sortedDates[0].getTime() + dateRange / 2);
      const firstHalf = filteredData.filter(d => new Date(d.timestamp) < midPoint).length;
      const secondHalf = filteredData.length - firstHalf;
      const trendPercentage = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
      
      narratives.push({
        type: 'trend',
        icon: trendPercentage > 0 ? TrendingUp : TrendingDown,
        isTrending: trendPercentage > 0,
        title: 'Activity Trend',
        main: `${Math.abs(trendPercentage)}% ${trendPercentage > 0 ? 'increase' : 'decrease'} in recent activity`,
        detail: trendPercentage > 20 
          ? 'Strong momentum - capitalize on growing interest'
          : trendPercentage < -20 
          ? 'Declining interest - investigate root causes'
          : 'Stable engagement pattern',
        actionable: Math.abs(trendPercentage) > 30
      });
    }

    // 6. Key Finding (based on filters)
    if (filters.drug && filters.drug.length > 0) {
      const citationCount = filteredData.reduce((sum, item) => sum + item.citationCount, 0);
      const avgCitations = Math.round(citationCount / filteredData.length);
      
      narratives.push({
        type: 'citations',
        icon: Lightbulb,
        title: 'Scientific Evidence Base',
        main: `Average of ${avgCitations} citations per interaction`,
        detail: avgCitations > 3 
          ? 'Strong scientific backing in physician discussions'
          : 'Limited evidence cited - opportunity for medical education',
        actionable: avgCitations < 2
      });
    }

    return narratives.filter(n => n !== null);
  }, [filteredData, filters]);

  if (filteredData.length === 0) {
    return null;
  }

  const actionableInsights = insights.filter(i => i.actionable);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Your Data Story
        </h3>
        <p className="text-gray-600 text-sm">
          Key insights from {filteredData.length.toLocaleString()} physician interactions
        </p>
      </div>

      <div className="p-6 space-y-4">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border ${
              insight.actionable 
                ? 'border-amber-200 bg-amber-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                insight.actionable ? 'bg-amber-100' : 'bg-gray-100'
              }`}>
                <insight.icon className={`h-5 w-5 ${
                  insight.actionable ? 'text-amber-600' :
                  insight.isTrending === true ? 'text-green-600' :
                  insight.isTrending === false ? 'text-red-600' :
                  'text-gray-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-800 font-medium mb-1">
                      {insight.main}
                    </p>
                    <p className="text-xs text-gray-600">
                      {insight.detail}
                    </p>
                  </div>
                  {insight.actionable && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                      Action needed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {actionableInsights.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Recommended Actions</h4>
            </div>
            <ul className="space-y-1 text-sm text-gray-700">
              {actionableInsights.slice(0, 3).map((insight, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <span>Review {insight.title.toLowerCase()} for optimization opportunities</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}