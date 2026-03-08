import { useEffect, useMemo, useState } from 'react';
import { ClockCircleOutlined, CalendarOutlined, SwapOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Segmented, Tag } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { CURRENT_EMPLOYEE_SHIFT, AVAILABLE_SHIFTS } from '../types/shift-change.types';

type ViewMode = 'Week' | 'Month';
type ShiftStatus = 'Working' | 'Off' | 'Leave';

type ShiftDayEntry = {
  date: string;
  shiftName: string;
  timeRange: string;
  status: ShiftStatus;
};

const SHIFT_BY_ID = Object.fromEntries(AVAILABLE_SHIFTS.map(s => [s.id, s]));
const SHIFT_ROTATION = ['GEN_A', 'GEN_B', 'MORNING', 'EVENING', 'NIGHT'];

const WEEK_HEADERS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function startOfWeekMonday(date: Dayjs): Dayjs {
  const day = date.day();
  const diff = (day + 6) % 7;
  return date.subtract(diff, 'day').startOf('day');
}

function buildEntry(date: Dayjs): ShiftDayEntry {
  const key = date.format('YYYY-MM-DD');
  const weekday = date.day();

  // Weekend as OFF
  if (weekday === 0 || weekday === 6) {
    return {
      date: key,
      shiftName: 'Off',
      timeRange: '--',
      status: 'Off',
    };
  }

  // Deterministic mock exceptions for richer monthly visualization
  if (date.date() % 13 === 0) {
    return {
      date: key,
      shiftName: 'Annual Leave',
      timeRange: '--',
      status: 'Leave',
    };
  }

  const rotationIndex = date.date() % SHIFT_ROTATION.length;
  const shiftId = SHIFT_ROTATION[rotationIndex];
  const shift = SHIFT_BY_ID[shiftId] ?? CURRENT_EMPLOYEE_SHIFT;

  return {
    date: key,
    shiftName: shift.name,
    timeRange: shift.timeRange,
    status: 'Working',
  };
}

export function MyShiftTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('Week');
  const [monthCursor, setMonthCursor] = useState<Dayjs>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [weekCursor, setWeekCursor] = useState<Dayjs>(startOfWeekMonday(dayjs()));

  const scheduleMap = useMemo(() => {
    const start = monthCursor.startOf('month').subtract(1, 'month').startOf('month');
    const end = monthCursor.endOf('month').add(1, 'month').endOf('month');
    const map: Record<string, ShiftDayEntry> = {};

    let cursor = start;
    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
      const entry = buildEntry(cursor);
      map[entry.date] = entry;
      cursor = cursor.add(1, 'day');
    }
    return map;
  }, [monthCursor]);

  const weekEntries = useMemo(() => {
    const start = startOfWeekMonday(weekCursor);
    return Array.from({ length: 7 }).map((_, idx) => {
      const date = start.add(idx, 'day');
      const key = date.format('YYYY-MM-DD');
      return scheduleMap[key] ?? buildEntry(date);
    });
  }, [weekCursor, scheduleMap]);

  const weekRangeLabel = useMemo(() => {
    const start = startOfWeekMonday(weekCursor);
    const end = start.add(6, 'day');
    if (start.month() === end.month()) {
      return `${start.format('DD')} - ${end.format('DD MMM YYYY')}`;
    }
    if (start.year() === end.year()) {
      return `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`;
    }
    return `${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`;
  }, [weekCursor]);

  useEffect(() => {
    if (viewMode === 'Week') {
      setWeekCursor(startOfWeekMonday(selectedDate));
    }
  }, [viewMode, selectedDate]);

  const monthCells = useMemo(() => {
    const start = monthCursor.startOf('month').startOf('week');
    return Array.from({ length: 42 }).map((_, idx) => {
      const date = start.add(idx, 'day');
      const key = date.format('YYYY-MM-DD');
      return {
        date,
        isCurrentMonth: date.month() === monthCursor.month(),
        entry: scheduleMap[key] ?? buildEntry(date),
      };
    });
  }, [monthCursor, scheduleMap]);

  const weekCards = weekEntries.map(entry => {
    const dayDate = dayjs(entry.date);
    const isToday = dayDate.isSame(dayjs(), 'day');
    const isSelected = dayDate.isSame(selectedDate, 'day');
    return (
      <div
        key={entry.date}
        style={{
          padding: '14px 10px',
          textAlign: 'center',
          borderRight: '1px solid #f0f0f0',
          background: isSelected ? '#e6fffb' : isToday ? '#f0fdfa' : '#fff',
          borderBottom: isSelected || isToday ? '3px solid #0d9488' : '3px solid transparent',
          cursor: 'pointer',
        }}
        onClick={() => setSelectedDate(dayDate)}
      >
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{dayDate.format('ddd')}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: isToday ? '#0d9488' : '#374151', marginBottom: 6 }}>
          {dayDate.format('DD MMM')}
        </div>
        <div style={{ fontSize: 11, color: entry.status === 'Leave' ? '#b91c1c' : '#0d9488', fontWeight: 600, marginTop: 6 }}>{entry.shiftName}</div>
        <div style={{ fontSize: 10, color: '#6b7280' }}>{entry.timeRange}</div>
      </div>
    );
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1160, margin: '0 auto' }}>

      {/* Current Shift Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
          borderRadius: 14,
          padding: '28px 32px',
          color: '#fff',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ClockCircleOutlined style={{ fontSize: 30, color: '#fff' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Current Shift
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>
            {CURRENT_EMPLOYEE_SHIFT.name}
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>{CURRENT_EMPLOYEE_SHIFT.timeRange}</div>
          {CURRENT_EMPLOYEE_SHIFT.policy && (
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{CURRENT_EMPLOYEE_SHIFT.policy}</div>
          )}
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Employee ID</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>TN-99318</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Business Analyst</div>
        </div>
      </div>

      {/* Schedule Controls */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined style={{ color: '#0d9488', fontSize: 16 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Shift Schedule</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Segmented<ViewMode>
              options={['Week', 'Month']}
              value={viewMode}
              onChange={v => setViewMode(v)}
            />
            {viewMode === 'Week' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Button
                  size="small"
                  icon={<LeftOutlined />}
                  onClick={() => {
                    setWeekCursor(prev => prev.subtract(7, 'day'));
                    setSelectedDate(prev => prev.subtract(7, 'day'));
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', minWidth: 145, textAlign: 'center' }}>
                  {weekRangeLabel}
                </span>
                <Button
                  size="small"
                  onClick={() => {
                    const today = dayjs();
                    setSelectedDate(today);
                    setWeekCursor(startOfWeekMonday(today));
                  }}
                >
                  This Week
                </Button>
                <Button
                  size="small"
                  icon={<RightOutlined />}
                  onClick={() => {
                    setWeekCursor(prev => prev.add(7, 'day'));
                    setSelectedDate(prev => prev.add(7, 'day'));
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {viewMode === 'Week' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', gap: 0, overflowX: 'auto' }}>
            {weekCards}
          </div>
        ) : (
          <div style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Button
                size="small"
                icon={<LeftOutlined />}
                onClick={() => {
                  const next = monthCursor.subtract(1, 'month');
                  setMonthCursor(next);
                }}
              />
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', minWidth: 120 }}>
                {monthCursor.format('MMMM')}
              </div>
              <Button
                size="small"
                icon={<RightOutlined />}
                onClick={() => {
                  const next = monthCursor.add(1, 'month');
                  setMonthCursor(next);
                }}
              />
            </div>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', borderBottom: '1px solid #e5e7eb' }}>
                {WEEK_HEADERS.map(label => (
                  <div key={label} style={{ padding: '8px 10px', fontSize: 11, color: '#6b7280', fontWeight: 600, background: '#f8fafc', textAlign: 'center' }}>
                    {label}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))' }}>
                {monthCells.map(cell => {
                  const isSelected = cell.date.isSame(selectedDate, 'day');
                  const isToday = cell.date.isSame(dayjs(), 'day');
                  const textColor = cell.isCurrentMonth ? '#111827' : '#cbd5e1';
                  return (
                    <div
                      key={cell.date.format('YYYY-MM-DD')}
                      onClick={() => setSelectedDate(cell.date)}
                      style={{
                        minHeight: 74,
                        borderRight: '1px solid #eef2f7',
                        borderBottom: '1px solid #eef2f7',
                        padding: '6px 8px',
                        background: isSelected ? '#e6fffb' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: isSelected ? 700 : 500,
                          color: isToday ? '#dc2626' : textColor,
                        }}>
                          {cell.date.format('D')}
                        </span>
                      </div>
                      <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: cell.entry.status === 'Leave' ? '#b91c1c' : '#0f766e', lineHeight: 1.25 }}>
                        {cell.entry.shiftName}
                      </div>
                      <div style={{ marginTop: 1, fontSize: 10, color: '#64748b', lineHeight: 1.2 }}>
                        {cell.entry.timeRange}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Available Shifts */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <SwapOutlined style={{ color: '#0d9488', fontSize: 16 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Available Shift Types</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 20 }}>
          {AVAILABLE_SHIFTS.map(s => (
            <div
              key={s.id}
              style={{
                border: s.id === CURRENT_EMPLOYEE_SHIFT.id ? '2px solid #0d9488' : '1px solid #e5e7eb',
                borderRadius: 10,
                padding: '14px 16px',
                background: s.id === CURRENT_EMPLOYEE_SHIFT.id ? '#f0fdfa' : '#fafafa',
                position: 'relative',
              }}
            >
              {s.id === CURRENT_EMPLOYEE_SHIFT.id && (
                <Tag color="teal" style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, background: '#0d9488', color: '#fff', border: 'none' }}>
                  Active
                </Tag>
              )}
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: '#0d9488', fontWeight: 500 }}>{s.timeRange}</div>
              {s.policy && (
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, lineHeight: 1.5 }}>{s.policy}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
