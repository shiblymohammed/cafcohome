import type { ReactNode } from 'react';
import './DataTable.css';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  customActions?: (item: T) => ReactNode;
}

function DataTable<T extends { id: number | string }>({
  columns,
  data,
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = 'No data available',
  customActions,
}: DataTableProps<T>) {
  if (loading) {
    return <div className="data-table-loading">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="data-table-empty">{emptyMessage}</div>;
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {(onEdit || onDelete || customActions) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? data.map((item) => (
            <tr key={item.id}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render
                    ? column.render(item)
                    : String((item as any)[column.key] ?? '')}
                </td>
              ))}
              {(onEdit || onDelete || customActions) && (
                <td className="data-table-actions">
                  {onEdit && (
                    <button
                      className="btn-edit"
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(item)}
                      title="Delete"
                    >
                      Delete
                    </button>
                  )}
                  {customActions && customActions(item)}
                </td>
              )}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length + ((onEdit || onDelete || customActions) ? 1 : 0)} style={{ textAlign: 'center', padding: '2rem' }}>
                {!Array.isArray(data) ? 'Loading...' : 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
