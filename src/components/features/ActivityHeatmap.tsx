import { Activity } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { activityAPI } from '../../services/api';

interface HeatmapData {
  heatmap: { [date: string]: { [activity: string]: number } };
  dailyTotals: { [date: string]: number };
}

interface ActivityHeatmapProps {
  userId?: string;
  userName?: string;
  showTitle?: boolean;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ 
  userId, 
  userName, 
  showTitle = true 
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipRef, setTooltipRef] = useState<HTMLDivElement | null>(null);

  const targetUserId = userId || user?.id;
  const targetUserName = userName || user?.name;

  useEffect(() => {
    if (targetUserId) {
      loadHeatmapData();
    }
  }, [targetUserId]);

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getHeatmapData(targetUserId!);
      setHeatmapData(response);
    } catch (error: any) {
      console.error('Error loading heatmap data:', error);
      showToast('Failed to load activity data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarGrid = () => {
    const weeks = [];
    const today = new Date();
    
    // Calculate start date: 6 months before current date
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 6);
    startDate.setDate(1);
    
    // Calculate end date: 6 months after current date
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 6);
    endDate.setDate(0); // Last day of the month
    
    // Start from Sunday of the week containing startDate
    const startOfWeek = new Date(startDate);
    const startDay = startDate.getDay();
    startOfWeek.setDate(startDate.getDate() - startDay);
    
    // Calculate number of weeks needed
    const diffTime = endDate.getTime() - startOfWeek.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const numWeeks = Math.ceil(diffDays / 7) + 2;
    
    for (let week = 0; week < numWeeks; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + (week * 7) + day);
        
        // Include all dates within our range
        if (currentDate >= startDate && currentDate <= endDate) {
          weekDays.push(currentDate.toISOString().split('T')[0]);
        } else {
          // Empty cell for dates outside our range
          weekDays.push(null);
        }
      }
      weeks.push(weekDays);
    }
    
    return weeks;
  };

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 hover:bg-gray-200 border-gray-200 hover:border-gray-300 hover:shadow-sm';
    if (count <= 2) return 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200 hover:border-emerald-300 hover:shadow-md';
    if (count <= 4) return 'bg-emerald-300 hover:bg-emerald-400 border-emerald-400 hover:border-emerald-500 hover:shadow-md';
    if (count <= 6) return 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600 hover:border-emerald-700 hover:shadow-lg';
    return 'bg-emerald-700 hover:bg-emerald-800 border-emerald-800 hover:border-emerald-900 hover:shadow-lg';
  };

  const getActivityBreakdown = (date: string) => {
    if (!heatmapData || !heatmapData.heatmap[date]) return null;
    
    const activities = heatmapData.heatmap[date];
    const total = heatmapData.dailyTotals[date] || 0;
    
    return {
      total,
      breakdown: Object.entries(activities).map(([activity, count]) => ({
        name: activity.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        count
      }))
    };
  };

  const getActivityIcon = (activityName: string) => {
    const name = activityName.toLowerCase();
    if (name.includes('assessment')) return '📝';
    if (name.includes('chat')) return '💬';
    if (name.includes('task')) return '✅';
    if (name.includes('login')) return '🔐';
    if (name.includes('event')) return '📅';
    return '📊';
  };

  const handleMouseEnter = (date: string, event: React.MouseEvent) => {
    setHoveredDate(date);
    
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const containerRect = target.closest('.heatmap-container')?.getBoundingClientRect();
    
    if (containerRect) {
      setTooltipPosition({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 16
      });
    } else {
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 16
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-sm text-gray-500 font-medium">Loading activity data...</p>
        </div>
      </div>
    );
  }

  if (!heatmapData) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Activity Data</h3>
            <p className="text-gray-500 text-sm">Start using the platform to see your activity heatmap</p>
          </div>
        </div>
      </div>
    );
  }

  const totalActivities = Object.values(heatmapData.dailyTotals).reduce((a, b) => a + b, 0);
  const activeDays = Object.keys(heatmapData.dailyTotals).filter(date => heatmapData.dailyTotals[date] > 0).length;
  const maxDaily = Math.max(...Object.values(heatmapData.dailyTotals), 0);
  const avgDaily = totalActivities / 365;

  return (
    <div className="heatmap-container relative">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Header */}
        {showTitle && (
          <div className="px-8 py-6 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-100 rounded-xl">
                    <Activity className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Activity Heatmap
                      {targetUserName && <span className="text-gray-500 font-normal ml-2">• {targetUserName}</span>}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Your contribution activity over the past year</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="px-8 py-6 border-b border-gray-50">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1">
                <div className="text-3xl font-bold text-blue-700">{totalActivities.toLocaleString()}</div>
                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mt-1">Total Activities</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1">
                <div className="text-3xl font-bold text-emerald-700">{activeDays}</div>
                <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide mt-1">Active Days</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1">
                <div className="text-3xl font-bold text-purple-700">{maxDaily}</div>
                <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mt-1">Max Daily</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1">
                <div className="text-3xl font-bold text-orange-700">{avgDaily.toFixed(1)}</div>
                <div className="text-xs font-medium text-orange-600 uppercase tracking-wide mt-1">Daily Average</div>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Section */}
        <div className="px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {totalActivities.toLocaleString()} activities in the last year
              </h4>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Less</span>
              <div className="flex items-center space-x-1.5">
                {[
                  'bg-gray-100 border-gray-200',
                  'bg-emerald-100 border-emerald-200',
                  'bg-emerald-300 border-emerald-400',
                  'bg-emerald-500 border-emerald-600',
                  'bg-emerald-700 border-emerald-800'
                ].map((colorClass, index) => (
                  <div 
                    key={index}
                    className={`w-4 h-4 rounded border transition-all duration-200 hover:scale-110 ${colorClass}`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">More</span>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="inline-block min-w-full">
              {/* Month labels */}
              <div className="flex items-end mb-4" style={{ paddingLeft: '48px' }}>
                {generateCalendarGrid().map((week, weekIndex) => {
                  const firstDay = week.find(day => day !== null);
                  if (!firstDay) return <div key={weekIndex} className="w-5" style={{ marginRight: '4px' }}></div>;
                  
                  const date = new Date(firstDay);
                  const isFirstWeekOfMonth = date.getDate() <= 7;
                  
                  return (
                    <div key={weekIndex} className="w-5 text-xs font-semibold text-gray-700 text-left" style={{ marginRight: '4px' }}>
                      {isFirstWeekOfMonth ? monthLabels[date.getMonth()] : ''}
                    </div>
                  );
                })}
              </div>

              {/* Calendar grid */}
              <div className="flex">
                {/* Day labels */}
                <div className="flex flex-col mr-4 pt-1">
                  {dayLabels.map((label, index) => (
                    <div key={index} className="h-5 mb-1 text-xs font-semibold text-gray-700 flex items-center justify-end pr-2" style={{ width: '40px' }}>
                      {index % 2 === 1 ? label : ''}
                    </div>
                  ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex">
                  {generateCalendarGrid().map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col" style={{ marginRight: '4px' }}>
                      {week.map((date, dayIndex) => {
                        if (!date) {
                          return <div key={dayIndex} className="w-5 h-5 mb-1"></div>;
                        }
                        
                        const count = heatmapData.dailyTotals[date] || 0;
                        const today = new Date().toISOString().split('T')[0];
                        const isFuture = date > today;
                        
                        return (
                          <div
                            key={dayIndex}
                            className={`w-5 h-5 mb-1 rounded-md border cursor-pointer transition-all duration-300 ease-out transform hover:scale-125 hover:z-10 hover:shadow-lg ${
                              isFuture 
                                ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed' 
                                : getIntensityColor(count)
                            }`}
                            onMouseEnter={!isFuture ? (e) => handleMouseEnter(date, e) : undefined}
                            onMouseLeave={!isFuture ? handleMouseLeave : undefined}
                            style={{
                              transformOrigin: 'center',
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tooltip */}
      {hoveredDate && (
        <div 
          ref={setTooltipRef}
          className="absolute z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-300"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl p-4 shadow-2xl border border-gray-700/50 max-w-xs">
            <div className="font-semibold text-white mb-2 text-sm">
              {new Date(hoveredDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
            {(() => {
              const breakdown = getActivityBreakdown(hoveredDate);
              if (!breakdown || breakdown.total === 0) {
                return (
                  <div className="text-gray-300 text-center py-2">
                    <div className="text-sm">No activities</div>
                    <div className="text-xs opacity-75 mt-1">Take a break day! 😊</div>
                  </div>
                );
              }
              
              return (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-emerald-400 font-bold text-lg">
                      {breakdown.total}
                    </div>
                    <div className="text-gray-300 text-xs">
                      {breakdown.total === 1 ? 'activity' : 'activities'}
                    </div>
                  </div>
                  
                  {breakdown.breakdown.length > 0 && (
                    <div className="border-t border-gray-700 pt-3 space-y-2">
                      {breakdown.breakdown.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{getActivityIcon(activity.name)}</span>
                            <span className="text-gray-300 text-xs font-medium">{activity.name}</span>
                          </div>
                          <div className="bg-gray-800 rounded-full px-2 py-0.5">
                            <span className="text-white font-bold text-xs">{activity.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900/95"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityHeatmap;