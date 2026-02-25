import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  OrgEmployee,
  OrgFilters,
  NodeFormAnchor,
  NodeFormValues,
  DeptKey,
  GradeKey,
} from '../types/organogram.types';
import {
  MASTER_EMPLOYEES,
  DEPT_LABELS,
  DEPT_DESIGNATIONS,
  empLabel,
} from '../types/organogram.types';

const GRADE_ORDER: Record<GradeKey, number> = {
  G9: 9, G8: 8, G7: 7, G6: 6, G5: 5, G4: 4, G3: 3, G2: 2, G1: 1,
};

const INITIAL_TREE: OrgEmployee = { id: 'root-1', status: 'empty' };
export const ORG_TREE_STORAGE_KEY = 'hrm_org_tree';
const ORG_TREE_STORAGE_VERSION = 2;

interface OrgTreeStoragePayload {
  version: number;
  tree: OrgEmployee;
}

function loadSavedTree(): OrgEmployee {
  // Always start from a clean root node on page load.
  // This prevents stale persisted trees from auto-populating the organogram.
  return INITIAL_TREE;
}

const DEFAULT_FILTERS: OrgFilters = {
  search: '', department: '', showVacant: true, showSeparation: true, darkMode: false, showGrade: false,
};

// ─── Tree helpers ─────────────────────────────────────────────────────────────────────────────────

function countActive(node: OrgEmployee): number {
  return (node.status === 'active' ? 1 : 0) +
    (node.children?.reduce((n, c) => n + countActive(c), 0) ?? 0);
}

function countVacant(node: OrgEmployee): number {
  return (node.status === 'vacant' ? 1 : 0) +
    (node.children?.reduce((n, c) => n + countVacant(c), 0) ?? 0);
}

function insertChildren(
  tree: OrgEmployee,
  parentId: string,
  newNodes: OrgEmployee[],
): OrgEmployee {
  if (tree.id === parentId) {
    return { ...tree, children: [...(tree.children ?? []), ...newNodes] };
  }
  return {
    ...tree,
    children: tree.children?.map(c => insertChildren(c, parentId, newNodes)),
  };
}

function patchNode(
  tree: OrgEmployee,
  nodeId: string,
  updates: Partial<OrgEmployee>,
): OrgEmployee {
  if (tree.id === nodeId) return { ...tree, ...updates };
  return { ...tree, children: tree.children?.map(c => patchNode(c, nodeId, updates)) };
}

function findParentOf(tree: OrgEmployee, nodeId: string): OrgEmployee | null {
  if (tree.children?.some(c => c.id === nodeId)) return tree;
  for (const child of tree.children ?? []) {
    const found = findParentOf(child, nodeId);
    if (found) return found;
  }
  return null;
}

export function findNode(tree: OrgEmployee, nodeId: string): OrgEmployee | null {
  if (tree.id === nodeId) return tree;
  for (const c of tree.children ?? []) {
    const f = findNode(c, nodeId);
    if (f) return f;
  }
  return null;
}

function getDescendantIds(node: OrgEmployee): Set<string> {
  const ids = new Set<string>();
  const collect = (n: OrgEmployee) => {
    n.children?.forEach(c => { ids.add(c.id); collect(c); });
  };
  collect(node);
  return ids;
}

function collectConfiguredNodes(
  node: OrgEmployee,
  excludeIds: Set<string>,
  result: { value: string; label: string }[] = [],
): { value: string; label: string }[] {
  if (!excludeIds.has(node.id) && node.status !== 'empty') {
    const nameLabel = node.name
      ? `${node.name}${node.employeeId ? ` (${node.employeeId})` : ''}`
      : node.designation ?? 'Unnamed';
    const dept = node.departmentLabel ? ` — ${node.departmentLabel}` : '';
    result.push({ value: node.id, label: `${nameLabel}${dept}` });
  }
  node.children?.forEach(c => collectConfiguredNodes(c, excludeIds, result));
  return result;
}

/** Recursively sort children by grade descending (G9 → G1), then ungraded last. */
function sortTreeByGrade(node: OrgEmployee): OrgEmployee {
  if (!node.children || node.children.length === 0) return node;
  const sorted = [...node.children]
    .map(c => sortTreeByGrade(c))
    .sort((a, b) => {
      const ga = a.grade ? GRADE_ORDER[a.grade] : 0;
      const gb = b.grade ? GRADE_ORDER[b.grade] : 0;
      return gb - ga; // descending: higher grade first
    });
  return { ...node, children: sorted };
}

function filterTree(node: OrgEmployee, filters: OrgFilters): OrgEmployee | null {
  if (node.status === 'vacant' && !filters.showVacant) return null;
  if (node.status === 'separation' && !filters.showSeparation) return null;
  const filteredChildren = (node.children ?? [])
    .map(c => filterTree(c, filters))
    .filter((c): c is OrgEmployee => c !== null);
  const search = filters.search.toLowerCase();
  const matchesSearch =
    !search ||
    node.name?.toLowerCase().includes(search) ||
    node.designation?.toLowerCase().includes(search) ||
    node.departmentLabel?.toLowerCase().includes(search);
  if (!matchesSearch && filteredChildren.length === 0 && node.status !== 'empty') return null;
  return { ...node, children: filteredChildren };
}

function nodeDisplayName(node: OrgEmployee): string {
  if (node.name) return `${node.name}${node.employeeId ? ` (${node.employeeId})` : ''}`;
  if (node.designation) return node.designation;
  return 'This position';
}

// ─── Node factory ─────────────────────────────────────────────────────────────────────────────────

function buildNewNodes(values: NodeFormValues): OrgEmployee[] {
  const ts = Date.now();

  if (values.assignMode === 'employee' && values.employeeId) {
    const emp = MASTER_EMPLOYEES.find(e => e.id === values.employeeId);
    return [
      {
        id: `node-${ts}`,
        status: 'active',
        assignMode: 'employee',
        department: emp?.department,
        departmentLabel: emp ? DEPT_LABELS[emp.department] : undefined,
        designation: emp?.designation,
        grade: emp?.grade,
        employeeId: emp?.id,
        name: emp?.name,
      },
    ];
  }

  // Designation mode — one node per selected employee, or one vacant if none
  const empIds = values.employeeIds ?? [];
  if (empIds.length === 0) {
    return [
      {
        id: `node-${ts}`,
        status: 'vacant',
        assignMode: 'designation',
        department: values.department,
        departmentLabel: values.department ? DEPT_LABELS[values.department] : undefined,
        designation: values.designation,
      },
    ];
  }
  return empIds.map((empId, i) => {
    const emp = MASTER_EMPLOYEES.find(e => e.id === empId);
    return {
      id: `node-${ts + i}`,
      status: 'active' as const,
      assignMode: 'designation' as const,
      department: values.department,
      departmentLabel: values.department ? DEPT_LABELS[values.department] : undefined,
      designation: values.designation,
      grade: emp?.grade,
      employeeId: emp?.id,
      name: emp?.name,
    };
  });
}

function buildNodePatch(values: NodeFormValues): Partial<OrgEmployee> {
  if (values.assignMode === 'employee' && values.employeeId) {
    const emp = MASTER_EMPLOYEES.find(e => e.id === values.employeeId);
    return {
      status: 'active',
      assignMode: 'employee',
      department: emp?.department,
      departmentLabel: emp ? DEPT_LABELS[emp.department] : undefined,
      designation: emp?.designation,
      grade: emp?.grade,
      employeeId: emp?.id,
      name: emp?.name,
    };
  }
  const firstEmpId = values.employeeIds?.[0];
  const masterEmp = firstEmpId
    ? MASTER_EMPLOYEES.find(e => e.id === firstEmpId)
    : undefined;
  return {
    status: values.employeeIds?.length ? 'active' : 'vacant',
    assignMode: 'designation',
    department: values.department,
    departmentLabel: values.department ? DEPT_LABELS[values.department] : undefined,
    designation: values.designation,
    grade: masterEmp?.grade,
    employeeId: masterEmp?.id,
    name: masterEmp?.name,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────────────────────

export function useOrganogram() {
  const [rawTree, setRawTree] = useState<OrgEmployee>(loadSavedTree);

  // Persist tree to localStorage on every change so other pages can read it
  useEffect(() => {
    try {
      localStorage.setItem(
        ORG_TREE_STORAGE_KEY,
        JSON.stringify({ version: ORG_TREE_STORAGE_VERSION, tree: rawTree }),
      );
    } catch { /* ignore */ }
  }, [rawTree]);
  const [filters, setFiltersState] = useState<OrgFilters>(DEFAULT_FILTERS);
  const [formAnchor, setFormAnchor] = useState<NodeFormAnchor | null>(null);

  const employeeCount = useMemo(() => countActive(rawTree), [rawTree]);
  const vacantCount   = useMemo(() => countVacant(rawTree), [rawTree]);
  const visibleTree   = useMemo(() => {
    const filtered = filterTree(rawTree, filters);
    if (!filtered) return null;
    return filters.showGrade ? sortTreeByGrade(filtered) : filtered;
  }, [rawTree, filters]);

  const setFilters   = useCallback(
    (p: Partial<OrgFilters>) => setFiltersState(prev => ({ ...prev, ...p })),
    [],
  );
  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  /** "+" button — opens ADD form; blocked if parent is empty */
  const openAddForm = useCallback(
    (parentId: string, vx: number, vy: number) => {
      const parentNode = findNode(rawTree, parentId);
      if (!parentNode || parentNode.status === 'empty') return;
      setFormAnchor({
        mode: 'add',
        nodeId: parentId,
        parentName: nodeDisplayName(parentNode),
        viewportX: vx,
        viewportY: vy,
      });
    },
    [rawTree],
  );

  /** "✏" button — opens EDIT form */
  const openEditForm = useCallback(
    (nodeId: string, vx: number, vy: number) => {
      const parent = findParentOf(rawTree, nodeId);
      setFormAnchor({
        mode: 'edit',
        nodeId,
        parentName: parent ? nodeDisplayName(parent) : undefined,
        viewportX: vx,
        viewportY: vy,
      });
    },
    [rawTree],
  );

  const closeForm = useCallback(() => setFormAnchor(null), []);

  const saveForm = useCallback(
    (values: NodeFormValues) => {
      if (!formAnchor) return;
      if (formAnchor.mode === 'edit') {
        const patch = buildNodePatch(values);
        setRawTree(prev => patchNode(prev, formAnchor.nodeId, patch));
      } else {
        const targetId = values.reportingToNodeId ?? formAnchor.nodeId;
        const newNodes = buildNewNodes(values);
        setRawTree(prev => insertChildren(prev, targetId, newNodes));
      }
      setFormAnchor(null);
    },
    [formAnchor],
  );

  /** All configured nodes usable as "Reporting To", excluding node + its descendants */
  const getReportingToOptions = useCallback(
    (excludeNodeId?: string) => {
      const node = excludeNodeId ? findNode(rawTree, excludeNodeId) : null;
      const descIds = node ? getDescendantIds(node) : new Set<string>();
      const excludeIds = new Set<string>([
        ...(excludeNodeId ? [excludeNodeId] : []),
        ...descIds,
      ]);
      return collectConfiguredNodes(rawTree, excludeIds);
    },
    [rawTree],
  );

  /** Employees matching a specific dept + designation */
  const getDesignationEmployees = useCallback(
    (dept: string, designation: string) => {
      if (!dept || !designation) return [];
      return MASTER_EMPLOYEES
        .filter(e => e.department === dept && e.designation === designation)
        .map(e => ({ value: e.id, label: empLabel(e) }));
    },
    [],
  );

  const departmentOptions = useMemo(
    () => Object.entries(DEPT_LABELS).map(([value, label]) => ({ value, label })),
    [],
  );

  const getDesignationOptions = useCallback(
    (dept: string) =>
      !dept
        ? []
        : (DEPT_DESIGNATIONS[dept as DeptKey] ?? []).map(d => ({ value: d, label: d })),
    [],
  );

  const allEmployeeOptions = useMemo(
    () =>
      MASTER_EMPLOYEES.map(e => ({
        value: e.id,
        label: empLabel(e),
        department: e.department,
        designation: e.designation,
        grade: e.grade,
      })),
    [],
  );

  const canAddChild = useCallback(
    (nodeId: string) => {
      const node = findNode(rawTree, nodeId);
      return !!node && node.status !== 'empty';
    },
    [rawTree],
  );

  const getNode = useCallback(
    (nodeId: string) => findNode(rawTree, nodeId),
    [rawTree],
  );

  return {
    visibleTree,
    filters,
    formAnchor,
    employeeCount,
    vacantCount,
    departmentOptions,
    allEmployeeOptions,
    getDesignationOptions,
    getDesignationEmployees,
    getReportingToOptions,
    canAddChild,
    getNode,
    setFilters,
    resetFilters,
    openAddForm,
    openEditForm,
    closeForm,
    saveForm,
  };
}
