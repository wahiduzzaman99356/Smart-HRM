/**
 * OrgTreeCanvas
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the org-chart on a zoomable / pannable canvas.
 *
 * Layout algorithm (Reingold-Tilford inspired):
 *   1. Recursively compute the "subtree width" for every node.
 *   2. Position each node card so its centre is over the centre of its subtree.
 *   3. Generate SVG elbow connectors:
 *        parent-bottom → mid-y (vertical)
 *        first-child-centre → last-child-centre at mid-y (horizontal)
 *        each child-centre → child-top from mid-y (vertical)
 */

import { useMemo, useState, useRef, useCallback } from 'react';
import { Button, Tooltip } from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  ReloadOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import type { OrgEmployee, LayoutNode, GradeKey } from '../../types/organogram.types';
import { GRADE_COLORS } from '../../types/organogram.types';
import { OrgNode } from '../OrgNode/OrgNode';

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_W = 200;   // card width (px)
const NODE_H = 90;    // approximate card height (px)
const H_GAP = 48;     // horizontal gap between sibling subtrees
const V_GAP = 80;     // vertical gap between levels
const CANVAS_PAD = 60; // padding around the entire tree
const CONNECTOR_COLOR = '#d1d5db';
const CONNECTOR_WIDTH = 2;

// ─── Layout helpers ───────────────────────────────────────────────────────────

function subtreeWidth(node: OrgEmployee): number {
  if (!node.children || node.children.length === 0) return NODE_W;
  const childrenW = node.children.reduce(
    (sum, child, i) => sum + subtreeWidth(child) + (i > 0 ? H_GAP : 0),
    0,
  );
  return Math.max(NODE_W, childrenW);
}

function buildLayout(
  node: OrgEmployee,
  xOffset: number,
  level: number,
  gradeYMap?: Record<GradeKey, number>,
): LayoutNode {
  const sw = subtreeWidth(node);
  // Card left edge = centre of subtree − half card width
  const x = xOffset + sw / 2 - NODE_W / 2;
  // When gradeYMap provided, override y by grade; fall back to tree depth
  const y = gradeYMap && node.grade ? gradeYMap[node.grade] : level * (NODE_H + V_GAP);

  if (!node.children || node.children.length === 0) {
    return { id: node.id, x, y, subtreeW: sw, data: node, children: [] };
  }

  let childX = xOffset;
  const layoutChildren: LayoutNode[] = node.children.map(child => {
    const childLayout = buildLayout(child, childX, level + 1, gradeYMap);
    childX += subtreeWidth(child) + H_GAP;
    return childLayout;
  });

  return { id: node.id, x, y, subtreeW: sw, data: node, children: layoutChildren };
}

/** Flatten the layout tree into a plain list for rendering. */
function flattenLayout(node: LayoutNode, acc: LayoutNode[] = []): LayoutNode[] {
  acc.push(node);
  node.children.forEach(c => flattenLayout(c, acc));
  return acc;
}

interface Edge {
  key: string;
  d: string; // SVG path
}

/** Collect all SVG elbow-connector paths for the tree. */
function collectEdges(node: LayoutNode, pad: number, edges: Edge[] = []): Edge[] {
  if (node.children.length === 0) return edges;

  const parentCX = node.x + NODE_W / 2 + pad;
  const parentBottomY = node.y + NODE_H + pad;
  const midY = parentBottomY + V_GAP / 2;

  const firstChildCX = node.children[0].x + NODE_W / 2 + pad;
  const lastChildCX = node.children[node.children.length - 1].x + NODE_W / 2 + pad;

  // Vertical from parent bottom → midY
  edges.push({
    key: `vdown-${node.id}`,
    d: `M ${parentCX} ${parentBottomY} L ${parentCX} ${midY}`,
  });

  // Horizontal across all child centres at midY (only when more than 1 child)
  if (node.children.length > 1) {
    edges.push({
      key: `h-${node.id}`,
      d: `M ${firstChildCX} ${midY} L ${lastChildCX} ${midY}`,
    });
  }

  // Vertical from midY → each child top
  node.children.forEach(child => {
    const childCX = child.x + NODE_W / 2 + pad;
    const childTopY = child.y + pad;
    edges.push({
      key: `vup-${child.id}`,
      d: `M ${childCX} ${midY} L ${childCX} ${childTopY}`,
    });
    collectEdges(child, pad, edges);
  });

  return edges;
}

// ── Grade-based layout constants ─────────────────────────────────────────────
const GRADE_LEVELS: GradeKey[] = ['G9', 'G8', 'G7', 'G6', 'G5', 'G4', 'G3', 'G2', 'G1'];
const GRADE_Y_MAP: Record<GradeKey, number> = {
  G9: 0 * (NODE_H + V_GAP),
  G8: 1 * (NODE_H + V_GAP),
  G7: 2 * (NODE_H + V_GAP),
  G6: 3 * (NODE_H + V_GAP),
  G5: 4 * (NODE_H + V_GAP),
  G4: 5 * (NODE_H + V_GAP),
  G3: 6 * (NODE_H + V_GAP),
  G2: 7 * (NODE_H + V_GAP),
  G1: 8 * (NODE_H + V_GAP),
};

// ── Transform state ───────────────────────────────────────────────────────────
interface Transform {
  x: number;
  y: number;
  scale: number;
}

const ZOOM_STEP = 0.15;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2;

// ─── Component ────────────────────────────────────────────────────────────────
interface OrgTreeCanvasProps {
  tree: OrgEmployee | null;
  darkMode: boolean;
  highlightDept: string;
  showGrade: boolean;
  canAddChild: (nodeId: string) => boolean;
  onAddNode:  (parentId: string, viewportX: number, viewportY: number) => void;
  onEditNode: (nodeId: string,   viewportX: number, viewportY: number) => void;
}

export function OrgTreeCanvas({ tree, darkMode, highlightDept, showGrade, canAddChild, onAddNode, onEditNode }: OrgTreeCanvasProps) {
  const [transform, setTransform] = useState<Transform>({ x: 40, y: 40, scale: 1 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Layout ───────────────────────────────────────────────────────────────────
  const { flatNodes, edges, canvasW, canvasH } = useMemo(() => {
    if (!tree) return { flatNodes: [], edges: [], canvasW: 0, canvasH: 0 };

    const gradeYMap = showGrade ? GRADE_Y_MAP : undefined;
    const rootLayout = buildLayout(tree, 0, 0, gradeYMap);
    const flatNodes = flattenLayout(rootLayout);
    const edges = collectEdges(rootLayout, CANVAS_PAD);

    const maxY = flatNodes.reduce((m, n) => Math.max(m, n.y), 0);
    const canvasW = rootLayout.subtreeW + CANVAS_PAD * 2;
    // When grade mode is on, ensure canvas covers all 9 grade bands (G9→G1)
    const gradeMaxY = showGrade ? 8 * (NODE_H + V_GAP) : 0;
    const canvasH = Math.max(maxY, gradeMaxY) + NODE_H + CANVAS_PAD * 2;

    return { flatNodes, edges, canvasW, canvasH };
  }, [tree, showGrade]);

  // ── Pan handlers ─────────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const stopDrag = useCallback(() => { isDragging.current = false; }, []);

  // ── Zoom handlers ─────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setTransform(prev => ({
      ...prev,
      scale: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev.scale + delta)),
    }));
  }, []);

  const zoomIn  = () => setTransform(p => ({ ...p, scale: Math.min(ZOOM_MAX, p.scale + ZOOM_STEP) }));
  const zoomOut = () => setTransform(p => ({ ...p, scale: Math.max(ZOOM_MIN, p.scale - ZOOM_STEP) }));
  const resetView = () => setTransform({ x: 40, y: 40, scale: 1 });
  const fitView = () => {
    if (!containerRef.current || canvasW === 0) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const scaleX = (width - 80) / canvasW;
    const scaleY = (height - 80) / canvasH;
    const scale = Math.min(scaleX, scaleY, ZOOM_MAX);
    const x = (width - canvasW * scale) / 2;
    const y = (height - canvasH * scale) / 2;
    setTransform({ x, y, scale });
  };

  // ── Add-node click: convert canvas pos → viewport pos for form anchor ────────
  const handleAddClick = useCallback(
    (nodeId: string, e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      onAddNode(nodeId, rect.right + 12, rect.top);
    },
    [onAddNode],
  );

  // ── Edit-node click ───────────────────────────────────────────────────────────
  const handleEditClick = useCallback(
    (nodeId: string, e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      onEditNode(nodeId, rect.right + 12, rect.top);
    },
    [onEditNode],
  );

  // ── Styles ───────────────────────────────────────────────────────────────────
  const canvasBg = darkMode ? '#111827' : '#f9fafb';

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflow: 'hidden',
        background: canvasBg,
        position: 'relative',
        cursor: isDragging.current ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onWheel={handleWheel}
    >
      {/* ── Transformable content ────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          transformOrigin: '0 0',
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          width: canvasW,
          height: canvasH,
        }}
      >
        {/* ── Grade band rows (only when showGrade is on) ──────────────────── */}
        {showGrade && GRADE_LEVELS.map((grade, i) => {
          const gc   = GRADE_COLORS[grade];
          const bandY = i * (NODE_H + V_GAP) + CANVAS_PAD;
          const bandH = NODE_H + V_GAP;
          const hasNodes = flatNodes.some(n => n.data.grade === grade);
          return (
            <div
              key={grade}
              style={{
                position: 'absolute',
                left: 0,
                top: bandY,
                width: canvasW,
                height: bandH,
                background: hasNodes
                  ? darkMode ? `${gc.bg}14` : `${gc.bg}88`
                  : 'transparent',
                borderTop: `1px solid ${darkMode ? '#1f2937' : `${gc.border}55`}`,
                pointerEvents: 'none',
              }}
            >
              {/* Grade badge on left (inside the CANVAS_PAD area) */}
              <div style={{
                position: 'absolute',
                left: 8,
                top: (bandH - 22) / 2,
                background: hasNodes ? gc.bg : darkMode ? '#1f2937' : '#f3f4f6',
                border: `1px solid ${gc.border}`,
                color: hasNodes ? gc.text : darkMode ? '#4b5563' : '#9ca3af',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                lineHeight: '18px',
                letterSpacing: 0.5,
                whiteSpace: 'nowrap',
              }}>
                {grade}
              </div>
            </div>
          );
        })}

        {/* SVG connector lines */}
        <svg
          style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
          width={canvasW}
          height={canvasH}
        >
          {edges.map(edge => (
            <path
              key={edge.key}
              d={edge.d}
              fill="none"
              stroke={darkMode ? '#374151' : CONNECTOR_COLOR}
              strokeWidth={CONNECTOR_WIDTH}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Node cards */}
        {flatNodes.map(ln => (
          <div
            key={ln.id}
            style={{
              position: 'absolute',
              left: ln.x + CANVAS_PAD,
              top: ln.y + CANVAS_PAD,
            }}
          >
            <OrgNode
                data={ln.data}
                highlightDept={highlightDept}
                canAddChild={canAddChild(ln.data.id)}
                showGrade={showGrade}
                onAddClick={handleAddClick}
                onEditClick={handleEditClick}
              />
          </div>
        ))}
      </div>

      {/* ── Zoom controls (fixed top-right, not scaled) ──────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: 4,
        }}
      >
        {[
          { icon: <PlusOutlined />, onClick: zoomIn,    tip: 'Zoom in' },
          { icon: <ReloadOutlined />, onClick: resetView, tip: 'Reset view' },
          { icon: <MinusOutlined />, onClick: zoomOut,   tip: 'Zoom out' },
          { icon: <FullscreenOutlined />, onClick: fitView, tip: 'Fit to screen' },
        ].map(({ icon, onClick, tip }) => (
          <Tooltip key={tip} title={tip} placement="left">
            <Button
              type="text"
              size="small"
              icon={icon}
              onClick={onClick}
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </Tooltip>
        ))}
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────────── */}
      {!tree && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: 14,
          }}
        >
          No employees match the current filters.
        </div>
      )}
    </div>
  );
}
