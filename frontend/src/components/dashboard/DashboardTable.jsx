import { Children, cloneElement, isValidElement } from "react";

function stackLabel(columns, columnIndex) {
  const col = columns?.[columnIndex];
  if (typeof col === "string" && col.trim()) return col.trim();
  const n = columns?.length ?? 0;
  if (columnIndex === n - 1) return "Actions";
  return "Details";
}

function addDataLabelsToRow(rowElement, columns) {
  if (!isValidElement(rowElement)) return rowElement;
  const cells = Children.toArray(rowElement.props.children).filter(Boolean);
  const mapped = cells.map((cell, i) => {
    if (!isValidElement(cell)) return cell;
    return cloneElement(cell, {
      key: cell.key ?? `cell-${i}`,
      "data-label": stackLabel(columns, i),
    });
  });
  return cloneElement(rowElement, { key: rowElement.key }, mapped);
}

function DashboardTable({ columns = [], children }) {
  const body = Children.map(children, (row) =>
    columns.length ? addDataLabelsToRow(row, columns) : row
  );

  return (
    <div className="dashboard-table-wrap" role="region" aria-label="Data table">
      <table className="dashboard-table">
        <thead>
          <tr>
            {columns.map((column, i) => (
              <th key={typeof column === "string" && column ? column : `col-${i}`}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}

export default DashboardTable;
