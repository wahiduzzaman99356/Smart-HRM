/**
 * AppLayout.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Persistent shell for all authenticated pages.
 *
 *  ┌─ Sider (260px / 64px collapsed) ─┬─ Layout ──────────────────────────┐
 *  │  [Smart HRM logo]                │  [Header 56px]                    │
 *  │  ─────────────────               │  ───────────────────────────────  │
 *  │  Scrollable Menu                 │  Content (fills remaining height) │
 *  └──────────────────────────────────┴───────────────────────────────────┘
 */

import { useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Tooltip, Breadcrumb } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  AppstoreOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_MODULES } from './navConfig';
import type { NavSubItem } from './navConfig';
import { GlobalSearch } from './GlobalSearch';

const { Sider, Header, Content } = Layout;

// ─── Helpers for nested NavSubItem trees ──────────────────────────────────────
function buildSubItems(children: NavSubItem[]): MenuProps['items'] {
  return children.map(sub => ({
    key: sub.key,
    label: sub.label,
    ...(sub.children ? { children: buildSubItems(sub.children) } : {}),
  }));
}

/** Returns the route key of the first leaf in a subtree. */
function getFirstLeafKey(children: NavSubItem[]): string {
  const first = children[0];
  if (!first) return '';
  if (first.children) return getFirstLeafKey(first.children);
  return first.key;
}

/** Finds the leaf route key matching pathname (recursive). */
function findLeafKey(children: NavSubItem[], pathname: string): string | null {
  for (const sub of children) {
    if (sub.children) {
      const found = findLeafKey(sub.children, pathname);
      if (found) return found;
    } else if (sub.key === pathname || pathname.startsWith(`${sub.key}/`)) {
      return sub.key;
    }
  }
  return null;
}

/** Collects the keys of all ancestor sub-menu nodes on the path to targetKey. */
function collectAncestorKeys(children: NavSubItem[], targetKey: string, path: string[]): string[] | null {
  for (const sub of children) {
    if (sub.children) {
      const result = collectAncestorKeys(sub.children, targetKey, [...path, sub.key]);
      if (result) return result;
    } else if (sub.key === targetKey) {
      return path;
    }
  }
  return null;
}

/** Returns true if key exists anywhere in the subtree (leaf or sub-menu). */
function isKeyInTree(children: NavSubItem[], targetKey: string): boolean {
  for (const sub of children) {
    if (sub.key === targetKey) return true;
    if (sub.children && isKeyInTree(sub.children, targetKey)) return true;
  }
  return false;
}

/** Builds a breadcrumb path array for the given pathname (recursive). */
function findBreadcrumbPath(
  children: NavSubItem[],
  pathname: string,
  ancestors: BreadcrumbItem[],
): BreadcrumbItem[] | null {
  for (const sub of children) {
    if (sub.children) {
      const result = findBreadcrumbPath(sub.children, pathname, [
        ...ancestors,
        { label: sub.label, path: getFirstLeafKey(sub.children) },
      ]);
      if (result) return result;
    } else if (sub.key === pathname) {
      return [...ancestors, { label: sub.label, path: sub.key }];
    }
  }
  return null;
}

// ─── Convert NAV_MODULES → Ant Design MenuItem format ─────────────────────────
function buildMenuItems(): MenuProps['items'] {
  return NAV_MODULES.map(mod => ({
    key: mod.key,
    label: mod.label,
    icon: mod.icon,
    popupClassName: 'app-sider-submenu-popup',
    popupOffset: [8, 0],
    children: buildSubItems(mod.children),
  }));
}

// ─── Derive breadcrumb items from pathname + search params ────────────────────
type BreadcrumbItem = { label: string; path: string };

function useBreadcrumb(pathname: string, search: string): BreadcrumbItem[] | null {
  return useMemo(() => {
    const mode = new URLSearchParams(search).get('mode');

    // Headcount form views (3-level)
    if (pathname === '/core-hr/manpower-headcount' && mode) {
      const pageLabel = mode === 'create' ? 'Initiate Headcount Request' : 'Approve / Reject Request';
      return [
        { label: 'Core HR & Employee', path: '/core-hr/organogram' },
        { label: 'Manpower Headcount', path: '/core-hr/manpower-headcount' },
        { label: pageLabel,            path: `/core-hr/manpower-headcount?mode=${mode}` },
      ];
    }

    // Requisition form views (3-level)
    if (pathname === '/core-hr/requisition' && (mode === 'create' || mode === 'action')) {
      return [
        { label: 'Core HR & Employee',       path: '/core-hr/organogram' },
        { label: 'Manpower Requisition',     path: '/core-hr/requisition' },
        { label: 'Manpower Requisition Form', path: `/core-hr/requisition?mode=${mode}` },
      ];
    }

    // Default: recursive lookup (handles nested sub-menus)
    for (const mod of NAV_MODULES) {
      const firstModLeaf = getFirstLeafKey(mod.children);
      const path = findBreadcrumbPath(mod.children, pathname, [
        { label: mod.label, path: firstModLeaf },
      ]);
      if (path) return path;
    }
    return null;
  }, [pathname, search]);
}

// ─── Component ────────────────────────────────────────────────────────────────
interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = useMemo(() => {
    for (const mod of NAV_MODULES) {
      const key = findLeafKey(mod.children, location.pathname);
      if (key) return key;
    }
    return location.pathname;
  }, [location.pathname]);

  const breadcrumb = useBreadcrumb(location.pathname, location.search);

  // Active module key + any intermediate sub-menu keys from route
  const routeOpenKeys = useMemo(() => {
    const keys: string[] = [];
    for (const mod of NAV_MODULES) {
      if (findLeafKey(mod.children, selectedKey)) {
        keys.push(mod.key);
        const ancestors = collectAncestorKeys(mod.children, selectedKey, []);
        if (ancestors) keys.push(...ancestors);
        break;
      }
    }
    return keys;
  }, [selectedKey]);

  const [openKeys, setOpenKeys] = useState<string[]>(routeOpenKeys);

  useEffect(() => {
    if (collapsed) {
      setOpenKeys([]);
      return;
    }

    setOpenKeys(prev => {
      const merged = new Set([...prev, ...routeOpenKeys]);
      return Array.from(merged);
    });
  }, [collapsed, routeOpenKeys]);

  const menuItems = useMemo(() => buildMenuItems(), []);

  const controlledMenuStateProps: Pick<MenuProps, 'openKeys' | 'onOpenChange'> = collapsed
    ? {}
    : {
        openKeys,
        onOpenChange: (keys) => {
          const incoming = keys as string[];
          setOpenKeys(prev => {
            const prevSet = new Set(prev);
            const incomingSet = new Set(incoming);
            const result = new Set(incoming);
            // Ant Design may omit a module-level parent key from onOpenChange
            // when only a nested child sub-menu was toggled. Re-add any module
            // key that was previously open and still has nested keys in the
            // incoming set (meaning the user didn't explicitly close the module).
            for (const mod of NAV_MODULES) {
              if (prevSet.has(mod.key) && !incomingSet.has(mod.key)) {
                const hasNestedIncoming = incoming.some(k => isKeyInTree(mod.children, k));
                if (hasNestedIncoming) result.add(mod.key);
              }
            }
            return Array.from(result);
          });
        },
      };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    // Only navigate for leaf route paths (start with '/').
    // Sub-menu parent keys (e.g. 'payroll-generation') must not trigger navigation.
    if (key.startsWith('/')) navigate(key);
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <Sider
        className="app-sider-shell"
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        collapsedWidth={64}
        theme="light"
        style={{
          borderRight: '1px solid #dcebe8',
          overflow: 'hidden',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 20,
          background: '#f3faf8',
        }}
      >
        {/* Inner flex column — Ant Design renders an extra .ant-layout-sider-children
            wrapper, so we need our own flex container to get scrolling right. */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Brand / Logo */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: '1px solid #dcebe8',
            flexShrink: 0,
            gap: 10,
            background: 'transparent',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AppstoreOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 16, lineHeight: 1, whiteSpace: 'nowrap' }}>
              <span style={{ color: '#0d9488' }}>Smart</span>
              <span style={{ color: '#111827' }}> HRM</span>
            </span>
          )}
        </div>

        {/* Scrollable nav menu */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'transparent',
            // Custom thin scrollbar
            scrollbarWidth: 'thin',
            scrollbarColor: '#e5e7eb transparent',
          }}
        >
          <Menu
            className="app-sider-menu"
            mode="inline"
            selectedKeys={[selectedKey]}
            {...controlledMenuStateProps}
            onClick={handleMenuClick}
            items={menuItems}
            style={{
              border: 'none',
              paddingTop: 6,
              paddingBottom: 16,
              fontSize: 13,
              background: 'transparent',
            }}
          />
        </div>

        {/* Bottom collapse toggle (visible only when not collapsed) */}
        {!collapsed && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #dcebe8',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#64748b',
              fontSize: 12,
              cursor: 'pointer',
              flexShrink: 0,
              background: 'transparent',
            }}
            onClick={() => setCollapsed(true)}
          >
            <MenuFoldOutlined />
            <span>Collapse</span>
          </div>
        )}
        </div>
      </Sider>

      {/* ── Right side (header + content) ──────────────────────────────────── */}
      <Layout style={{ overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <Header
          className="app-topbar-shell"
          style={{
            height: 56,
            lineHeight: '56px',
            padding: '0 20px',
            background: 'linear-gradient(180deg, #2d7d77 0%, #286f6a 100%)',
            borderBottom: '1px solid #3f9089',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {/* Left: collapse toggle + breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              size="small"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(c => !c)}
              style={{ color: '#d6eeeb' }}
            />
            {breadcrumb && (
              <Breadcrumb
                items={breadcrumb.map((item, idx) => ({
                  title: (
                    <span
                      style={{
                        cursor: 'pointer',
                        fontSize: 13,
                        color: idx === breadcrumb.length - 1 ? '#ffffff' : '#d6eeeb',
                        fontWeight: idx === breadcrumb.length - 1 ? 600 : 400,
                      }}
                      onClick={() => navigate(item.path)}
                    >
                      {item.label}
                    </span>
                  ),
                }))}
                separator="›"
              />
            )}
          </div>

          {/* Right: search + help + notifications + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GlobalSearch />
            <Tooltip title="Help">
              <Button
                type="text"
                size="small"
                icon={<QuestionCircleOutlined style={{ fontSize: 17, color: '#d6eeeb' }} />}
              />
            </Tooltip>

            <Tooltip title="Notifications">
              <Badge count={3} size="small" offset={[-2, 2]}>
                <Button
                  type="text"
                  size="small"
                  icon={<BellOutlined style={{ fontSize: 17, color: '#d6eeeb' }} />}
                />
              </Badge>
            </Tooltip>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 8,
                transition: 'background 0.15s',
              }}
            >
              <Avatar
                size={30}
                icon={<UserOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  flexShrink: 0,
                }}
              />
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>Admin User</div>
                <div style={{ fontSize: 11, color: '#d6eeeb' }}>HR Manager</div>
              </div>
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            flex: 1,
            overflow: 'hidden',
            background: '#eef4f5',
            position: 'relative',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
