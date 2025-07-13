import React, { useState, useEffect } from 'react';
import { 
  DocumentArrowDownIcon, 
  PlayIcon, 
  StopIcon, 
  TrashIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { dataExportService, SessionData, ExportOptions } from '../../services/DataExportService';
import { useAppStore } from '../../store/useAppStore';

export default function DataManagement() {
  const { currentData, dataHistory, isSimulationRunning } = useAppStore();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [showSessionStats, setShowSessionStats] = useState<string | null>(null);

  // Update sessions list
  useEffect(() => {
    setSessions(dataExportService.getAllSessions());
    setCurrentSession(dataExportService.getCurrentSession());
  }, []);

  // Add data to current session when simulation is running
  useEffect(() => {
    if (currentData && isSimulationRunning && currentSession) {
      dataExportService.addDataToSession(currentData);
    }
  }, [currentData, isSimulationRunning, currentSession]);

  const startNewSession = () => {
    if (!sessionName.trim()) {
      alert('Please enter a session name');
      return;
    }

    const config = {
      mode: 'simulation',
      timestamp: new Date().toISOString(),
    };

    const sessionId = dataExportService.startSession(sessionName, config, sessionNotes);
    setCurrentSession(dataExportService.getCurrentSession());
    setSessions(dataExportService.getAllSessions());
    setSessionName('');
    setSessionNotes('');
  };

  const endCurrentSession = () => {
    const endedSession = dataExportService.endSession();
    setCurrentSession(null);
    setSessions(dataExportService.getAllSessions());
    
    if (endedSession) {
      alert(`Session "${endedSession.name}" ended. Data points: ${endedSession.data.length}`);
    }
  };

  const exportSession = (sessionId: string) => {
    const options: ExportOptions = {
      format: exportFormat,
      includeHeaders: true,
    };

    const content = dataExportService.exportSession(sessionId, options);
    if (content) {
      const session = sessions.find(s => s.id === sessionId);
      const filename = dataExportService.generateFilename(
        session?.name || 'wind-tunnel-data',
        exportFormat
      );
      
      const mimeTypes = {
        csv: 'text/csv',
        json: 'application/json',
        excel: 'text/csv'
      };

      dataExportService.downloadFile(content, filename, mimeTypes[exportFormat]);
    }
  };

  const exportCurrentData = () => {
    const options: ExportOptions = {
      format: exportFormat,
      includeHeaders: true,
    };

    const content = dataExportService.exportData(dataHistory, options);
    const filename = dataExportService.generateFilename('current-data', exportFormat);
    
    const mimeTypes = {
      csv: 'text/csv',
      json: 'application/json',
      excel: 'text/csv'
    };

    dataExportService.downloadFile(content, filename, mimeTypes[exportFormat]);
  };

  const deleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      dataExportService.deleteSession(sessionId);
      setSessions(dataExportService.getAllSessions());
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    }
  };

  const getSessionStats = (sessionId: string) => {
    return dataExportService.getSessionStats(sessionId);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Data Management</h3>
        <p className="text-background-400 text-sm">
          Manage data logging sessions and export your wind tunnel data
        </p>
      </div>

      {/* Session Controls */}
      <div className="bg-background-800 rounded-lg p-6">
        <h4 className="text-md font-medium mb-4">Session Management</h4>
        
        {!currentSession ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-background-300 mb-2">
                Session Name
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name..."
                className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-white placeholder-background-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-background-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Add session notes..."
                rows={3}
                className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-white placeholder-background-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={startNewSession}
              className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium transition-colors"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Start New Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background-700 rounded-lg">
              <div>
                <h5 className="font-medium">{currentSession.name}</h5>
                <p className="text-sm text-background-400">
                  Started: {currentSession.startTime.toLocaleString()}
                </p>
                <p className="text-sm text-background-400">
                  Data points: {currentSession.data.length}
                </p>
              </div>
              <button
                onClick={endCurrentSession}
                className="flex items-center px-4 py-2 bg-error-600 hover:bg-error-700 rounded-lg text-white font-medium transition-colors"
              >
                <StopIcon className="h-4 w-4 mr-2" />
                End Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Controls */}
      <div className="bg-background-800 rounded-lg p-6">
        <h4 className="text-md font-medium mb-4">Export Data</h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-background-300">Format:</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={exportCurrentData}
              disabled={dataHistory.length === 0}
              className="flex items-center px-4 py-2 bg-secondary-600 hover:bg-secondary-700 disabled:bg-secondary-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Current Data
            </button>
            
            {currentSession && (
              <button
                onClick={() => exportSession(currentSession.id)}
                disabled={currentSession.data.length === 0}
                className="flex items-center px-4 py-2 bg-success-600 hover:bg-success-700 disabled:bg-success-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Export Current Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-background-800 rounded-lg p-6">
        <h4 className="text-md font-medium mb-4">Previous Sessions</h4>
        
        {sessions.length === 0 ? (
          <div className="text-center text-background-400 py-8">
            No sessions found
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const stats = getSessionStats(session.id);
              return (
                <div key={session.id} className="border border-background-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{session.name}</h5>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowSessionStats(showSessionStats === session.id ? null : session.id)}
                        className="p-1 text-background-400 hover:text-white transition-colors"
                        title="View Statistics"
                      >
                        <ChartBarIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => exportSession(session.id)}
                        className="p-1 text-background-400 hover:text-white transition-colors"
                        title="Export Session"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="p-1 text-background-400 hover:text-error-400 transition-colors"
                        title="Delete Session"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-background-400">Data Points</div>
                      <div className="font-medium">{session.data.length}</div>
                    </div>
                    <div>
                      <div className="text-background-400">Start Time</div>
                      <div className="font-medium">{session.startTime.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-background-400">Duration</div>
                      <div className="font-medium">
                        {stats ? formatDuration(stats.duration) : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-background-400">Status</div>
                      <div className="font-medium">
                        {session.endTime ? 'Completed' : 'Active'}
                      </div>
                    </div>
                  </div>

                  {session.notes && (
                    <div className="mt-2 text-sm text-background-400">
                      <strong>Notes:</strong> {session.notes}
                    </div>
                  )}

                  {showSessionStats === session.id && stats && (
                    <div className="mt-4 p-3 bg-background-700 rounded-lg">
                      <h6 className="font-medium mb-2">Statistics</h6>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-background-400">Avg Drag</div>
                          <div className="font-medium">{stats.dragCoefficient.avg.toFixed(3)}</div>
                        </div>
                        <div>
                          <div className="text-background-400">Avg Lift</div>
                          <div className="font-medium">{stats.liftCoefficient.avg.toFixed(3)}</div>
                        </div>
                        <div>
                          <div className="text-background-400">Avg Velocity</div>
                          <div className="font-medium">{stats.velocity.avg.toFixed(1)} m/s</div>
                        </div>
                        <div>
                          <div className="text-background-400">Avg Pressure</div>
                          <div className="font-medium">{stats.pressure.avg.toFixed(1)} kPa</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 