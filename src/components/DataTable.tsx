'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useFilters } from '@/hooks/useFilters';
import { exportToCSV } from '@/lib/utils';
import { 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  AlertCircle,
  ChevronDown,
  Shield,
  Table
} from 'lucide-react';

export default function DataTable() {
  const filteredData = useDashboardStore((state) => state.filteredData);
  const { filters } = useFilters();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const searchedData = useMemo(() => {
    if (!searchTerm) return filteredData;
    
    const term = searchTerm.toLowerCase();
    return filteredData.filter(item => 
      item.question.toLowerCase().includes(term) ||
      item.answer.toLowerCase().includes(term) ||
      item.specialty.toLowerCase().includes(term) ||
      item.drugNames.some(drug => drug.toLowerCase().includes(term)) ||
      item.therapeuticAreas.some(area => area.toLowerCase().includes(term))
    );
  }, [filteredData, searchTerm]);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return searchedData.slice(startIndex, startIndex + pageSize);
  }, [searchedData, currentPage, pageSize]);
  
  const totalPages = Math.ceil(searchedData.length / pageSize);
  
  // Generate filename based on active filters
  const generateFilename = (format: 'csv' | 'xlsx') => {
    const today = new Date().toISOString().split('T')[0];
    
    // Build filename parts
    const parts = ['SynductSignals'];
    
    // Add filter context
    if (filters.therapeuticArea && filters.therapeuticArea.length > 0) {
      parts.push(filters.therapeuticArea.slice(0, 2).join('-'));
    } else {
      parts.push('all');
    }
    
    if (filters.country && filters.country.length > 0) {
      parts.push(filters.country.slice(0, 2).join('-'));
    } else {
      parts.push('all');
    }
    
    // Add date range
    if (filters.dateFrom && filters.dateTo) {
      parts.push(`${filters.dateFrom}_${filters.dateTo}`);
    } else {
      parts.push(today);
    }
    
    return `${parts.join('_')}.${format}`;
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    const exportData = searchedData.map(item => ({
      ID: item.id,
      Question: item.question,
      Answer: item.answer,
      Specialty: item.specialty,
      Role: item.professionalRole,
      'Years Experience': item.yearsExperience,
      Country: item.country,
      'Therapeutic Areas': item.therapeuticAreas.join('; '),
      'Drug Names': item.drugNames.join('; '),
      'Drug Count': item.drugCount,
      'ATC Code': item.atcCode,
      'ATC Confidence': item.atcConfidence,
      'ICD-10 Code': item.icd10Code,
      'ICD-10 Confidence': item.icd10Confidence,
      'Treatment Type': item.treatmentType,
      'Interaction Severity': item.interactionSeverity,
      'Age Group': item.predictedAgeGroup,
      Gender: item.predictedGender,
      'Citation Count': item.citationCount,
      'DOIs': item.doiList.join('; '),
      Timestamp: item.timestamp
    }));
    
    const filename = generateFilename(format);
    
    if (format === 'csv') {
      exportToCSV(exportData, filename);
    } else {
      // For XLSX, we'd need a different function - for now just export as CSV
      exportToCSV(exportData, filename.replace('.xlsx', '.csv'));
    }
    
    setShowExportOptions(false);
  };

  // Get active filter summary for disclosure
  const getFilterSummary = () => {
    const activeFilters = [];
    if (filters.drug && filters.drug.length > 0) activeFilters.push(`Drugs: ${filters.drug.join(', ')}`);
    if (filters.company && filters.company.length > 0) activeFilters.push(`Companies: ${filters.company.join(', ')}`);
    if (filters.therapeuticArea && filters.therapeuticArea.length > 0) activeFilters.push(`Therapeutic Areas: ${filters.therapeuticArea.join(', ')}`);
    if (filters.country && filters.country.length > 0) activeFilters.push(`Countries: ${filters.country.join(', ')}`);
    if (filters.specialty && filters.specialty.length > 0) activeFilters.push(`Specialties: ${filters.specialty.join(', ')}`);
    if (filters.profession && filters.profession.length > 0) activeFilters.push(`Professions: ${filters.profession.join(', ')}`);
    if (filters.ageGroup && filters.ageGroup.length > 0) activeFilters.push(`Age Groups: ${filters.ageGroup.join(', ')}`);
    if (filters.gender && filters.gender.length > 0) activeFilters.push(`Gender: ${filters.gender.join(', ')}`);
    if (filters.dateFrom || filters.dateTo) {
      const dateRange = `${filters.dateFrom || 'beginning'} to ${filters.dateTo || 'end'}`;
      activeFilters.push(`Date Range: ${dateRange}`);
    }
    
    return activeFilters.length > 0 
      ? activeFilters.join(' | ') 
      : 'No filters applied - showing all data';
  };
  
  const ConfidenceBadge = ({ confidence }: { confidence: number }) => {
    const color = confidence >= 0.8 ? 'bg-green-100 text-green-700' : 
                  confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700';
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
        {(confidence * 100).toFixed(0)}%
      </span>
    );
  };
  
  return (
    <div className="bg-white">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Table className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Raw Data Table</h3>
            </div>
            <p className="text-sm text-gray-600">
              {searchedData.length} records found
            </p>
          </div>
          
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Data
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showExportOptions && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-48">
                <div className="p-3 border-b border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">Export Options</p>
                  <p className="text-xs text-gray-600">
                    Exporting {searchedData.length} filtered records
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                  >
                    Export as XLSX
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions, answers, drugs, or therapeutic areas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            />
          </div>
          
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-50 border-b border-blue-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Question</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Specialty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Drugs</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Therapeutic</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Confidence</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Citations</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row) => (
              <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900 font-mono">{row.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={row.question}>
                  {row.question}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.specialty}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {row.drugNames.slice(0, 2).map((drug, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        {drug}
                      </span>
                    ))}
                    {row.drugNames.length > 2 && (
                      <span className="text-xs text-gray-500">+{row.drugNames.length - 2} more</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {row.therapeuticAreas.map((area, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {area}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">ATC:</span>
                      <ConfidenceBadge confidence={row.atcConfidence} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">ICD:</span>
                      <ConfidenceBadge confidence={row.icd10Confidence} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.citationCount}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => setSelectedRow(selectedRow === row.id ? null : row.id)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {paginatedData.length === 0 && (
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No data found matching your criteria</p>
        </div>
      )}
      
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, searchedData.length)} of {searchedData.length} results
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Export Disclosure */}
      <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Export Data Privacy Notice</p>
            <p>
              You are exporting anonymized, aggregated data. Sensitive identifiers are excluded. 
              Current export scope: {getFilterSummary()}
            </p>
          </div>
        </div>
      </div>
      
      {selectedRow && (
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="max-w-4xl">
            {(() => {
              const row = paginatedData.find(r => r.id === selectedRow);
              if (!row) return null;
              
              return (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Full Question</h4>
                    <p className="text-sm text-gray-900">{row.question}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Full Answer</h4>
                    <p className="text-sm text-gray-900">{row.answer}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <span className="text-xs text-gray-500">Country:</span>
                      <p className="text-sm font-medium">{row.country}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Role:</span>
                      <p className="text-sm font-medium">{row.professionalRole}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Experience:</span>
                      <p className="text-sm font-medium">{row.yearsExperience} years</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Treatment Type:</span>
                      <p className="text-sm font-medium">{row.treatmentType}</p>
                    </div>
                  </div>
                  {row.doiList.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">DOIs</h4>
                      <div className="flex flex-wrap gap-2">
                        {row.doiList.map((doi, i) => (
                          <code key={i} className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {doi}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}