import { WindTunnelData } from '../store/useAppStore';

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel';
  includeHeaders?: boolean;
  dateFormat?: string;
  filename?: string;
}

export interface SessionData {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  data: WindTunnelData[];
  config: any;
  notes?: string;
}

class DataExportService {
  private sessions: Map<string, SessionData> = new Map();
  private currentSessionId: string | null = null;

  // Start a new data logging session
  startSession(name: string, config: any, notes?: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: SessionData = {
      id: sessionId,
      name,
      startTime: new Date(),
      data: [],
      config,
      notes,
    };
    
    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;
    
    console.log(`Started new session: ${name} (${sessionId})`);
    return sessionId;
  }

  // Add data to current session
  addDataToSession(data: WindTunnelData): void {
    if (!this.currentSessionId) {
      console.warn('No active session to add data to');
      return;
    }

    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.data.push(data);
    }
  }

  // End current session
  endSession(): SessionData | null {
    if (!this.currentSessionId) {
      console.warn('No active session to end');
      return null;
    }

    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.endTime = new Date();
      this.currentSessionId = null;
      console.log(`Ended session: ${session.name}`);
      return session;
    }
    return null;
  }

  // Get current session
  getCurrentSession(): SessionData | null {
    if (!this.currentSessionId) return null;
    return this.sessions.get(this.currentSessionId) || null;
  }

  // Get all sessions
  getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values());
  }

  // Export data to CSV format
  private exportToCSV(data: WindTunnelData[], options: ExportOptions): string {
    const headers = [
      'Timestamp',
      'Drag Coefficient',
      'Lift Coefficient', 
      'Reynolds Number',
      'Velocity (m/s)',
      'Pressure (kPa)',
      'Temperature (°C)'
    ];

    const rows = data.map(item => [
      item.timestamp.toISOString(),
      item.dragCoefficient.toString(),
      item.liftCoefficient.toString(),
      item.reynoldsNumber.toString(),
      item.velocity.toString(),
      item.pressure.toString(),
      item.temperature.toString()
    ]);

    let csv = '';
    if (options.includeHeaders !== false) {
      csv += headers.join(',') + '\n';
    }
    csv += rows.map(row => row.join(',')).join('\n');
    
    return csv;
  }

  // Export data to JSON format
  private exportToJSON(data: WindTunnelData[], options: ExportOptions): string {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        dataPoints: data.length,
        format: 'wind-tunnel-data'
      },
      data: data.map(item => ({
        ...item,
        timestamp: item.timestamp.toISOString()
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Export data to Excel format (CSV with .xlsx extension for now)
  private exportToExcel(data: WindTunnelData[], options: ExportOptions): string {
    // For now, we'll export as CSV but with Excel-compatible formatting
    // In a real implementation, you'd use a library like xlsx
    return this.exportToCSV(data, options);
  }

  // Main export function
  exportData(data: WindTunnelData[], options: ExportOptions): string {
    switch (options.format) {
      case 'csv':
        return this.exportToCSV(data, options);
      case 'json':
        return this.exportToJSON(data, options);
      case 'excel':
        return this.exportToExcel(data, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  // Export current session
  exportCurrentSession(options: ExportOptions): string | null {
    const session = this.getCurrentSession();
    if (!session) {
      console.warn('No active session to export');
      return null;
    }
    return this.exportData(session.data, options);
  }

  // Export specific session
  exportSession(sessionId: string, options: ExportOptions): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`Session not found: ${sessionId}`);
      return null;
    }
    return this.exportData(session.data, options);
  }

  // Download file to user's computer
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate filename with timestamp
  generateFilename(baseName: string, format: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    return `${baseName}_${timestamp}.${format}`;
  }

  // Get session statistics
  getSessionStats(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const data = session.data;
    if (data.length === 0) return null;

    const dragValues = data.map(d => d.dragCoefficient);
    const liftValues = data.map(d => d.liftCoefficient);
    const velocityValues = data.map(d => d.velocity);
    const pressureValues = data.map(d => d.pressure);

    return {
      sessionId,
      sessionName: session.name,
      dataPoints: data.length,
      duration: session.endTime 
        ? (session.endTime.getTime() - session.startTime.getTime()) / 1000 
        : (Date.now() - session.startTime.getTime()) / 1000,
      dragCoefficient: {
        min: Math.min(...dragValues),
        max: Math.max(...dragValues),
        avg: dragValues.reduce((a, b) => a + b, 0) / dragValues.length,
      },
      liftCoefficient: {
        min: Math.min(...liftValues),
        max: Math.max(...liftValues),
        avg: liftValues.reduce((a, b) => a + b, 0) / liftValues.length,
      },
      velocity: {
        min: Math.min(...velocityValues),
        max: Math.max(...velocityValues),
        avg: velocityValues.reduce((a, b) => a + b, 0) / velocityValues.length,
      },
      pressure: {
        min: Math.min(...pressureValues),
        max: Math.max(...pressureValues),
        avg: pressureValues.reduce((a, b) => a + b, 0) / pressureValues.length,
      },
    };
  }

  // Clear all sessions (use with caution)
  clearAllSessions(): void {
    this.sessions.clear();
    this.currentSessionId = null;
    console.log('All sessions cleared');
  }

  // Delete specific session
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted && this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
    return deleted;
  }
}

// Export singleton instance
export const dataExportService = new DataExportService(); 