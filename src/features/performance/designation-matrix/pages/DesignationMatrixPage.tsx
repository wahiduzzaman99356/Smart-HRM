/**
 * DesignationMatrixPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Matrix showing KPI weight assignments by designation across Main KPI Areas.
 * Supports editing weights via a modal form.
 */

import { useState } from 'react';
import { Button, InputNumber, Modal, Table, Tag, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { EditOutlined } from '@ant-design/icons';

type Designation = 'Manager' | 'Senior Executive' | 'Executive' | 'Officer' | 'Associate';

type KpiAreaKey =
  | 'financialPerformance'
  | 'customerSatisfaction'
  | 'operationalEfficiency'
  | 'employeeDevelopment'
  | 'innovationGrowth';

interface MatrixRow {
  designation: Designation;
  financialPerformance: number;
  customerSatisfaction: number;
  operationalEfficiency: number;
  employeeDevelopment: number;
  innovationGrowth: number;
}

const KPI_AREA_LABELS: Record<KpiAreaKey, string> = {
  financialPerformance:   'Financial Performance',
  customerSatisfaction:   'Customer Satisfaction',
  operationalEfficiency:  'Operational Efficiency',
  employeeDevelopment:    'Employee Development',
  innovationGrowth:       'Innovation & Growth',
};

const KPI_AREA_KEYS: KpiAreaKey[] = [
  'financialPerformance',
  'customerSatisfaction',
  'operationalEfficiency',
  'employeeDevelopment',
  'innovationGrowth',
];

const INITIAL_MATRIX: MatrixRow[] = [
  { designation: 'Manager',          financialPerformance: 35, customerSatisfaction: 20, operationalEfficiency: 20, employeeDevelopment: 15, innovationGrowth: 10 },
  { designation: 'Senior Executive', financialPerformance: 30, customerSatisfaction: 25, operationalEfficiency: 20, employeeDevelopment: 15, innovationGrowth: 10 },
  { designation: 'Executive',        financialPerformance: 25, customerSatisfaction: 25, operationalEfficiency: 25, employeeDevelopment: 15, innovationGrowth: 10 },
  { designation: 'Officer',          financialPerformance: 20, customerSatisfaction: 20, operationalEfficiency: 30, employeeDevelopment: 20, innovationGrowth: 10 },
  { designation: 'Associate',        financialPerformance: 15, customerSatisfaction: 20, operationalEfficiency: 30, employeeDevelopment: 25, innovationGrowth: 10 },
];

type EditForm = Omit<MatrixRow, 'designation'>;

function rowTotal(row: MatrixRow): number {
  return KPI_AREA_KEYS.reduce((sum, k) => sum + row[k], 0);
}

function weightTag(value: number) {
  const color = value >= 30 ? '#0f766e' : value >= 20 ? '#0284c7' : value >= 10 ? '#d97706' : '#9ca3af';
  const bg = value >= 30 ? '#f0fdfa' : value >= 20 ? '#eff6ff' : value >= 10 ? '#fffbeb' : '#f9fafb';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 700,
        color,
        background: bg,
        border: `1px solid ${color}30`,
      }}
    >
      {value}%
    </span>
  );
}

export default function DesignationMatrixPage() {
  const [matrix, setMatrix] = useState<MatrixRow[]>(INITIAL_MATRIX);
  const [editRow, setEditRow] = useState<MatrixRow | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    financialPerformance:  0,
    customerSatisfaction:  0,
    operationalEfficiency: 0,
    employeeDevelopment:   0,
    innovationGrowth:      0,
  });

  function openEdit(row: MatrixRow) {
    setEditRow(row);
    setEditForm({
      financialPerformance:  row.financialPerformance,
      customerSatisfaction:  row.customerSatisfaction,
      operationalEfficiency: row.operationalEfficiency,
      employeeDevelopment:   row.employeeDevelopment,
      innovationGrowth:      row.innovationGrowth,
    });
  }

  function handleSave() {
    const total = KPI_AREA_KEYS.reduce((sum, k) => sum + (editForm[k] ?? 0), 0);
    if (total !== 100) {
      message.error(`Weights must total 100%. Current total: ${total}%.`);
      return;
    }
    setMatrix((prev) =>
      prev.map((r) =>
        r.designation === editRow?.designation ? { ...r, ...editForm } : r,
      ),
    );
    message.success(`Matrix updated for ${editRow?.designation}.`);
    setEditRow(null);
  }

  const columns: TableColumnsType<MatrixRow> = [
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      fixed: 'left',
      width: 160,
      render: (v) => <span style={{ fontWeight: 700, color: '#0f766e' }}>{v}</span>,
    },
    ...KPI_AREA_KEYS.map((k) => ({
      title: KPI_AREA_LABELS[k],
      dataIndex: k,
      key: k,
      width: 160,
      render: (v: number) => weightTag(v),
    })),
    {
      title: 'Total',
      key: 'total',
      width: 90,
      fixed: 'right' as const,
      render: (_v: unknown, record: MatrixRow) => {
        const t = rowTotal(record);
        return <Tag color={t === 100 ? 'green' : 'red'}>{t}%</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: (_v: unknown, record: MatrixRow) => (
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          style={{ color: '#0f766e' }}
          onClick={() => openEdit(record)}
        />
      ),
    },
  ];

  return (
    <div className="page-shell">
      <div className="page-header-row">
        <div>
          <h1>Designation Matrix</h1>
          <p>KPI weight distribution across designations and main KPI areas.</p>
        </div>
      </div>

      <div className="list-surface" style={{ overflowX: 'auto' }}>
        <Table<MatrixRow>
          rowKey="designation"
          columns={columns}
          dataSource={matrix}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: 900 }}
          locale={{ emptyText: 'No matrix data.' }}
        />
      </div>

      <Modal
        open={!!editRow}
        title={`Edit Matrix — ${editRow?.designation ?? ''}`}
        okText="Save"
        cancelText="Cancel"
        onOk={handleSave}
        onCancel={() => setEditRow(null)}
        width={460}
      >
        {editRow && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 6 }}>
            <div
              style={{
                padding: '8px 12px',
                background: '#f0fdfa',
                borderRadius: 8,
                fontSize: 12,
                color: '#0f766e',
                fontWeight: 600,
                border: '1px solid #d4efeb',
              }}
            >
              All weights must total exactly 100%.
            </div>
            {KPI_AREA_KEYS.map((k) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 13, color: '#374151', flex: 1 }}>{KPI_AREA_LABELS[k]}</div>
                <InputNumber
                  min={0}
                  max={100}
                  value={editForm[k]}
                  onChange={(v) => setEditForm((p) => ({ ...p, [k]: v ?? 0 }))}
                  style={{ width: 100 }}
                  suffix="%"
                />
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#374151' }}>Total</span>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: KPI_AREA_KEYS.reduce((s, k) => s + (editForm[k] ?? 0), 0) === 100 ? '#059669' : '#dc2626',
                }}
              >
                {KPI_AREA_KEYS.reduce((s, k) => s + (editForm[k] ?? 0), 0)}%
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
