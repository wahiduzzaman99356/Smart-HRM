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
  PushpinOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_MODULES } from './navConfig';
import type { NavSubItem } from './navConfig';
import { GlobalSearch } from './GlobalSearch';

const { Sider, Header, Content } = Layout;
const PINNED_STORAGE_KEY = 'smart-hrm.pinned-pages';
const PINNED_LIMIT = 6;

type RouteMeta = {
  key: string;
  label: string;
  moduleLabel: string;
};

function buildSubItems(children: NavSubItem[]): MenuProps['items'] {
  return children.map(sub => ({
    key: sub.key,
    label: sub.label,
    icon: sub.icon,
    ...(sub.children ? { children: buildSubItems(sub.children) } : {}),
  }));
}

function flattenLeafRoutes(children: NavSubItem[], moduleLabel: string): RouteMeta[] {
  const routes: RouteMeta[] = [];
  for (const sub of children) {
    if (sub.children) {
      routes.push(...flattenLeafRoutes(sub.children, moduleLabel));
      continue;
    }
    if (sub.key.startsWith('/')) {
      routes.push({ key: sub.key, label: sub.label, moduleLabel });
    }
  }
  return routes;
}

function parseStoredKeys(raw: string | null, validKeys: Set<string>, limit: number): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const unique = new Set<string>();
    for (const value of parsed) {
      if (typeof value !== 'string') continue;
      if (!validKeys.has(value) || unique.has(value)) continue;
      unique.add(value);
      if (unique.size >= limit) break;
    }
    return Array.from(unique);
  } catch {
    return [];
  }
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
    } else if (sub.key === pathname || pathname.startsWith(`${sub.key}/`)) {
      return [...ancestors, { label: sub.label, path: sub.key }];
    }
  }
  return null;
}

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

type BreadcrumbItem = { label: string; path: string };

function normalizeLabel(label: string): string {
  return label
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function useBreadcrumb(pathname: string, search: string, state: unknown): BreadcrumbItem[] | null {
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

    // Job Posting detail (3-level)
    if (/^\/recruitment\/job-postings\/.+/.test(pathname)) {
      const title = (state as { posting?: { designation?: string } })?.posting?.designation ?? 'Job Detail';
      return [
        { label: 'Recruitment & ATS', path: '/recruitment/job-postings' },
        { label: 'Job Posting',       path: '/recruitment/job-postings' },
        { label: title,               path: pathname },
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
  }, [pathname, search, state]);
}

const MENU_ITEMS = buildMenuItems();

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

  const breadcrumb = useBreadcrumb(location.pathname, location.search, location.state);

  const routeMetaMap = useMemo(() => {
    const map = new Map<string, RouteMeta>();
    for (const mod of NAV_MODULES) {
      const leaves = flattenLeafRoutes(mod.children, mod.label);
      for (const leaf of leaves) map.set(leaf.key, leaf);
    }
    return map;
  }, []);

  const validRouteKeys = useMemo(() => new Set(routeMetaMap.keys()), [routeMetaMap]);

  const [pinnedKeys, setPinnedKeys] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return parseStoredKeys(window.localStorage.getItem(PINNED_STORAGE_KEY), validRouteKeys, PINNED_LIMIT);
  });

  const isCurrentPagePinned = pinnedKeys.includes(selectedKey);

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
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedKeys));
  }, [pinnedKeys]);

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

  const togglePinCurrentPage = () => {
    if (!validRouteKeys.has(selectedKey)) return;
    setPinnedKeys(prev => {
      if (prev.includes(selectedKey)) {
        return prev.filter(key => key !== selectedKey);
      }
      return [selectedKey, ...prev].slice(0, PINNED_LIMIT);
    });
  };

  const pinnedMeta = pinnedKeys
    .map(key => routeMetaMap.get(key))
    .filter((item): item is RouteMeta => Boolean(item));

  return (
    <Layout className="app-layout-shell" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        className="app-sider-shell"
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={292}
        collapsedWidth={76}
        theme="light"
        style={{ overflow: 'hidden', height: '100vh', position: 'sticky', top: 0, left: 0, zIndex: 20 }}
      >
        <div className="app-sider-inner">
          <div className="app-brand-shell" role="button" onClick={() => navigate('/')}>
            <div className="app-brand-mark">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3,14 L7,8 L11,11 L16,5 L16,17 L3,17 Z" fill="rgba(255,255,255,0.15)" />
              <polyline
                points="3,14 7,8 11,11 16,5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="3"  cy="14" r="1.8" fill="white" />
              <circle cx="7"  cy="8"  r="1.8" fill="white" />
              <circle cx="11" cy="11" r="1.8" fill="white" />
              <circle cx="16" cy="5"  r="2.2" fill="white" />
            </svg>
            </div>
            {!collapsed && (
              <div className="app-brand-copy">
                <div className="app-brand-title-row">
                  <span className="app-brand-title">Zyrova</span>
                  <span className="app-brand-title-secondary">HR</span>
                </div>
                <span className="app-brand-subtitle">People. Process. Performance.</span>
                <span className="app-brand-chip">Live Workspace</span>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="app-nav-section-label">Navigation</div>
          )}

          {!collapsed && pinnedMeta.length > 0 && (
            <div className="app-pinned-shell" aria-label="Pinned pages">
              <div className="app-pinned-header">
                <PushpinOutlined />
                <span>Pinned</span>
              </div>
              <div className="app-pinned-list">
                {pinnedMeta.map(item => (
                  <div
                    key={item.key}
                    className={`app-pinned-item ${selectedKey === item.key ? 'is-active' : ''}`}
                    onClick={() => navigate(item.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      navigate(item.key);
                    }}
                  >
                    <span className="app-pinned-item-label">{item.label}</span>
                    <span
                      className="app-pinned-item-remove"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPinnedKeys(prev => prev.filter(key => key !== item.key));
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        event.stopPropagation();
                        setPinnedKeys(prev => prev.filter(key => key !== item.key));
                      }}
                      aria-label={`Remove ${item.label} from pinned pages`}
                    >
                      <StarFilled />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="app-sider-menu-scroll">
            <Menu
              className="app-sider-menu"
              mode="inline"
              selectedKeys={[selectedKey]}
              {...controlledMenuStateProps}
              onClick={handleMenuClick}
              items={MENU_ITEMS}
              style={{ border: 'none', paddingTop: 8, paddingBottom: 10, fontSize: 13, background: 'transparent' }}
            />
          </div>

          <div className="app-sider-footer">
            {!collapsed && (
              <div className="app-sider-footer-copy">
                <span className="app-sider-footer-title">Command Panel</span>
                <span className="app-sider-footer-subtitle">Smart HRM 2026</span>
              </div>
            )}
            <Button
              type="text"
              className="app-sider-collapse-button"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(c => !c)}
            >
              {!collapsed ? 'Collapse' : null}
            </Button>
          </div>
        </div>
      </Sider>

      <Layout className="app-main-shell" style={{ overflow: 'hidden', minWidth: 0 }}>
        <Header className="app-topbar-shell" style={{ height: 64, lineHeight: '64px', padding: '10px 16px', borderBottom: 'none', flexShrink: 0, zIndex: 10 }}>
          <div className="app-topbar-inner">
            <div className="app-topbar-left">
              <Button
                type="text"
                size="small"
                className="app-topbar-toggle"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(c => !c)}
              />
              {breadcrumb && breadcrumb.length > 0 && (
                <Breadcrumb
                  items={breadcrumb.map((item, idx) => ({
                    title: (
                      <span
                        className={idx === breadcrumb.length - 1 ? 'app-crumb-active' : 'app-crumb'}
                        onClick={() => navigate(item.path)}
                      >
                        {normalizeLabel(item.label)}
                      </span>
                    ),
                  }))}
                  separator="/"
                />
              )}
              <Button
                type="text"
                size="small"
                className="app-pin-toggle"
                icon={isCurrentPagePinned ? <StarFilled /> : <StarOutlined />}
                onClick={togglePinCurrentPage}
              >
                {isCurrentPagePinned ? 'Pinned' : 'Pin'}
              </Button>
            </div>

            <div className="app-topbar-right">
              <GlobalSearch />
              <Tooltip title="Help">
                <Button
                  type="text"
                  size="small"
                  className="app-topbar-icon-button"
                  icon={<QuestionCircleOutlined style={{ fontSize: 17 }} />}
                />
              </Tooltip>

              <Tooltip title="Notifications">
                <Badge count={3} size="small" offset={[-2, 2]}>
                  <Button
                    type="text"
                    size="small"
                    className="app-topbar-icon-button"
                    icon={<BellOutlined style={{ fontSize: 17 }} />}
                  />
                </Badge>
              </Tooltip>

              <div className="header-profile">
                <Avatar
                  size={34}
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                    flexShrink: 0,
                  }}
                />
                <div className="header-profile-copy">
                  <div className="header-profile-name">Admin User</div>
                  <div className="header-profile-role">HR Manager</div>
                </div>
              </div>
            </div>
          </div>
        </Header>

        <Content className="app-content-shell" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
