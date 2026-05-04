import { useState, useRef, useEffect } from 'react';
import apiClient from '../utils/api';
import './Backup.css';

type Strategy = 'skip' | 'overwrite' | 'rename';
type Phase = 'idle' | 'backing-up' | 'uploading' | 'previewing' | 'restoring' | 'done';

interface ConflictRecord { pk: number | string; display: string; }
interface TablePreview {
  key: string; model: string; app: string;
  total: number; existing: number; new: number;
  conflicts: ConflictRecord[]; model_exists: boolean;
}
interface PreviewData {
  version: string; created_at: string;
  tables: Record<string, TablePreview>;
  summary: { total_records: number; existing_records: number; new_records: number; tables_count: number; };
}
interface TableResult {
  created: number; overwritten: number; skipped: number; renamed: number; errors: string[];
}
interface RestoreResult {
  strategy: string;
  tables: Record<string, TableResult>;
  summary: { created: number; overwritten: number; skipped: number; renamed: number; errors: number; };
}

const STRATEGY_INFO: Record<Strategy, { label: string; desc: string; color: string }> = {
  skip:      { label: 'Skip',      desc: 'Keep existing records unchanged. Only import new records.',       color: 'var(--color-zeta)' },
  overwrite: { label: 'Overwrite', desc: 'Delete existing records and replace with backup versions.',       color: 'var(--color-epsilon)' },
  rename:    { label: 'Rename',    desc: 'Import conflicting records with a suffix to avoid collisions.',   color: 'var(--color-gamma)' },
};

interface HistoryEntry {
  id: number; action: string; status: string; performed_by: string;
  filename: string; file_size: number | null; strategy: string;
  records_created: number; records_overwritten: number; records_skipped: number;
  records_renamed: number; records_errors: number; total_records: number;
  error_message: string; created_at: string;
}

export default function Backup() {
  const [phase, setPhase]           = useState<Phase>('idle');
  const [strategy, setStrategy]     = useState<Strategy>('skip');
  const [preview, setPreview]       = useState<PreviewData | null>(null);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const [error, setError]           = useState('');
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [history, setHistory]       = useState<HistoryEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/backup/history/');
      setHistory(res.data);
    } catch { /* ignore */ }
  };
  useEffect(() => { fetchHistory(); }, []);

  /* ── Backup ── */
  const handleBackup = async () => {
    setPhase('backing-up');
    setError('');
    try {
      const response = await apiClient.get('/backup/', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `dravohome_backup_${ts}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setPhase('idle');
      fetchHistory();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Backup failed. Please try again.');
      setPhase('idle');
    }
  };

  /* ── File select ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupFile(file);
    setPreview(null);
    setRestoreResult(null);
    setError('');
  };

  /* ── Preview ── */
  const handlePreview = async () => {
    if (!backupFile) return;
    setPhase('uploading');
    setError('');
    try {
      const fd = new FormData();
      fd.append('backup_file', backupFile);
      const res = await apiClient.post('/backup/preview/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(res.data);
      setPhase('previewing');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to analyse backup file.');
      setPhase('idle');
    }
  };

  /* ── Restore ── */
  const handleRestore = async () => {
    if (!backupFile) return;
    if (!window.confirm(`Restore database using strategy: "${STRATEGY_INFO[strategy].label}"?\n\nThis will modify your database. Make sure you have a current backup.`)) return;
    setPhase('restoring');
    setError('');
    setRestoreResult(null);
    try {
      const fd = new FormData();
      fd.append('backup_file', backupFile);
      fd.append('conflict_strategy', strategy);
      const res = await apiClient.post('/backup/restore/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRestoreResult(res.data);
      setPhase('done');
      fetchHistory();
    } catch (e: any) {
      const errorMsg = e.response?.data?.error || e.response?.data?.message || 'Restore failed.';
      const errorDetails = e.response?.data?.details || '';
      setError(errorDetails ? `${errorMsg}\n\nDetails: ${errorDetails}` : errorMsg);
      setPhase('previewing');
    }
  };

  const reset = () => {
    setPhase('idle');
    setPreview(null);
    setRestoreResult(null);
    setBackupFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isLoading = ['backing-up', 'uploading', 'restoring'].includes(phase);

  return (
    <div className="bk-page animate-fadeIn">

      {/* Header */}
      <div className="bk-header">
        <div>
          <h1 className="bk-title">Database Backup & Restore</h1>
          <p className="bk-subtitle">Export a full snapshot of your database or restore from a previous backup</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bk-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
          <button className="bk-error-close" onClick={() => setError('')}>&times;</button>
        </div>
      )}

      <div className="bk-grid">

        {/* ── Backup Card ── */}
        <div className="bk-card">
          <div className="bk-card-icon bk-icon-backup">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <h2 className="bk-card-title">Create Backup</h2>
          <p className="bk-card-desc">
            Export all database tables — products, orders, users, categories, materials, colors, blog posts, and more — as a single JSON file.
          </p>
          <div className="bk-card-info">
            <div className="bk-info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              All tables included
            </div>
            <div className="bk-info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Timestamped filename
            </div>
            <div className="bk-info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Portable JSON format
            </div>
          </div>
          <button className="bk-btn-backup" onClick={handleBackup}
            disabled={isLoading}>
            {phase === 'backing-up' ? (
              <><div className="bk-spinner" /> Exporting…</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Backup
              </>
            )}
          </button>
        </div>

        {/* ── Restore Card ── */}
        <div className="bk-card">
          <div className="bk-card-icon bk-icon-restore">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h2 className="bk-card-title">Restore from Backup</h2>
          <p className="bk-card-desc">
            Upload a backup JSON file to restore data. Preview conflicts before applying, and choose how to handle existing records.
          </p>

          {/* File drop zone */}
          <div className={`bk-drop-zone ${backupFile ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) { setBackupFile(file); setPreview(null); setRestoreResult(null); }
            }}>
            <input ref={fileInputRef} type="file" accept=".json"
              style={{ display: 'none' }} onChange={handleFileChange} />
            {backupFile ? (
              <div className="bk-file-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <div>
                  <div className="bk-file-name">{backupFile.name}</div>
                  <div className="bk-file-size">{(backupFile.size / 1024).toFixed(1)} KB</div>
                </div>
                <button className="bk-file-remove" onClick={e => { e.stopPropagation(); reset(); }}>&times;</button>
              </div>
            ) : (
              <div className="bk-drop-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <span className="bk-drop-title">Drop backup file here</span>
                <span className="bk-drop-sub">or click to browse · .json files only</span>
              </div>
            )}
          </div>

          {backupFile && phase !== 'done' && (
            <button className="bk-btn-preview" onClick={handlePreview}
              disabled={isLoading}>
              {phase === 'uploading' ? (
                <><div className="bk-spinner" /> Analysing…</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Analyse Conflicts
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Preview / Conflict Resolution ── */}
      {preview && phase === 'previewing' && (
        <div className="bk-preview animate-fadeIn">
          <div className="bk-preview-header">
            <div>
              <h2 className="bk-preview-title">Conflict Analysis</h2>
              <p className="bk-preview-meta">
                Backup from {new Date(preview.created_at).toLocaleString()} · v{preview.version}
              </p>
            </div>
            <div className="bk-preview-summary">
              <div className="bk-sum-item bk-sum-total">
                <span className="bk-sum-num">{preview.summary.total_records}</span>
                <span className="bk-sum-label">Total</span>
              </div>
              <div className="bk-sum-item bk-sum-new">
                <span className="bk-sum-num">{preview.summary.new_records}</span>
                <span className="bk-sum-label">New</span>
              </div>
              <div className="bk-sum-item bk-sum-conflict">
                <span className="bk-sum-num">{preview.summary.existing_records}</span>
                <span className="bk-sum-label">Conflicts</span>
              </div>
            </div>
          </div>

          {/* Strategy selector */}
          <div className="bk-strategy-section">
            <h3 className="bk-strategy-title">Conflict Strategy</h3>
            <p className="bk-strategy-desc">Choose how to handle the {preview.summary.existing_records} conflicting records:</p>
            <div className="bk-strategy-grid">
              {(Object.entries(STRATEGY_INFO) as [Strategy, typeof STRATEGY_INFO[Strategy]][]).map(([key, info]) => (
                <label key={key} className={`bk-strategy-card ${strategy === key ? 'selected' : ''}`}
                  style={{ '--strategy-color': info.color } as any}>
                  <input type="radio" name="strategy" value={key}
                    checked={strategy === key} onChange={() => setStrategy(key)} />
                  <div className="bk-strategy-label">{info.label}</div>
                  <div className="bk-strategy-info">{info.desc}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Table breakdown */}
          <div className="bk-tables">
            <h3 className="bk-tables-title">Table Breakdown</h3>
            {Object.entries(preview.tables).map(([key, table]) => (
              <div key={key} className="bk-table-row">
                <div className="bk-table-row-header"
                  onClick={() => setExpandedTable(expandedTable === key ? null : key)}>
                  <div className="bk-table-name">
                    <span className="bk-table-app">{table.app}</span>
                    <span className="bk-table-model">{table.model}</span>
                    {!table.model_exists && <span className="bk-table-missing">model not found</span>}
                  </div>
                  <div className="bk-table-stats">
                    <span className="bk-stat-new">{table.new} new</span>
                    {table.existing > 0 && <span className="bk-stat-conflict">{table.existing} conflicts</span>}
                    <span className="bk-stat-total">{table.total} total</span>
                    {table.conflicts.length > 0 && (
                      <svg className={`bk-chevron ${expandedTable === key ? 'open' : ''}`}
                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    )}
                  </div>
                </div>
                {expandedTable === key && table.conflicts.length > 0 && (
                  <div className="bk-conflicts-list">
                    {table.conflicts.map(c => (
                      <div key={c.pk} className="bk-conflict-item">
                        <span className="bk-conflict-pk">#{c.pk}</span>
                        <span className="bk-conflict-name">{c.display}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Restore button */}
          <div className="bk-restore-actions">
            <button className="bk-btn-cancel" onClick={reset}>Cancel</button>
            <button className="bk-btn-restore" onClick={handleRestore} disabled={isLoading}>
              {(phase as Phase) === 'restoring' ? (
                <><div className="bk-spinner" /> Restoring…</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Restore with {STRATEGY_INFO[strategy].label}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Restoring Overlay ── */}
      {phase === 'restoring' && (
        <div className="bk-restoring-overlay animate-fadeIn">
          <div className="bk-restoring-card">
            <div className="bk-restoring-spinner">
              <div className="bk-spinner-large" />
            </div>
            <h3 className="bk-restoring-title">Restoring Database...</h3>
            <p className="bk-restoring-desc">
              Applying {preview?.summary.total_records} records using <strong>{STRATEGY_INFO[strategy].label}</strong> strategy
            </p>
            <div className="bk-restoring-progress">
              <div className="bk-progress-bar">
                <div className="bk-progress-fill" />
              </div>
              <p className="bk-restoring-note">This may take a few moments. Please don't close this window.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Restore Result ── */}
      {restoreResult && phase === 'done' && (
        <div className="bk-result animate-fadeIn">
          <div className="bk-result-header">
            <div className="bk-result-icon bk-result-icon-success">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <h2 className="bk-result-title">Restore Complete!</h2>
              <p className="bk-result-sub">
                Successfully restored using <strong>{STRATEGY_INFO[restoreResult.strategy as Strategy]?.label}</strong> strategy
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bk-result-summary">
            {[
              { key: 'created',     label: 'Created',     color: 'var(--color-delta)', icon: 'M12 5v14M5 12h14' },
              { key: 'overwritten', label: 'Overwritten', color: 'var(--color-gamma)', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7' },
              { key: 'skipped',     label: 'Skipped',     color: 'var(--color-zeta)', icon: 'M9 11l3 3L22 4' },
              { key: 'renamed',     label: 'Renamed',     color: 'var(--color-beta)', icon: 'M16 3h5v5M4 20L21 3' },
              { key: 'errors',      label: 'Errors',      color: 'var(--color-epsilon)', icon: 'M12 8v4M12 16h.01' },
            ].map(({ key, label, color, icon }) => {
              const value = (restoreResult.summary as any)[key];
              return (
                <div key={key} className={`bk-result-stat ${value > 0 ? 'has-value' : ''}`} 
                  style={{ '--stat-color': color } as any}>
                  <div className="bk-result-stat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={icon} />
                    </svg>
                  </div>
                  <div className="bk-result-stat-content">
                    <span className="bk-result-num">{value}</span>
                    <span className="bk-result-label">{label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed breakdown */}
          <div className="bk-result-details">
            <h3 className="bk-result-details-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
              </svg>
              Table-by-Table Breakdown
            </h3>
            <div className="bk-tables">
              {Object.entries(restoreResult.tables)
                .sort(([, a], [, b]) => (b.created + b.overwritten) - (a.created + a.overwritten))
                .map(([key, t]) => {
                  const hasActivity = t.created > 0 || t.overwritten > 0 || t.renamed > 0 || t.skipped > 0;
                  const hasErrors = t.errors.length > 0;
                  
                  return (
                    <div key={key} className={`bk-table-row ${hasErrors ? 'has-errors' : ''} ${!hasActivity ? 'no-activity' : ''}`}>
                      <div className="bk-table-row-header"
                        onClick={() => hasErrors ? setExpandedTable(expandedTable === key ? null : key) : null}
                        style={{ cursor: hasErrors ? 'pointer' : 'default' }}>
                        <div className="bk-table-name">
                          <span className="bk-table-app">{key.split('.')[0]}</span>
                          <span className="bk-table-model">{key.split('.')[1]}</span>
                          {hasErrors && (
                            <span className="bk-table-error-badge">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                              </svg>
                              {t.errors.length} error{t.errors.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="bk-table-stats">
                          {t.created > 0     && <span className="bk-stat-new">+{t.created}</span>}
                          {t.overwritten > 0 && <span className="bk-stat-overwritten">↻{t.overwritten}</span>}
                          {t.renamed > 0     && <span className="bk-stat-renamed">⤷{t.renamed}</span>}
                          {t.skipped > 0     && <span className="bk-stat-skipped">⊘{t.skipped}</span>}
                          {!hasActivity && <span className="bk-stat-none">No changes</span>}
                          {hasErrors && (
                            <svg className={`bk-chevron ${expandedTable === key ? 'open' : ''}`}
                              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          )}
                        </div>
                      </div>
                      {expandedTable === key && hasErrors && (
                        <div className="bk-conflicts-list">
                          {t.errors.map((e, i) => (
                            <div key={i} className="bk-conflict-item bk-conflict-error">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                              </svg>
                              <span>{e}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Success message */}
          {restoreResult.summary.errors === 0 && (
            <div className="bk-success-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>All records restored successfully with no errors!</span>
            </div>
          )}

          {/* Warning message */}
          {restoreResult.summary.errors > 0 && (
            <div className="bk-warning-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>
                Restore completed with {restoreResult.summary.errors} error{restoreResult.summary.errors > 1 ? 's' : ''}. 
                Expand tables above to see details.
              </span>
            </div>
          )}

          <div className="bk-result-actions">
            <button className="bk-btn-secondary" onClick={reset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              Restore Another Backup
            </button>
            <button className="bk-btn-primary" onClick={() => window.location.reload()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {/* ── History Section ── */}
      {history.length > 0 && (
        <div className="bk-history animate-fadeIn">
          <h2 className="bk-history-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Backup & Restore History
          </h2>
          <div className="bk-history-list">
            {history.map(h => {
              const isBackup = h.action === 'backup';
              const statusClass = h.status === 'success' ? 'success' : h.status === 'partial' ? 'partial' : 'failed';
              const [expanded, setExpanded] = [expandedTable === `history-${h.id}`, () => setExpandedTable(expandedTable === `history-${h.id}` ? null : `history-${h.id}`)];
              return (
                <div key={h.id} className={`bk-history-item bk-history-${statusClass}`}>
                  <div className={`bk-history-icon ${isBackup ? 'bk-history-icon-backup' : 'bk-history-icon-restore'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {isBackup
                        ? <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>
                        : <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>
                      }
                    </svg>
                  </div>
                  <div className="bk-history-details">
                    <div className="bk-history-top">
                      <span className="bk-history-action">{isBackup ? 'Backup' : 'Restore'}</span>
                      <span className={`bk-history-status bk-status-${statusClass}`}>{h.status}</span>
                      {h.strategy && <span className="bk-history-strategy">{h.strategy}</span>}
                    </div>
                    <div className="bk-history-meta">
                      <span>{new Date(h.created_at).toLocaleString()}</span>
                      {h.performed_by && <span>by {h.performed_by}</span>}
                      {h.filename && <span className="bk-history-filename">{h.filename}</span>}
                      {h.file_size && <span>{(h.file_size / 1024).toFixed(1)} KB</span>}
                    </div>
                    {!isBackup && (
                      <div className="bk-history-stats">
                        {h.records_created > 0 && <span className="bk-hstat-created">+{h.records_created}</span>}
                        {h.records_overwritten > 0 && <span className="bk-hstat-overwritten">↻{h.records_overwritten}</span>}
                        {h.records_skipped > 0 && <span className="bk-hstat-skipped">⊘{h.records_skipped}</span>}
                        {h.records_errors > 0 && <span className="bk-hstat-errors" style={{cursor:'pointer'}} onClick={setExpanded}>⚠{h.records_errors} errors — click to view</span>}
                      </div>
                    )}
                    {isBackup && <div className="bk-history-stats"><span className="bk-hstat-total">{h.total_records} records</span></div>}
                    {expanded && h.error_message && (
                      <div className="bk-history-errors">
                        <pre className="bk-history-errors-pre">{h.error_message}</pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
