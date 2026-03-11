/**
 * AppLayout.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Persistent shell for all authenticated pages.
 *
 *  ┌─ Sider (260px / 64px collapsed) ─┬─ Layout ──────────────────────────┐
 *  │  [Smart HRIS logo]               │  [Header 56px]                    │
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
        onOpenChange: (keys) => setOpenKeys(keys as string[]),
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
          {/* Logo mark */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(145deg, #0d9488 0%, #0a7c71 50%, #086b62 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 10px rgba(13,148,136,0.38), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {/* Heartbeat / pulse mark — ties into "heart of your workplace" */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1.5 10.5h3.2l1.8-5 3.2 9.5 2.1-6.5 1.7 3.5H18"
                stroke="white"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Wordmark + tagline */}
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, lineHeight: 1.1 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#0d9488', letterSpacing: '-0.3px' }}>
                  Smart
                </span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', letterSpacing: '-0.3px' }}>
                  &nbsp;HRIS
                </span>
              </div>
              <span style={{
                fontSize: 9.5,
                color: '#94a3b8',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                The heart of your workplace
              </span>
            </div>
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
            borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
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
            />
            {breadcrumb && (
              <Breadcrumb
                items={breadcrumb.map((item, idx) => ({
                  title: (
                    <span
                      style={{
                        cursor: 'pointer',
                        fontSize: 13,
                        color: idx === breadcrumb.length - 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.78)',
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
                icon={<QuestionCircleOutlined style={{ fontSize: 17 }} />}
              />
            </Tooltip>

            <Tooltip title="Notifications">
              <Badge count={3} size="small" offset={[-2, 2]}>
                <Button
                  type="text"
                  size="small"
                  icon={<BellOutlined style={{ fontSize: 17 }} />}
                />
              </Badge>
            </Tooltip>

            <div
              className="header-profile"
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
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.78)' }}>HR Manager</div>
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
