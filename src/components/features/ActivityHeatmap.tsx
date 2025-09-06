import { Activity, Calendar, MessageCircle, User } from 'lucide-react';
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
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // 52 weeks back
    
    // Start from Sunday of the week containing startDate
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);
    
    for (let week = 0; week < 53; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);
        
        if (currentDate <= today) {
          weekDays.push(currentDate.toISOString().split('T')[0]);
        } else {
          weekDays.push(null);
        }
      }
      weeks.push(weekDays);
    }
    
    return weeks;
  };

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 hover:bg-gray-200 border-gray-200';
    if (count <= 2) return 'bg-green-200 hover:bg-green-300 border-green-300';
    if (count <= 4) return 'bg-green-400 hover:bg-green-500 border-green-500';
    if (count <= 6) return 'bg-green-600 hover:bg-green-700 border-green-700';
    return 'bg-green-800 hover:bg-green-900 border-green-900';
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
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!heatmapData) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No activity data available</p>
      </div>
    );
  }

  const totalActivities = Object.values(heatmapData.dailyTotals).reduce((a, b) => a + b, 0);
  const activeDays = Object.keys(heatmapData.dailyTotals).filter(date => heatmapData.dailyTotals[date] > 0).length;
  const maxDaily = Math.max(...Object.values(heatmapData.dailyTotals), 0);
  const avgDaily = totalActivities / 365;

  return (
    <div className="space-y-6 relative">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>Activity Heatmap</span>
              {targetUserName && <span className="text-gray-600">- {targetUserName}</span>}
            </h3>
            <p className="text-sm text-gray-600">Daily activity over the past year</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{totalActivities}</div>
          <div className="text-xs text-gray-600">Total Activities</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{activeDays}</div>
          <div className="text-xs text-gray-600">Active Days</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{maxDaily}</div>
          <div className="text-xs text-gray-600">Max Daily</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{avgDaily.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Daily Average</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            {totalActivities} activities in the last year
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm border border-gray-200"></div>
              <div className="w-3 h-3 bg-green-200 rounded-sm border border-green-300"></div>
              <div className="w-3 h-3 bg-green-400 rounded-sm border border-green-500"></div>
              <div className="w-3 h-3 bg-green-600 rounded-sm border border-green-700"></div>
              <div className="w-3 h-3 bg-green-800 rounded-sm border border-green-900"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col justify-between mr-2 text-xs text-gray-500 h-24">
              <div></div>
              <div>Mon</div>
              <div></div>
              <div>Wed</div>
              <div></div>
              <div>Fri</div>
              <div></div>
            </div>

            {/* Calendar grid */}
            <div className="flex-1">
              {/* Month labels */}
              <div className="flex mb-2">
                {generateCalendarGrid().map((week, weekIndex) => {
                  const firstDay = week.find(day => day !== null);
                  if (!firstDay) return <div key={weekIndex} className="w-3 mr-1"></div>;
                  
                  const date = new Date(firstDay);
                  const isFirstWeekOfMonth = date.getDate() <= 7;
                  
                  return (
                    <div key={weekIndex} className="w-3 mr-1 text-xs text-gray-500">
                      {isFirstWeekOfMonth ? monthLabels[date.getMonth()] : ''}
                    </div>
                  );
                })}
              </div>

              {/* Heatmap grid */}
              <div className="flex">
                {generateCalendarGrid().map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col mr-1">
                    {week.map((date, dayIndex) => {
                      if (!date) {
                        return <div key={dayIndex} className="w-3 h-3 mb-1"></div>;
                      }
                      
                      const count = heatmapData.dailyTotals[date] || 0;
                      
                      return (
                        <div
                          key={dayIndex}
                          className={`w-3 h-3 mb-1 rounded-sm border cursor-pointer transition-all ${getIntensityColor(count)}`}
                          onMouseEnter={(e) => handleMouseEnter(date, e)}
                          onMouseLeave={handleMouseLeave}
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

      {/* GitHub-style Tooltip */}
      {hoveredDate && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg border border-gray-700 max-w-xs">
            <div className="font-semibold text-white mb-1">
              {new Date(hoveredDate).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
            {(() => {
              const breakdown = getActivityBreakdown(hoveredDate);
              if (!breakdown || breakdown.total === 0) {
                return <div className="text-gray-300">No activities</div>;
              }
              
              return (
                <div className="space-y-1">
                  <div className="text-green-400 font-medium">
                    {breakdown.total} {breakdown.total === 1 ? 'activity' : 'activities'}
                  </div>
                  <div className="space-y-1 border-t border-gray-700 pt-1">
                    {breakdown.breakdown.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="flex items-center space-x-1">
                          <span>{getActivityIcon(activity.name)}</span>
                          <span className="text-gray-300">{activity.name}</span>
                        </span>
                        <span className="text-white font-medium">{activity.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityHeatmap;