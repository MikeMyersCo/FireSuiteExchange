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

      {/* SVG overlay for clickable circles */}
      <svg
        viewBox="0 0 877 655"
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        {/* Clickable Circle Buttons for each area */}

        {/* North Terrace Circle */}
        <g onClick={() => handleSectionClick('UNT')} className="cursor-pointer" style={{ pointerEvents: 'auto' }}>
          <circle
            cx="200"
            cy="100"
            r="22"
            fill={selectedArea === 'UNT' ? '#fbbf24' : 'rgba(251, 191, 36, 0.7)'}
            stroke="#92400e"
            strokeWidth="2.5"
            className="transition-all hover:fill-yellow-400"
          />
          <text
            x="200"
            y="104"
            textAnchor="middle"
            fill="#78350f"
            fontSize="11"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            North
          </text>
        </g>

        {/* South Terrace Circle */}
        <g onClick={() => handleSectionClick('UST')} className="cursor-pointer" style={{ pointerEvents: 'auto' }}>
          <circle
            cx="677"
            cy="100"
            r="22"
            fill={selectedArea === 'UST' ? '#fbbf24' : 'rgba(251, 191, 36, 0.7)'}
            stroke="#92400e"
            strokeWidth="2.5"
            className="transition-all hover:fill-yellow-400"
          />
          <text
            x="677"
            y="104"
            textAnchor="middle"
            fill="#78350f"
            fontSize="11"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            South
          </text>
        </g>

        {/* V Sections Circle - Left side */}
        <g onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }}>
          <circle
            cx="200"
            cy="200"
            r="22"
            fill={selectedArea === 'V' ? '#60a5fa' : 'rgba(96, 165, 250, 0.7)'}
            stroke="#1e40af"
            strokeWidth="2.5"
            className="transition-all hover:fill-blue-400"
          />
          <text
            x="200"
            y="205"
            textAnchor="middle"
            fill="#1e3a8a"
            fontSize="13"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            V
          </text>
        </g>

        {/* V Sections Circle - Right side */}
        <g onClick={() => handleSectionClick('V')} className="cursor-pointer" style={{ pointerEvents: 'auto' }}>
          <circle
            cx="677"
            cy="200"
            r="22"
            fill={selectedArea === 'V' ? '#60a5fa' : 'rgba(96, 165, 250, 0.7)'}
            stroke="#1e40af"
            strokeWidth="2.5"
            className="transition-all hover:fill-blue-400"
          />
          <text
            x="677"
            y="205"
            textAnchor="middle"
            fill="#1e3a8a"
            fontSize="13"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            V
          </text>
        </g>

        {/* Lower Bowl Circle */}
        <g onClick={() => handleSectionClick('L')} className="cursor-pointer" style={{ pointerEvents: 'auto' }}>
          <circle
            cx="438"
            cy="330"
            r="26"
            fill={selectedArea === 'L' ? '#4ade80' : 'rgba(74, 222, 128, 0.7)'}
            stroke="#166534"
            strokeWidth="2.5"
            className="transition-all hover:fill-green-400"
          />
          <text
            x="438"
            y="334"
            textAnchor="middle"
            fill="#14532d"
            fontSize="11"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            Lower
          </text>
        </g>

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
