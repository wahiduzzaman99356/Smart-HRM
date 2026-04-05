import { useState } from 'react';
import { Button, Modal } from 'antd';
import {
  ArrowLeftOutlined,
  LeftOutlined,
  RightOutlined,
  LoginOutlined,
  LogoutOutlined,
  EnvironmentOutlined,
  PaperClipOutlined,
  TeamOutlined,
  CalendarOutlined,
  HomeOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {
  OutstationSetup,
  AttendanceRecord,
  AttendanceStatus,
  ATTENDANCE_STATUS_STYLE,
  OutstationPurpose,
} from '../types/outstation.types';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface Props {
  setups:        OutstationSetup[];               // all setups for this employee
  allAttendance: Record<string, AttendanceRecord[]>;
  onBack:        () => void;
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SummaryBadge({ status, count }: { status: AttendanceStatus; count: number }) {
  const st = ATTENDANCE_STATUS_STYLE[status];
  return (
    <div style={{ textAlign: 'center', padding: '6px 14px', borderRadius: 10, background: st.bg, border: `1.5px solid ${st.border}`, minWidth: 68 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: st.color, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 10, color: st.color, marginTop: 3, fontWeight: 600 }}>{status}</div>
    </div>
  );
}

// ─── Day Detail Modal ─────────────────────────────────────────────────────────
function DayDetailModal({ record, onClose }: { record: AttendanceRecord | null; onClose: () => void }) {
  if (!record) return null;
  const st = ATTENDANCE_STATUS_STYLE[record.status];
  return (
    <Modal
      open={Boolean(record)}
      onCancel={onClose}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CalendarOutlined style={{ color: 'var(--color-primary)' }} />
          <span>Attendance Details — {dayjs(record.date).format('DD MMMM YYYY')}</span>
        </div>
      }
      width={560}
      centered
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, marginTop: 8 }}>
        <span style={{ display: 'inline-block', padding: '6px 28px', borderRadius: 20, fontSize: 14, fontWeight: 700, color: st.color, background: st.bg, border: `2px solid ${st.border}` }}>
          {record.status}
        </span>
      </div>

      {/* Check-In */}
      <div style={{ background: 'var(--color-primary-tint)', border: '1.5px solid #99f6e4', borderRadius: 10, padding: '14px 18px', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <LoginOutlined /> Check-In
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Time</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{record.checkInTime ?? '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Coordinates</div>
            {record.checkInLat != null ? (
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <EnvironmentOutlined style={{ color: 'var(--color-primary)', fontSize: 12 }} />
                <span>{record.checkInLat.toFixed(5)}, {record.checkInLng!.toFixed(5)}</span>
              </div>
            ) : <span style={{ fontSize: 13, color: 'var(--color-text-disabled)' }}>—</span>}
          </div>
        </div>
      </div>

      {/* Check-Out */}
      <div style={{ background: 'var(--color-status-rejected-bg)', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '14px 18px', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <LogoutOutlined /> Check-Out
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Time</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{record.checkOutTime ?? '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Coordinates</div>
            {record.checkOutLat != null ? (
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <EnvironmentOutlined style={{ color: '#dc2626', fontSize: 12 }} />
                <span>{record.checkOutLat.toFixed(5)}, {record.checkOutLng!.toFixed(5)}</span>
              </div>
            ) : <span style={{ fontSize: 13, color: 'var(--color-text-disabled)' }}>—</span>}
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: 6 }}>Remarks</div>
        <div style={{ padding: '10px 14px', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-secondary)', minHeight: 44 }}>
          {record.remarks || <span style={{ color: 'var(--color-text-disabled)', fontStyle: 'italic' }}>No remarks</span>}
        </div>
      </div>

      {/* Proof */}
      <div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: 6 }}>Proof of Attendance</div>
        {record.proofFileName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-subtle)', fontSize: 13, color: 'var(--color-text-secondary)' }}>
              <PaperClipOutlined style={{ color: 'var(--color-primary)' }} />
              {record.proofFileName}
            </div>
            <Button type="link" style={{ padding: 0, fontSize: 13, color: 'var(--color-primary)' }}>View File</Button>
          </div>
        ) : (
          <div style={{ padding: '10px 14px', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-disabled)', fontStyle: 'italic' }}>
            No proof of attendance uploaded
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Single Calendar Section ──────────────────────────────────────────────────
interface CalendarSectionProps {
  purpose:    OutstationPurpose;
  setup:      OutstationSetup | null;
  records:    AttendanceRecord[];
  onDayClick: (record: AttendanceRecord) => void;
}

function CalendarSection({ purpose, setup, records, onDayClick }: CalendarSectionProps) {
  const isWfh = purpose === 'Work From Home';

  const defaultMonth = (): Dayjs => {
    if (!setup) return dayjs().startOf('month');
    if (setup.dateMode === 'specific' && setup.specificDates.length > 0)
      return dayjs(setup.specificDates[0]).startOf('month');
    if (setup.dateMode === 'date-range' && setup.dateRange)
      return dayjs(setup.dateRange[0]).startOf('month');
    return dayjs().startOf('month');
  };

  const [currentMonth, setCurrentMonth] = useState<Dayjs>(defaultMonth);

  const attendanceMap = new Map<string, AttendanceRecord>(records.map(r => [r.date, r]));

  const isScheduled = (dateStr: string): boolean => {
    if (!setup) return false;
    if (setup.dateMode === 'specific') return setup.specificDates.includes(dateStr);
    if (setup.dateMode === 'date-range' && setup.dateRange) {
      const d = dayjs(dateStr);
      return d.isSameOrAfter(setup.dateRange[0]) && d.isSameOrBefore(setup.dateRange[1]);
    }
    return false;
  };

  const daysInMonth    = currentMonth.daysInMonth();
  const firstDayOffset = (currentMonth.startOf('month').day() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const toDateStr = (day: number) => currentMonth.date(day).format('YYYY-MM-DD');
  const todayStr  = dayjs().format('YYYY-MM-DD');

  const monthRecords = records.filter(r => r.date.startsWith(currentMonth.format('YYYY-MM')));
  const summary: Record<AttendanceStatus, number> = {
    Present:       monthRecords.filter(r => r.status === 'Present').length,
    Late:          monthRecords.filter(r => r.status === 'Late').length,
    'Early Leave': monthRecords.filter(r => r.status === 'Early Leave').length,
    Absent:        monthRecords.filter(r => r.status === 'Absent').length,
  };

  // Theme colors
  const accentColor  = isWfh ? '#d97706' : 'var(--color-primary)';
  const accentLight  = isWfh ? 'var(--color-status-pending-bg)' : 'var(--color-primary-tint)';
  const accentBorder = isWfh ? 'rgba(252, 211, 77, 0.45)' : '#99f6e4';

  return (
    <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
      {/* Section header */}
      <div style={{
        padding: '14px 20px',
        background: isWfh ? 'linear-gradient(90deg, #fffbeb 0%, #fff 100%)' : 'linear-gradient(90deg, #f0fdfa 0%, #fff 100%)',
        borderBottom: `2px solid ${accentBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: accentLight, border: `1.5px solid ${accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, fontSize: 17 }}>
            {isWfh ? <HomeOutlined /> : <GlobalOutlined />}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{purpose}</div>
            {setup ? (
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                {setup.dateMode === 'specific'
                  ? `${setup.specificDates.length} scheduled date(s)`
                  : setup.dateRange
                    ? `${dayjs(setup.dateRange[0]).format('DD MMM')} – ${dayjs(setup.dateRange[1]).format('DD MMM YYYY')}`
                    : ''}
                {' · '}{setup.shiftLabel}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', fontStyle: 'italic', marginTop: 2 }}>No schedule configured</div>
            )}
          </div>
        </div>

        {/* Summary badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(Object.keys(summary) as AttendanceStatus[]).map(s => (
            <SummaryBadge key={s} status={s} count={summary[s]} />
          ))}
        </div>
      </div>

      {/* Month Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)' }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => setCurrentMonth(m => m.subtract(1, 'month'))}
          style={{ borderRadius: 8 }}
        />
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {currentMonth.format('MMMM YYYY')}
        </div>
        <Button
          type="text"
          icon={<RightOutlined />}
          onClick={() => setCurrentMonth(m => m.add(1, 'month'))}
          style={{ borderRadius: 8 }}
        />
      </div>

      {/* Week-day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
        {WEEK_DAYS.map(d => (
          <div key={d} style={{ padding: '7px 0', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`empty-${idx}`}
                style={{
                  minHeight: 100,
                  background: 'var(--color-bg-subtle)',
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--color-border)' : 'none',
                  borderBottom: '1px solid var(--color-border)',
                }}
              />
            );
          }

          const dateStr   = toDateStr(day);
          const isToday   = dateStr === todayStr;
          const scheduled = isScheduled(dateStr);
          const record    = attendanceMap.get(dateStr);
          const isWeekend = idx % 7 >= 5;
          const clickable = scheduled && !!record;
          const baseBg    = isToday ? accentLight : isWeekend ? 'var(--color-bg-subtle)' : 'var(--color-bg-surface)';

          return (
            <div
              key={dateStr}
              onClick={() => clickable && onDayClick(record!)}
              style={{
                minHeight: 100,
                padding: '7px 9px',
                borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--color-border)' : 'none',
                borderBottom: '1px solid var(--color-border)',
                cursor: clickable ? 'pointer' : 'default',
                background: baseBg,
                transition: 'background 0.12s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (clickable) (e.currentTarget as HTMLDivElement).style.background = accentLight; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = baseBg; }}
            >
              {/* Date number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{
                  fontSize: 13, fontWeight: isToday ? 800 : 500,
                  color: isToday ? accentColor : 'var(--color-text-secondary)',
                  width: 24, height: 24, borderRadius: 12,
                  background: isToday ? accentLight : 'transparent',
                  border: isToday ? `1.5px solid ${accentBorder}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {day}
                </span>

                {/* Status badge */}
                {record && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 10,
                    color:       ATTENDANCE_STATUS_STYLE[record.status].color,
                    background:  ATTENDANCE_STATUS_STYLE[record.status].bg,
                    border:     `1px solid ${ATTENDANCE_STATUS_STYLE[record.status].border}`,
                    whiteSpace:  'nowrap',
                  }}>
                    {record.status}
                  </span>
                )}

                {scheduled && !record && (
                  <span style={{ fontSize: 9, color: 'var(--color-text-disabled)', fontStyle: 'italic' }}>Scheduled</span>
                )}
              </div>

              {/* Check-in / Check-out times */}
              {record && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {record.checkInTime ? (
                    <div style={{ fontSize: 11, color: '#059669', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                      <LoginOutlined style={{ fontSize: 10 }} />
                      {record.checkInTime}
                    </div>
                  ) : null}
                  {record.checkOutTime ? (
                    <div style={{ fontSize: 11, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                      <LogoutOutlined style={{ fontSize: 10 }} />
                      {record.checkOutTime}
                    </div>
                  ) : null}
                  {!record.checkInTime && !record.checkOutTime && (
                    <div style={{ fontSize: 10, color: 'var(--color-text-disabled)', fontStyle: 'italic' }}>No check-in</div>
                  )}
                </div>
              )}

              {scheduled && !record && (
                <div style={{ marginTop: 4, fontSize: 10, color: 'var(--color-text-disabled)', fontStyle: 'italic' }}>No data</div>
              )}

              {/* Proof indicator dot */}
              {record?.proofFileName && (
                <div style={{
                  position: 'absolute', bottom: 5, right: 7,
                  width: 7, height: 7, borderRadius: 4,
                  background: accentColor,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', padding: '10px 20px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)' }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Legend:</span>
        {(Object.keys(ATTENDANCE_STATUS_STYLE) as AttendanceStatus[]).map(s => {
          const st = ATTENDANCE_STATUS_STYLE[s];
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: st.bg, border: `1.5px solid ${st.border}`, display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: st.color, fontWeight: 600 }}>{s}</span>
            </div>
          );
        })}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: accentColor, display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Proof attached</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginLeft: 4, fontStyle: 'italic' }}>Click a date to view details</span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function OutstationHistoryView({ setups, allAttendance, onBack }: Props) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const firstSetup = setups[0];
  if (!firstSetup) return null;

  const purposes: OutstationPurpose[] = ['Work From Home', 'Others Concern Visit'];

  // Collect all attendance records across all setups
  const allRecords = setups.flatMap(s => allAttendance[s.id] ?? []);

  // Overall attendance summary across all purposes
  const overallSummary: Record<AttendanceStatus, number> = {
    Present:       allRecords.filter(r => r.status === 'Present').length,
    Late:          allRecords.filter(r => r.status === 'Late').length,
    'Early Leave': allRecords.filter(r => r.status === 'Early Leave').length,
    Absent:        allRecords.filter(r => r.status === 'Absent').length,
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--color-bg-subtle)', padding: '20px 24px' }}>
      {/* Back */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        style={{ padding: 0, marginBottom: 16, color: 'var(--color-primary)', fontWeight: 500, fontSize: 13 }}
        onClick={onBack}
      >
        Back to list
      </Button>

      {/* Employee Header */}
      <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '16px 22px', marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 52, height: 52, borderRadius: 26, background: 'linear-gradient(135deg, #e0f2f1 0%, #ccfbf1 100%)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: '2px solid #99f6e4' }}>
          <TeamOutlined />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{firstSetup.employeeName}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 3 }}>ID: {firstSetup.employeeId}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            {setups.length} active setup{setups.length !== 1 ? 's' : ''}
            {' · '}
            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              {setups.map(s => s.purpose).join(' & ')}
            </span>
          </div>
        </div>
        {/* Overall summary */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(Object.keys(overallSummary) as AttendanceStatus[]).map(s => (
            <SummaryBadge key={s} status={s} count={overallSummary[s]} />
          ))}
        </div>
      </div>

      {/* Two purpose calendar sections */}
      {purposes.map(purpose => {
        const setup   = setups.find(s => s.purpose === purpose) ?? null;
        const records = setup ? (allAttendance[setup.id] ?? []) : [];
        return (
          <CalendarSection
            key={purpose}
            purpose={purpose}
            setup={setup}
            records={records}
            onDayClick={setSelectedRecord}
          />
        );
      })}

      {/* Day Detail Modal */}
      <DayDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}
