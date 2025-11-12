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
    UNT: [], // Upper North Terrace (separate from V sections)
    UST: [], // Upper South Terrace (separate from V sections)
    V: ['V101', 'V102', 'V104', 'V106', 'V107', 'V108', 'V109', 'V110', 'V112', 'V113', 'V115', 'V116', 'V117'], // V Sections (V101-V117)
  };

  const handleSectionClick = (area: string) => {
    // Always select the clicked area, don't toggle off if already selected
    onAreaSelect(area);
    // Close the modal if it's expanded so user can see the filtered results
    if (isExpanded) {
      setIsExpanded(false);
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

  const renderMap = (className: string = "w-full h-auto") => (
    <div className="relative w-full">
      {/* Ford Amphitheatre Title */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800 tracking-wide">
          FORD AMPHITHEATRE
        </h2>
      </div>

      {/* Base venue map image */}
      <img
        src="/images/venue-map.png"
        alt="Venue Map"
        className={className}
        style={{ width: '100%', height: 'auto' }}
      />

      {/* SVG overlay for clickable areas */}
      <svg
        viewBox="0 0 877 655"
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        {/* V-Sections - V101-V117 */}

        {/* Left side V-sections (V101, V102, V103) - angled on left terrace */}
        {/* V101 */}
        <rect x="155" y="192" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V102 */}
        <rect x="195" y="165" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V103 */}
        <rect x="232" y="145" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* Top row V-sections (V104-V117) */}
        {/* V104 */}
        <rect x="265" y="140" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V105 */}
        <rect x="297" y="137" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V106 */}
        <rect x="329" y="136" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V107 */}
        <rect x="361" y="135" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V108 */}
        <rect x="393" y="134" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V109 */}
        <rect x="425" y="134" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V110 */}
        <rect x="457" y="134" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V111 */}
        <rect x="489" y="134" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V112 */}
        <rect x="521" y="135" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V113 */}
        <rect x="553" y="136" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* Right side V-sections (V114-V117) - angled on right terrace */}
        {/* V114 */}
        <rect x="620" y="145" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V115 */}
        <rect x="655" y="165" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V116 */}
        <rect x="693" y="188" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* V117 */}
        <rect x="728" y="212" width="24" height="14" fill="transparent" onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }} />

        {/* Lower Bowl Suites (201-205) */}

        {/* 201 - Left Lower Suite */}
        <polygon
          points="235,355 250,340 280,345 290,365 285,405 245,415"
          fill="transparent"
          stroke="transparent"
          strokeWidth="0"
          onClick={() => handleSectionClick('L')}
          className="cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        />

        {/* 202 - Left-Center Lower Suite */}
        <polygon
          points="298,338 318,323 350,318 358,335 356,388 308,395"
          fill="transparent"
          stroke="transparent"
          strokeWidth="0"
          onClick={() => handleSectionClick('L')}
          className="cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        />

        {/* 203 - Center Lower Suite */}
        <polygon
          points="370,300 400,290 477,290 507,300 515,345 365,345"
          fill="transparent"
          stroke="transparent"
          strokeWidth="0"
          onClick={() => handleSectionClick('L')}
          className="cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        />

        {/* 204 - Right-Center Lower Suite */}
        <polygon
          points="518,318 527,323 556,338 568,395 520,388 518,335"
          fill="transparent"
          stroke="transparent"
          strokeWidth="0"
          onClick={() => handleSectionClick('L')}
          className="cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        />

        {/* 205 - Right Lower Suite */}
        <polygon
          points="585,345 600,340 632,355 640,415 595,405 590,365"
          fill="transparent"
          stroke="transparent"
          strokeWidth="0"
          onClick={() => handleSectionClick('L')}
          className="cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        />

        {/* V Sections - Left side area with V101-V109 */}
        <polygon
          points="120,125 145,175 200,230 245,220 270,175 230,140 180,120"
          fill="transparent"
          stroke="transparent"
          strokeWidth="0"
          onClick={() => handleSectionClick('V')}
          className="cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        />

        {/* V Sections - Right side area with V110-V117 */}
        <polygon
          points="605,175 630,220 685,230 740,175 760,125 700,120 650,140"
          fill="transparent"
          stroke="transparent"
          strokeWidth="0"
          onClick={() => handleSectionClick('V')}
          className="cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        />
      </svg>
    </div>
  );

  return (
    <>
      <div className="w-full rounded-2xl border-2 border-blue-400 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-center text-lg font-bold text-white flex-1">Venue Map</h3>
          <button
            onClick={() => setIsExpanded(true)}
            className="rounded-lg border-2 border-white bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 transition-all hover:bg-gray-100 shadow-md"
            aria-label="Expand map"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
        <p className="mb-4 text-center text-xs text-white font-medium">
          Click a section to filter tickets
        </p>

        <div className="bg-white rounded-xl p-3 shadow-lg">
          {renderMap()}
        </div>
      </div>

      {/* Expanded Modal - Rendered via Portal */}
      {mounted && isExpanded && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="relative w-full max-w-6xl rounded-2xl border-4 border-blue-400 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Venue Map</h3>
                <p className="text-sm text-white font-medium">Click a section to filter tickets</p>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="rounded-lg border-2 border-white bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 shadow-lg"
                aria-label="Close map"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Large Map */}
            <div className="max-h-[70vh] overflow-auto bg-white rounded-xl p-4 shadow-lg">
              {renderMap("w-full h-auto min-h-[600px]")}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
