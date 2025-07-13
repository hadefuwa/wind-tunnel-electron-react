import { WindTunnelData } from '../store/useAppStore';

export interface DataSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  data: WindTunnelData[];
  config: any;
  notes?: string;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel';
  includeMetadata?: boolean;
  dateRange?: { start: Date; end: Date };
}

export class DataLogger {
  private sessions: Map<string, DataSession> = new Map();
  private currentSession: DataSession | null = null;
  private maxDataPoints: number = 10000; // Prevent memory issues

  // Start a new data session
  startSession(name: string, config: any, notes?: string): string {
    const sessionId = this.generateSessionId();
    const session: DataSession = {
      id: sessionId,
      name,
      startTime: new Date(),
      data: [],
      config,
      notes
    };

    this.sessions.set(sessionId, session);
    this.currentSession = session;
    
    console.log(`Started data session: ${name} (${sessionId})`);
    return sessionId;
  }

  // End the current session
  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      console.log(`Ended data session: ${this.currentSession.name}`);
      this.currentSession = null;
    }
  }

  // Add data point to current session
  addDataPoint(data: WindTunnelData): void {
    if (!this.currentSession) {
      console.warn('No active session, creating default session');
      this.startSession('Default Session', {}, 'Auto-created session');
    }

    if (this.currentSession) {
      this.currentSession.data.push(data);
      
      // Limit data points to prevent memory issues
      if (this.currentSession.data.length > this.maxDataPoints) {
        this.currentSession.data = this.currentSession.data.slice(-this.maxDataPoints);
      }
    }
  }

  // Get current session
  getCurrentSession(): DataSession | null {
    return this.currentSession;
  }

  // Get all sessions
  getAllSessions(): DataSession[] {
    return Array.from(this.sessions.values());
  }

  // Get session by ID
  getSession(id: string): DataSession | undefined {
    return this.sessions.get(id);
  }

  // Delete session
  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  // Export data to CSV
  exportToCSV(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const headers = [
      'Timestamp',
      'Drag Coefficient',
      'Lift Coefficient', 
      'Reynolds Number',
      'Velocity (m/s)',
      'Pressure (kPa)',
      'Temperature (°C)'
    ];

    const csvRows = [headers.join(',')];

    session.data.forEach(point => {
      const row = [
        point.timestamp.toISOString(),
        point.dragCoefficient.toFixed(6),
        point.liftCoefficient.toFixed(6),
        point.reynoldsNumber.toFixed(0),
        point.velocity.toFixed(2),
        point.pressure.toFixed(2),
        point.temperature.toFixed(2)
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // Export data to JSON
  exportToJSON(sessionId: string, includeMetadata: boolean = true): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const exportData = includeMetadata ? session : session.data;
    return JSON.stringify(exportData, null, 2);
  }

  // Export data with options
  exportData(sessionId: string, options: ExportOptions): string | Blob {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    switch (options.format) {
      case 'csv':
        return this.exportToCSV(sessionId);
      case 'json':
        return this.exportToJSON(sessionId, options.includeMetadata);
      case 'excel':
        // For now, return CSV as Excel format
        // In a real implementation, you'd use a library like xlsx
        return this.exportToCSV(sessionId);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  // Download data as file
  downloadData(sessionId: string, options: ExportOptions): void {
    try {
      const data = this.exportData(sessionId, options);
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const blob = new Blob([data as string], { 
        type: this.getMimeType(options.format) 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.name}_${new Date().toISOString().split('T')[0]}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`Downloaded session data: ${session.name}`);
    } catch (error) {
      console.error('Failed to download data:', error);
      throw error;
    }
  }

  // Get MIME type for export format
  private getMimeType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'text/plain';
    }
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get data statistics for a session
  getSessionStats(sessionId: string): {
    dataPoints: number;
    duration: number;
    avgVelocity: number;
    avgDrag: number;
    avgLift: number;
    velocityRange: { min: number; max: number };
    dragRange: { min: number; max: number };
    liftRange: { min: number; max: number };
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.data.length === 0) {
      return null;
    }

    const velocities = session.data.map(d => d.velocity);
    const drags = session.data.map(d => d.dragCoefficient);
    const lifts = session.data.map(d => d.liftCoefficient);

    const duration = session.endTime 
      ? session.endTime.getTime() - session.startTime.getTime()
      : Date.now() - session.startTime.getTime();

    return {
      dataPoints: session.data.length,
      duration: duration / 1000, // Convert to seconds
      avgVelocity: velocities.reduce((a, b) => a + b, 0) / velocities.length,
      avgDrag: drags.reduce((a, b) => a + b, 0) / drags.length,
      avgLift: lifts.reduce((a, b) => a + b, 0) / lifts.length,
      velocityRange: { min: Math.min(...velocities), max: Math.max(...velocities) },
      dragRange: { min: Math.min(...drags), max: Math.max(...drags) },
      liftRange: { min: Math.min(...lifts), max: Math.max(...lifts) }
    };
  }

  // Clear all sessions
  clearAllSessions(): void {
    this.sessions.clear();
    this.currentSession = null;
    console.log('Cleared all data sessions');
  }

  // Get storage size estimate
  getStorageSize(): number {
    const data = JSON.stringify(Array.from(this.sessions.values()));
    return new Blob([data]).size;
  }
}

// Default data logger instance
export const defaultDataLogger = new DataLogger(); 