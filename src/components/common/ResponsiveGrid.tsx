import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  breakpoints?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6;
    md?: 1 | 2 | 3 | 4 | 5 | 6;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
    xl?: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className = '',
  breakpoints = {},
}) => {
  const getColumnClasses = () => {
    const baseClass = 'grid';
    
    // Default responsive behavior
    let responsiveClasses = `grid-cols-1`;
    
    // Add small breakpoint
    if (breakpoints.sm) {
      responsiveClasses += ` sm:grid-cols-${breakpoints.sm}`;
    } else if (columns >= 2) {
      responsiveClasses += ` sm:grid-cols-2`;
    }
    
    // Add medium breakpoint
    if (breakpoints.md) {
      responsiveClasses += ` md:grid-cols-${breakpoints.md}`;
    } else if (columns >= 3) {
      responsiveClasses += ` md:grid-cols-3`;
    }
    
    // Add large breakpoint
    if (breakpoints.lg) {
      responsiveClasses += ` lg:grid-cols-${breakpoints.lg}`;
    } else {
      responsiveClasses += ` lg:grid-cols-${columns}`;
    }
    
    // Add extra large breakpoint
    if (breakpoints.xl) {
      responsiveClasses += ` xl:grid-cols-${breakpoints.xl}`;
    } else if (columns >= 4) {
      responsiveClasses += ` xl:grid-cols-${columns}`;
    }
    
    return `${baseClass} ${responsiveClasses}`;
  };

  const getGapClasses = () => {
    switch (gap) {
      case 'sm':
        return 'gap-3 md:gap-4';
      case 'md':
        return 'gap-4 md:gap-6';
      case 'lg':
        return 'gap-6 md:gap-8';
      case 'xl':
        return 'gap-8 md:gap-10';
      default:
        return 'gap-4 md:gap-6';
    }
  };

  const classes = `
    ${getColumnClasses()}
    ${getGapClasses()}
    ${className}
  `.trim();

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

// Preset grid configurations for common use cases
export const GridPresets = {
  // Common responsive grid patterns
  responsive: (children: React.ReactNode, className?: string) => (
    <ResponsiveGrid
      columns={4}
      breakpoints={{ sm: 2, md: 3, lg: 4 }}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  ),

  // Two column grid that stacks on mobile
  twoColumn: (children: React.ReactNode, className?: string) => (
    <ResponsiveGrid
      columns={2}
      breakpoints={{ sm: 1, md: 2 }}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  ),

  // Three column grid with responsive behavior
  threeColumn: (children: React.ReactNode, className?: string) => (
    <ResponsiveGrid
      columns={3}
      breakpoints={{ sm: 1, md: 2, lg: 3 }}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  ),

  // Feature grid for displaying features/services
  feature: (children: React.ReactNode, className?: string) => (
    <ResponsiveGrid
      columns={3}
      gap="lg"
      breakpoints={{ sm: 1, md: 2, lg: 3 }}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  ),

  // Stats grid for dashboard metrics
  stats: (children: React.ReactNode, className?: string) => (
    <ResponsiveGrid
      columns={4}
      gap="md"
      breakpoints={{ sm: 2, md: 4 }}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  ),

  // Card grid for content cards
  cards: (children: React.ReactNode, className?: string) => (
    <ResponsiveGrid
      columns={3}
      gap="lg"
      breakpoints={{ sm: 1, md: 2, lg: 3, xl: 4 }}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  ),
};

export default ResponsiveGrid;