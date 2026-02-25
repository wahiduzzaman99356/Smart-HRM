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

import { useState, useMemo } from 'react';
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
import { GlobalSearch } from './GlobalSearch';

const { Sider, Header, Content } = Layout;

// ─── Convert NAV_MODULES → Ant Design MenuItem format ─────────────────────────
function buildMenuItems(): MenuProps['items'] {
  return NAV_MODULES.map(mod => ({
    key: mod.key,
    label: mod.label,
    icon: mod.icon,
    children: mod.children.map(sub => ({
      key: sub.key,
      label: sub.label,
    })),
  }));
}

// ─── Derive breadcrumb from pathname ──────────────────────────────────────────
function useBreadcrumb(pathname: string, search: string): {
  module: string;
  modulePath: string;
  page: string;
  pagePath: string;
} | null {
  return useMemo(() => {
    if (pathname === '/core-hr/manpower-headcount') {
      const mode = new URLSearchParams(search).get('mode');
      if (mode === 'create') {
        return {
          module: 'Core HR & Employee',
          modulePath: '/core-hr/organogram',
          page: 'Initiate Headcount Request',
          pagePath: '/core-hr/manpower-headcount?mode=create',
        };
      }
      if (mode === 'action') {
        return {
          module: 'Core HR & Employee',
          modulePath: '/core-hr/organogram',
          page: 'Approve / Reject Request',
          pagePath: '/core-hr/manpower-headcount?mode=action',
        };
      }
    }

    for (const mod of NAV_MODULES) {
      const sub = mod.children.find(c => c.key === pathname);
      if (sub) {
        return {
          module: mod.label,
          modulePath: mod.children[0]?.key ?? pathname,
          page: sub.label,
          pagePath: sub.key,
        };
      }
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

  const selectedKey = location.pathname;
  const breadcrumb = useBreadcrumb(selectedKey, location.search);

  // Keep the active module's submenu open; collapse others on init
  const defaultOpenKeys = useMemo(
    () =>
      NAV_MODULES.filter(mod =>
        mod.children.some(c => selectedKey.startsWith(c.key)),
      ).map(mod => mod.key),
    // Only compute once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const menuItems = useMemo(() => buildMenuItems(), []);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <Sider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        collapsedWidth={64}
        theme="light"
        style={{
          borderRight: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 20,
          background: '#fff',
        }}
      >
        {/* Brand / Logo */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: '1px solid #f0f0f0',
            flexShrink: 0,
            gap: 10,
            background: '#fff',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
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
              <span style={{ color: '#3b82f6' }}>Smart</span>
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
            // Custom thin scrollbar
            scrollbarWidth: 'thin',
            scrollbarColor: '#e5e7eb transparent',
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            defaultOpenKeys={defaultOpenKeys}
            onClick={handleMenuClick}
            items={menuItems}
            style={{
              border: 'none',
              paddingTop: 6,
              paddingBottom: 16,
              fontSize: 13,
            }}
          />
        </div>

        {/* Bottom collapse toggle (visible only when not collapsed) */}
        {!collapsed && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#9ca3af',
              fontSize: 12,
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onClick={() => setCollapsed(true)}
          >
            <MenuFoldOutlined />
            <span>Collapse</span>
          </div>
        )}
      </Sider>

      {/* ── Right side (header + content) ──────────────────────────────────── */}
      <Layout style={{ overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <Header
          style={{
            height: 56,
            lineHeight: '56px',
            padding: '0 20px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
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
              style={{ color: '#6b7280' }}
            />
            {breadcrumb && (
              <Breadcrumb
                items={[
                  {
                    title: (
                      <span
                        style={{ cursor: 'pointer', color: '#6b7280', fontSize: 13 }}
                        onClick={() => navigate(breadcrumb.modulePath)}
                      >
                        {breadcrumb.module}
                      </span>
                    ),
                  },
                  {
                    title: (
                      <span
                        style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#111827' }}
                        onClick={() => navigate(breadcrumb.pagePath)}
                      >
                        {breadcrumb.page}
                      </span>
                    ),
                  },
                ]}
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
                icon={<QuestionCircleOutlined style={{ fontSize: 17, color: '#9ca3af' }} />}
              />
            </Tooltip>

            <Tooltip title="Notifications">
              <Badge count={3} size="small" offset={[-2, 2]}>
                <Button
                  type="text"
                  size="small"
                  icon={<BellOutlined style={{ fontSize: 17, color: '#6b7280' }} />}
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
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  flexShrink: 0,
                }}
              />
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Admin User</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>HR Manager</div>
              </div>
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            flex: 1,
            overflow: 'hidden',
            background: '#f9fafb',
            position: 'relative',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
