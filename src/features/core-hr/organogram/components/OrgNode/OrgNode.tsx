import type { MouseEvent, CSSProperties } from 'react';
import { Tag, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  UserOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import type { OrgEmployee } from '../../types/organogram.types';
import { DEPT_THEME, GRADE_COLORS } from '../../types/organogram.types';

interface OrgNodeProps {
  data: OrgEmployee;
  highlightDept: string;
  canAddChild: boolean;
  showGrade: boolean;
  onAddClick:  (id: string, e: MouseEvent<HTMLButtonElement>) => void;
  onEditClick: (id: string, e: MouseEvent<HTMLButtonElement>) => void;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

export function OrgNode({
  data,
  highlightDept,
  canAddChild,
  showGrade,
  onAddClick,
  onEditClick,
}: OrgNodeProps) {
  const theme  = data.department ? DEPT_THEME[data.department] : null;
  const empty  = data.status === 'empty';
  const vacant = data.status === 'vacant';
  const sep    = data.status === 'separation';
  const active = data.status === 'active';

  const isHighlighted = !!highlightDept && data.department === highlightDept;
  const isDimmed      = !!highlightDept && !!data.department && !isHighlighted;

  const btnColor = theme?.border ?? '#64748b';

  // ── Card style ──────────────────────────────────────────────────────────────
  const card: CSSProperties = {
    width: 220,
    borderRadius: 12,
    position: 'relative',
    userSelect: 'none',
    transition: 'box-shadow 0.2s, opacity 0.2s, filter 0.2s',
    ...(empty
      ? {
          border: '2px dashed #cbd5e1',
          background: '#f8fafc',
          boxShadow: 'none',
        }
      : sep
      ? {
          border: `1px solid #fca5a544`,
          borderLeft: `4px solid #ef4444`,
          background: '#fff5f5',
          boxShadow: isHighlighted
            ? '0 0 0 2.5px #ef444455, 0 4px 14px rgba(0,0,0,0.1)'
            : '0 1px 4px rgba(239,68,68,0.12)',
        }
      : {
          border: `1px solid ${theme?.border ?? '#e2e8f0'}22`,
          borderLeft: `4px solid ${theme?.border ?? '#e2e8f0'}`,
          background: isHighlighted && theme ? theme.lightBg : '#ffffff',
          boxShadow: isHighlighted
            ? `0 0 0 2.5px ${theme?.border}55, 0 4px 14px rgba(0,0,0,0.1)`
            : '0 1px 4px rgba(0,0,0,0.07)',
        }),
    ...(isDimmed ? { opacity: 0.28, filter: 'grayscale(60%)' } : {}),
  };

  // ── Avatar ──────────────────────────────────────────────────────────────────
  const avatarSize = 36;
  const avatarBase: CSSProperties = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const avatar = (() => {
    if (empty) {
      return (
        <div style={{ ...avatarBase, background: '#e2e8f0' }}>
          <UserOutlined style={{ fontSize: 16, color: '#94a3b8' }} />
        </div>
      );
    }
    if (vacant) {
      return (
        <div
          style={{
            ...avatarBase,
            background: `${theme?.avatarBg}18`,
            border: `2px dashed ${theme?.avatarBg}60`,
          }}
        >
          <UserAddOutlined style={{ fontSize: 14, color: theme?.avatarBg ?? '#64748b' }} />
        </div>
      );
    }
    const txt = data.name ? initials(data.name) : (data.designation?.[0]?.toUpperCase() ?? '?');
    return (
      <div
        style={{
          ...avatarBase,
          background: sep ? '#fca5a5' : theme?.avatarBg ?? '#94a3b8',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.5,
        }}
      >
        {txt}
      </div>
    );
  })();

  // ── Text ────────────────────────────────────────────────────────────────────
  const primaryLine = empty
    ? 'Unassigned Position'
    : data.name ?? data.designation ?? '—';

  const secondaryLine = empty
    ? 'Click ✏ to configure'
    : data.name
    ? data.designation        // show title under the name
    : data.departmentLabel;   // show dept if no name (vacant)

  const empIdLine = !empty && data.employeeId ? `(${data.employeeId})` : null;

  return (
    <div style={card}>
      {/* ── "+" add child button ─────────────────────────────────────────── */}
      {canAddChild && (
        <Tooltip title="Add direct report" placement="top">
          <button
            onClick={e => onAddClick(data.id, e)}
            onMouseEnter={e => { (e.currentTarget.style.transform = 'scale(1.2)'); }}
            onMouseLeave={e => { (e.currentTarget.style.transform = 'scale(1)'); }}
            style={{
              position: 'absolute',
              top: -11,
              right: -11,
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: `2px solid ${btnColor}`,
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontSize: 10,
              color: btnColor,
              zIndex: 2,
              boxShadow: `0 2px 8px ${btnColor}30`,
              transition: 'transform 0.15s',
            }}
          >
            <PlusOutlined />
          </button>
        </Tooltip>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '11px 12px 8px 12px',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        {avatar}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: empty ? '#94a3b8' : sep ? '#b91c1c' : '#1e293b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.4,
            }}
          >
            {primaryLine}
          </div>
          {empIdLine && (
            <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.3, marginTop: 1 }}>
              {empIdLine}
            </div>
          )}
          {secondaryLine && (
            <div
              style={{
                fontSize: 11,
                color: empty ? '#cbd5e1' : '#64748b',
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.3,
              }}
            >
              {secondaryLine}
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div
        style={{
          height: 1,
          background: empty ? '#f1f5f9' : sep ? '#fca5a520' : `${theme?.border ?? '#e2e8f0'}18`,
        }}
      />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '5px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 32,
        }}
      >
        {/* Tags area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {!empty && data.departmentLabel && (
            <Tag
              style={{
                fontSize: 10,
                lineHeight: '16px',
                padding: '0 6px',
                margin: 0,
                background: `${theme?.avatarBg}12`,
                borderColor: `${theme?.avatarBg}28`,
                color: theme?.avatarBg ?? '#64748b',
                borderRadius: 4,
                maxWidth: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {data.departmentLabel}
            </Tag>
          )}
          {showGrade && !empty && data.grade && (() => {
            const gc = GRADE_COLORS[data.grade];
            return (
              <Tooltip title={`Grade ${data.grade.slice(1)}`} placement="top">
                <Tag
                  style={{
                    fontSize: 10,
                    lineHeight: '16px',
                    padding: '0 6px',
                    margin: 0,
                    background: gc.bg,
                    borderColor: gc.border,
                    color: gc.text,
                    borderRadius: 4,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    cursor: 'default',
                  }}
                >
                  {data.grade}
                </Tag>
              </Tooltip>
            );
          })()}
          {vacant && (
            <Tag
              color="orange"
              style={{ fontSize: 10, lineHeight: '16px', padding: '0 5px', margin: 0, borderRadius: 4 }}
            >
              Hire
            </Tag>
          )}
          {sep && (
            <Tag
              color="error"
              style={{ fontSize: 10, lineHeight: '16px', padding: '0 5px', margin: 0, borderRadius: 4 }}
            >
              Separation
            </Tag>
          )}
        </div>

        {/* Edit button */}
        <Tooltip
          title={empty ? 'Assign employee' : 'Edit position'}
          placement="bottom"
        >
          <button
            onClick={e => onEditClick(data.id, e)}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${btnColor}28`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = empty ? '#eff6ff' : `${btnColor}10`;
            }}
            style={{
              border: 'none',
              background: empty ? '#eff6ff' : `${btnColor}10`,
              borderRadius: 7,
              cursor: 'pointer',
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: empty ? '#3b82f6' : btnColor,
              fontSize: 11,
              fontWeight: 600,
              transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <EditOutlined style={{ fontSize: 11 }} />
            {empty && <span>Configure</span>}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
