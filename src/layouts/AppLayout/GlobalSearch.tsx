/**
 * GlobalSearch.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Persistent header search box. Searches all nav modules and sub-pages,
 * groups results by module, and navigates to the selected route.
 */

import { useState, useMemo, useCallback } from 'react';
import { AutoComplete, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { NAV_MODULES } from './navConfig';
import type { NavSubItem } from './navConfig';

interface SearchPage {
  route: string;
  label: string;
  module: string;
  group: string;
}

function flattenSubItems(items: NavSubItem[], module: string, groupTrail: string[] = []): SearchPage[] {
  return items.flatMap(item => {
    if (item.children) return flattenSubItems(item.children, module, [...groupTrail, item.label]);
    if (!item.key.startsWith('/')) return [];
    return [{
      route: item.key,
      label: item.label,
      module,
      group: groupTrail.join(' / '),
    }];
  });
}

const ALL_PAGES = NAV_MODULES.flatMap(mod => flattenSubItems(mod.children, mod.label));

// ─── Component ────────────────────────────────────────────────────────────────
export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Build grouped AutoComplete options whenever the query changes
  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches = ALL_PAGES.filter(
      p =>
        p.label.toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q) ||
        p.group.toLowerCase().includes(q),
    );

    // Group matches by module name
    const grouped = new Map<string, typeof matches>();
    for (const m of matches) {
      if (!grouped.has(m.module)) grouped.set(m.module, []);
      grouped.get(m.module)!.push(m);
    }

    return Array.from(grouped.entries()).map(([module, items]) => ({
      label: (
        <span
          style={{
            fontSize: 11,
            color: '#9ca3af',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {module}
        </span>
      ),
      options: items.map(item => ({
        value: item.route,
        label: (
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{item.label}</span>
            {item.group && (
              <span style={{ fontSize: 11, color: '#64748b' }}>{item.group}</span>
            )}
          </span>
        ),
      })),
    }));
  }, [query]);

  const handleSelect = useCallback(
    (route: string) => {
      navigate(route);
      setQuery('');
    },
    [navigate],
  );

  return (
    <AutoComplete
      className="app-global-search"
      value={query}
      onChange={setQuery}
      onSelect={handleSelect}
      options={options}
      notFoundContent={
        query.trim() ? (
          <span style={{ fontSize: 13, color: '#9ca3af', padding: '4px 8px', display: 'block' }}>
            No results for "{query}"
          </span>
        ) : null
      }
        popupMatchSelectWidth={380}
        style={{ width: 340 }}
      // Close dropdown when user presses Escape
      onKeyDown={e => {
        if (e.key === 'Escape') setQuery('');
      }}
    >
      <Input
        prefix={<SearchOutlined style={{ color: '#6b7280', fontSize: 14 }} />}
        placeholder="Search pages or modules..."
        allowClear
        style={{
          fontSize: 13,
          height: 34,
        }}
      />
    </AutoComplete>
  );
}
