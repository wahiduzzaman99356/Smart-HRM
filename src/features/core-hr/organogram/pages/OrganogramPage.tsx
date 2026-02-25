import { useOrganogram } from '../hooks/useOrganogram';
import { OrgSidebar } from '../components/OrgSidebar/OrgSidebar';
import { OrgTreeCanvas } from '../components/OrgTreeCanvas/OrgTreeCanvas';
import { EditNodeForm } from '../components/EditNodeForm/EditNodeForm';

/**
 * OrganogramPage
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout:  [OrgSidebar 260px] | [OrgTreeCanvas flex-1]
 *
 * Interaction model:
 *   • "✏" on any node → openEditForm  → EditNodeForm (edit mode)
 *   • "+" on configured node → openAddForm → EditNodeForm (add mode)
 *   • "+" on empty node → blocked (openAddForm returns early)
 */
export default function OrganogramPage() {
  const {
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
    setFilters,
    resetFilters,
    openAddForm,
    openEditForm,
    closeForm,
    saveForm,
  } = useOrganogram();

  // Compute "Reporting To" options each time the form opens.
  // For add-mode: exclude nothing (any configured node is valid parent).
  // For edit-mode: exclude the node itself + its descendants.
  const reportingToOptions = formAnchor
    ? getReportingToOptions(formAnchor.mode === 'edit' ? formAnchor.nodeId : undefined)
    : [];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Left sidebar ────────────────────────────────────────────────── */}
      <OrgSidebar
        employeeCount={employeeCount}
        vacantCount={vacantCount}
        filters={filters}
        departments={departmentOptions}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      {/* ── Main zoomable/pannable canvas ───────────────────────────────── */}
      <OrgTreeCanvas
        tree={visibleTree}
        darkMode={filters.darkMode}
        highlightDept={filters.department}
        showGrade={filters.showGrade}
        canAddChild={canAddChild}
        onAddNode={openAddForm}
        onEditNode={openEditForm}
      />

      {/* ── Floating assign / configure form ────────────────────────────── */}
      {formAnchor && (
        <EditNodeForm
          anchor={formAnchor}
          departmentOptions={departmentOptions}
          getDesignationOptions={getDesignationOptions}
          getDesignationEmployees={getDesignationEmployees}
          allEmployeeOptions={allEmployeeOptions}
          reportingToOptions={reportingToOptions}
          onSubmit={saveForm}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
