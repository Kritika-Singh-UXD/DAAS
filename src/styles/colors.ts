// Simplified professional color palette for pharmaceutical dashboard

export const colors = {
  // Primary - Professional blue (trust, medical)
  primary: {
    50: '#E6EDF5',   // Lightest backgrounds
    100: '#C2D4E6',  // Light backgrounds
    200: '#9DB8D7',  // Borders
    500: '#214498',  // Primary actions (main brand color)
    600: '#1B3A84',  // Hover states
    700: '#163070',  // Active states
    800: '#12265C',  // Text
    900: '#0D1C48',  // Dark text
  },
  
  // Neutral - Grays for text and UI
  neutral: {
    50: '#F9FAFB',   // Backgrounds
    100: '#F3F4F6',  // Light backgrounds
    200: '#E5E7EB',  // Borders
    300: '#D1D5DB',  // Disabled
    400: '#9CA3AF',  // Placeholder text
    500: '#6B7280',  // Secondary text
    600: '#4B5563',  // Body text
    700: '#374151',  // Headings
    800: '#1F2937',  // Dark headings
    900: '#111827',  // Darkest text
  },
  
  // Status colors - Used only for specific indicators
  status: {
    success: '#10B981',   // Success, positive trends only
    warning: '#F59E0B',   // Warnings only
    error: '#EF4444',     // Errors, negative trends only
  }
};

// Semantic color mappings
export const semanticColors = {
  background: colors.neutral[50],
  surface: 'white',
  border: colors.neutral[200],
  
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    muted: colors.neutral[500],
    inverse: 'white',
  },
  
  interactive: {
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    secondary: colors.neutral[100],
    secondaryHover: colors.neutral[200],
  },
  
  status: {
    success: colors.status.success,
    warning: colors.status.warning,
    error: colors.status.error,
    info: colors.primary[500],
  }
};