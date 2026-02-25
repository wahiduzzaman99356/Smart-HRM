/**
 * OrgLevelPickerDrawer
 * Right-side drawer that renders the live organogram tree (read from
 * localStorage — written there by useOrganogram) so the user can click
 * any configured node to select its hierarchy path as an org level.
 *
 * Falls back to the department → designation tree from master data when
 * no organogram has been configured yet.
 */

import { useState, useMemo } from 'react';
import { Drawer, Tree, Input, Empty, Tag } from 'antd';
import { SearchOutlined, ApartmentOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import type { Key } from 'react';
import { ORG_TREE_STORAGE_KEY } from '@/features/core-hr/organogram/hooks/useOrganogram';
import type { OrgEmployee } from '@/features/core-hr/organogram/types/organogram.types';
import {
  DEPT_LABELS,
  DEPT_DESIGNATIONS,
  MASTER_EMPLOYEES,
} from '@/features/core-hr/organogram/types/organogram.types';
import type { DeptKey } from '@/features/core-hr/organogram/types/organogram.types';

// ─── Public selection type ────────────────────────────────────────────────────
export interface OrgLevelSelection {
  orgLevelPath: string;
  department: string;
  designation: string;
  currentHC: number;
}

// ─── Extended tree node (carries selection metadata) ─────────────────────────
interface PickerNode extends DataNode {
  orgPath: string;
  orgDept: string;
  orgDesignation: string;
  orgCurrentHC: number;
  children?: PickerNode[];
}

const ORG_TREE_STORAGE_VERSION = 2;

interface OrgTreeStoragePayload {
  version: number;
  tree: OrgEmployee;
}

function isOrgEmployee(value: unknown): value is OrgEmployee {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'status' in value
  );
}

function isOrgTreeStoragePayload(value: unknown): value is OrgTreeStoragePayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    'tree' in value &&
    (value as { version: number }).version === ORG_TREE_STORAGE_VERSION &&
    isOrgEmployee((value as { tree: unknown }).tree)
  );
}

// ─── Build tree from live organogram (localStorage) ──────────────────────────
function buildFromOrgTree(
  node: OrgEmployee,
  parentPath = '',
): PickerNode[] {
  if (node.status === 'empty') {
    // Root placeholder — just expose children
    return (node.children ?? []).flatMap(c => buildFromOrgTree(c, ''));
  }

  const label = node.designation ?? node.name ?? 'Unknown Position';
  const deptLabel = node.departmentLabel ?? '';
  const path = parentPath ? `${parentPath} > ${label}` : label;

  // Approximate current HC: count employees from master data matching dept+designation
  const currentHC = node.department && node.designation
    ? MASTER_EMPLOYEES.filter(
        e => e.department === node.department && e.designation === node.designation,
      ).length
    : node.status === 'active' ? 1 : 0;

  const childNodes = (node.children ?? []).flatMap(c => buildFromOrgTree(c, path));

  const pickerNode: PickerNode = {
    key: node.id,
    title: label,
    orgPath: path,
    orgDept: node.department ?? '',
    orgDesignation: node.designation ?? node.name ?? '',
    orgCurrentHC: currentHC,
    isLeaf: childNodes.length === 0,
    children: childNodes.length > 0 ? childNodes : undefined,
  };

  // Attach dept label as extra info via title override
  if (deptLabel) {
    pickerNode.title = (
      <span>
        {label}
        <Tag
          bordered={false}
          style={{
            marginLeft: 6, fontSize: 10, padding: '0 5px',
            background: '#eff6ff', color: '#3b82f6',
          }}
        >
          {deptLabel}
        </Tag>
      </span>
    );
  }

  return [pickerNode];
}

// ─── Fallback: dept → designation tree from master data ──────────────────────
function buildFallbackTree(): PickerNode[] {
  return Object.entries(DEPT_LABELS).map(([deptKey, deptLabel]) => ({
    key: deptKey,
    title: deptLabel,
    orgPath: deptLabel,
    orgDept: deptKey,
    orgDesignation: '',
    orgCurrentHC: 0,
    selectable: false,
    children: (DEPT_DESIGNATIONS[deptKey as DeptKey] ?? []).map(designation => ({
      key: `${deptKey}||${designation}`,
      title: designation,
      isLeaf: true,
      orgPath: `${deptLabel} > ${designation}`,
      orgDept: deptKey,
      orgDesignation: designation,
      orgCurrentHC: MASTER_EMPLOYEES.filter(
        e => e.department === deptKey && e.designation === designation,
      ).length,
    })),
  }));
}

// ─── Search filter helper ─────────────────────────────────────────────────────
function filterNodes(nodes: PickerNode[], q: string): PickerNode[] {
  if (!q) return nodes;
  const lq = q.toLowerCase();
  return nodes.flatMap(node => {
    const labelStr =
      typeof node.title === 'string'
        ? node.title.toLowerCase()
        : node.orgDesignation.toLowerCase() + ' ' + node.orgDept.toLowerCase();

    const filteredChildren = filterNodes(node.children ?? [], q);
    if (labelStr.includes(lq) || filteredChildren.length > 0) {
      return [{ ...node, children: filteredChildren.length ? filteredChildren : node.children }];
    }
    return [];
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (sel: OrgLevelSelection) => void;
}

export function OrgLevelPickerDrawer({ open, onClose, onSelect }: Props) {
  const [search, setSearch] = useState('');

  // Load org tree from localStorage (written by useOrganogram)
  const { treeData, isConfigured } = useMemo(() => {
    try {
      const raw = localStorage.getItem(ORG_TREE_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (!isOrgTreeStoragePayload(parsed)) {
          return { treeData: buildFallbackTree(), isConfigured: false };
        }
        const nodes = buildFromOrgTree(parsed.tree, '');
        if (nodes.length > 0) return { treeData: nodes, isConfigured: true };
      }
    } catch { /* ignore */ }
    return { treeData: buildFallbackTree(), isConfigured: false };
  }, [open]); // re-derive whenever drawer opens

  const filteredData = useMemo(
    () => filterNodes(treeData, search),
    [treeData, search],
  );

  const expandedKeys = useMemo(
    () => search ? treeData.map(n => n.key as string) : [],
    [search, treeData],
  );

  const handleSelect = (_keys: Key[], info: { node: PickerNode }) => {
    const n = info.node;
    if (!n.orgDesignation) return; // department-level node (fallback tree), not selectable
    onSelect({
      orgLevelPath: n.orgPath,
      department: n.orgDept,
      designation: n.orgDesignation,
      currentHC: n.orgCurrentHC,
    });
    onClose();
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ApartmentOutlined style={{ color: '#3b82f6' }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
            Select Organization Level
          </span>
        </div>
      }
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
      styles={{
        body: { padding: '12px 16px', overflow: 'auto' },
        header: { borderBottom: '1px solid #f0f0f0', padding: '14px 20px' },
      }}
    >
      {!isConfigured && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fcd34d',
          borderRadius: 8, padding: '8px 12px',
          fontSize: 12, color: '#92400e', marginBottom: 10,
        }}>
          Organogram not yet configured — showing master designation list.
          Configure it in <strong>Core HR › Organogram</strong> first.
        </div>
      )}

      <Input
        prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
        placeholder="Search department or designation…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 10, borderRadius: 8 }}
      />

      {filteredData.length === 0 ? (
        <Empty description="No match found" style={{ marginTop: 40 }} />
      ) : (
        <Tree
          treeData={filteredData as DataNode[]}
          expandedKeys={search ? expandedKeys : undefined}
          defaultExpandAll={false}
          onSelect={handleSelect as (keys: Key[], info: unknown) => void}
          showLine={{ showLeafIcon: false }}
          blockNode
          style={{ fontSize: 13 }}
        />
      )}
    </Drawer>
  );
}
