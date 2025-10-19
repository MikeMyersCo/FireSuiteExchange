'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface VenueMapProps {
  selectedArea: string | null;
  onAreaSelect: (area: string | null) => void;
}

export default function VenueMap({ selectedArea, onAreaSelect }: VenueMapProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  // Define section groups by area
  const sectionGroups = {
    L: ['201', '202', '203', '204', '205'], // Lower Suites Fire Suites
    UNT: ['V101', 'V102', 'V104', 'V194', 'V104', 'V100', 'V108', 'V113'], // North Terrace
    UST: ['V154', 'V108', 'V118', 'V117', 'V110', 'V115'], // South Terrace
  };

  const handleSectionClick = (area: string) => {
    if (selectedArea === area) {
      onAreaSelect(null);
    } else {
      onAreaSelect(area);
    }
  };

  const getSectionFill = (area: string) => {
    if (selectedArea === area) {
      return area === 'L' ? '#86efac' : '#fef08a'; // Bright green or yellow when selected
    }
    if (hoveredArea === area) {
      return area === 'L' ? '#bbf7d0' : '#fef9c3'; // Light green or yellow on hover
    }
    return area === 'L' ? '#dcfce7' : '#fefce8'; // Very light green or yellow default
  };

  const getStrokeColor = (area: string) => {
    if (selectedArea === area) {
      return area === 'L' ? '#16a34a' : '#ca8a04'; // Dark green or yellow when selected
    }
    return '#d1d5db'; // Gray default
  };

  const getStrokeWidth = (area: string) => {
    return selectedArea === area ? '3' : '1.5';
  };

  const renderSVG = (className: string = "w-full h-auto") => (
    <svg
      viewBox="0 0 1000 900"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
        {/* Stage */}
        <rect
          x="350"
          y="780"
          width="300"
          height="70"
          fill="#6b7280"
          stroke="#4b5563"
          strokeWidth="2"
          rx="5"
        />
        <text x="500" y="823" textAnchor="middle" fill="white" fontSize="20" className="text-[16px] sm:text-[20px]" fontWeight="bold">
          STAGE
        </text>

        {/* Bottom Sections (100s) - NOT CLICKABLE - Moved down and made thicker */}
        <rect
          x="300"
          y="650"
          width="400"
          height="80"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
          rx="5"
        />
        <text x="500" y="697" textAnchor="middle" fill="#6b7280" fontSize="16" className="text-[14px] sm:text-[16px]" fontWeight="bold">
          100's
        </text>

        {/* Lower Suites (201-205) - Fire Suites in Green - CLICKABLE */}
        {/* These are elongated polygons matching the original venue layout */}
        <g
          onClick={() => handleSectionClick('L')}
          onMouseEnter={() => setHoveredArea('L')}
          onMouseLeave={() => setHoveredArea(null)}
          className="cursor-pointer transition-all"
        >
          {/* Section 201 - Left - Elongated */}
          <path
            d="M 160 590 L 155 520 L 180 485 L 245 505 L 265 540 L 260 600 Z"
            fill={getSectionFill('L')}
            stroke={getStrokeColor('L')}
            strokeWidth={getStrokeWidth('L')}
          />
          <text x="210" y="550" textAnchor="middle" fill="#000" fontSize="14" className="text-[12px] sm:text-[14px]" fontWeight="bold">
            201
          </text>

          {/* Section 202 - Elongated */}
          <path
            d="M 265 600 L 260 540 L 245 505 L 300 475 L 360 490 L 385 525 L 385 595 Z"
            fill={getSectionFill('L')}
            stroke={getStrokeColor('L')}
            strokeWidth={getStrokeWidth('L')}
          />
          <text x="320" y="550" textAnchor="middle" fill="#000" fontSize="14" className="text-[12px] sm:text-[14px]" fontWeight="bold">
            202
          </text>

          {/* Section 203 - Center - Large elongated rectangle */}
          <path
            d="M 385 595 L 385 450 L 615 450 L 615 595 Z"
            fill={getSectionFill('L')}
            stroke={getStrokeColor('L')}
            strokeWidth={getStrokeWidth('L')}
          />
          <text x="500" y="535" textAnchor="middle" fill="#000" fontSize="18" className="text-[16px] sm:text-[18px]" fontWeight="bold">
            203
          </text>

          {/* Section 204 - Elongated */}
          <path
            d="M 615 595 L 615 525 L 640 490 L 700 475 L 755 505 L 740 540 L 735 600 Z"
            fill={getSectionFill('L')}
            stroke={getStrokeColor('L')}
            strokeWidth={getStrokeWidth('L')}
          />
          <text x="680" y="550" textAnchor="middle" fill="#000" fontSize="14" className="text-[12px] sm:text-[14px]" fontWeight="bold">
            204
          </text>

          {/* Section 205 - Right - Elongated */}
          <path
            d="M 735 600 L 740 540 L 755 505 L 820 485 L 845 520 L 840 590 Z"
            fill={getSectionFill('L')}
            stroke={getStrokeColor('L')}
            strokeWidth={getStrokeWidth('L')}
          />
          <text x="790" y="550" textAnchor="middle" fill="#000" fontSize="14" className="text-[12px] sm:text-[14px]" fontWeight="bold">
            205
          </text>
        </g>

        {/* Upper Sections (300s) - Regular seating - NOT CLICKABLE */}
        {/* Evenly distributed from left to right forming an arc */}
        <g fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1">
          <rect x="50" y="360" width="55" height="60" rx="5" />
          <text x="77" y="395" textAnchor="middle" fill="#6b7280" fontSize="12">301</text>

          <rect x="110" y="345" width="55" height="60" rx="5" />
          <text x="137" y="380" textAnchor="middle" fill="#6b7280" fontSize="12">302</text>

          <rect x="170" y="335" width="55" height="60" rx="5" />
          <text x="197" y="370" textAnchor="middle" fill="#6b7280" fontSize="12">303</text>

          <rect x="230" y="325" width="55" height="60" rx="5" />
          <text x="257" y="360" textAnchor="middle" fill="#6b7280" fontSize="12">304</text>

          <rect x="290" y="318" width="55" height="60" rx="5" />
          <text x="317" y="353" textAnchor="middle" fill="#6b7280" fontSize="12">305</text>

          <rect x="350" y="315" width="55" height="60" rx="5" />
          <text x="377" y="350" textAnchor="middle" fill="#6b7280" fontSize="12">306</text>

          <rect x="410" y="313" width="55" height="60" rx="5" />
          <text x="437" y="348" textAnchor="middle" fill="#6b7280" fontSize="12">307</text>

          <rect x="470" y="312" width="55" height="60" rx="5" />
          <text x="497" y="347" textAnchor="middle" fill="#6b7280" fontSize="12">308</text>

          <rect x="530" y="313" width="55" height="60" rx="5" />
          <text x="557" y="348" textAnchor="middle" fill="#6b7280" fontSize="12">309</text>

          <rect x="590" y="315" width="55" height="60" rx="5" />
          <text x="617" y="350" textAnchor="middle" fill="#6b7280" fontSize="12">310</text>

          <rect x="650" y="318" width="55" height="60" rx="5" />
          <text x="677" y="353" textAnchor="middle" fill="#6b7280" fontSize="12">311</text>

          <rect x="710" y="325" width="55" height="60" rx="5" />
          <text x="737" y="360" textAnchor="middle" fill="#6b7280" fontSize="12">312</text>

          <rect x="770" y="335" width="55" height="60" rx="5" />
          <text x="797" y="370" textAnchor="middle" fill="#6b7280" fontSize="12">313</text>

          <rect x="830" y="345" width="55" height="60" rx="5" />
          <text x="857" y="380" textAnchor="middle" fill="#6b7280" fontSize="12">314</text>

          <rect x="890" y="360" width="55" height="60" rx="5" />
          <text x="917" y="395" textAnchor="middle" fill="#6b7280" fontSize="12">315</text>
        </g>

        {/* Lawn Area - Expanded thicker section between 300s and Terraces - NOT CLICKABLE */}
        <g fill="#d4f4dd" stroke="#9ca3af" strokeWidth="2" opacity="0.6">
          {/* Main lawn area running north to south - much thicker now */}
          <path
            d="M 140 280 L 860 280 L 860 180 L 140 180 Z"
          />
          <text x="500" y="240" textAnchor="middle" fill="#4b5563" fontSize="20" className="text-[16px] sm:text-[20px]" fontWeight="bold">
            LAWN
          </text>
        </g>

        {/* North Terrace (UNT) - Yellow - CLICKABLE - Moved higher */}
        <g
          onClick={() => handleSectionClick('UNT')}
          onMouseEnter={() => setHoveredArea('UNT')}
          onMouseLeave={() => setHoveredArea(null)}
          className="cursor-pointer transition-all"
        >
          <path
            d="M 110 170 L 110 50 L 420 30 L 420 150 Z"
            fill={getSectionFill('UNT')}
            stroke={getStrokeColor('UNT')}
            strokeWidth={getStrokeWidth('UNT')}
          />
          <text x="265" y="110" textAnchor="middle" fill="#000" fontSize="16" className="text-[14px] sm:text-[16px]" fontWeight="bold">
            NORTH TERRACE
          </text>
        </g>

        {/* South Terrace (UST) - Yellow - CLICKABLE - Moved higher */}
        <g
          onClick={() => handleSectionClick('UST')}
          onMouseEnter={() => setHoveredArea('UST')}
          onMouseLeave={() => setHoveredArea(null)}
          className="cursor-pointer transition-all"
        >
          <path
            d="M 890 170 L 890 50 L 580 30 L 580 150 Z"
            fill={getSectionFill('UST')}
            stroke={getStrokeColor('UST')}
            strokeWidth={getStrokeWidth('UST')}
          />
          <text x="735" y="110" textAnchor="middle" fill="#000" fontSize="16" className="text-[14px] sm:text-[16px]" fontWeight="bold">
            SOUTH TERRACE
          </text>
        </g>
      </svg>
  );

  return (
    <>
      <div className="w-full rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-center text-lg font-bold text-foreground flex-1">Venue Map</h3>
          <button
            onClick={() => setIsExpanded(true)}
            className="rounded-lg border-2 border-foreground bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-secondary"
            aria-label="Expand map"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
        <p className="mb-4 text-center text-xs text-foreground/70">
          Click a section to filter tickets
        </p>

        {renderSVG()}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-green-600 bg-green-100"></div>
            <span className="text-foreground/70">Lower Suites (201-205)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-yellow-600 bg-yellow-100"></div>
            <span className="text-foreground/70">Upper Suites</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-gray-400 bg-gray-100"></div>
            <span className="text-foreground/70">Other Seating</span>
          </div>
        </div>
      </div>

      {/* Expanded Modal - Rendered via Portal */}
      {mounted && isExpanded && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="relative w-full max-w-6xl rounded-2xl border-2 border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Venue Map</h3>
                <p className="text-sm text-foreground/70">Click a section to filter tickets</p>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="rounded-lg border-2 border-foreground bg-background px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
                aria-label="Close map"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Large Map */}
            <div className="max-h-[70vh] overflow-auto">
              {renderSVG("w-full h-auto min-h-[600px]")}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded border-2 border-green-600 bg-green-100"></div>
                <span className="font-medium text-foreground">Lower Suites (201-205)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded border-2 border-yellow-600 bg-yellow-100"></div>
                <span className="font-medium text-foreground">Upper Suites</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded border-2 border-gray-400 bg-gray-100"></div>
                <span className="font-medium text-foreground">Other Seating</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
