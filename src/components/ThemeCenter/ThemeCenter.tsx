import { useState, useEffect, useRef, useCallback } from 'react';
import { Tooltip } from 'antd';
import {
  BgColorsOutlined,
  SunOutlined,
  MoonOutlined,
  DesktopOutlined,
  CloseOutlined,
  CheckOutlined,
  ReloadOutlined,
  FontSizeOutlined,
  LayoutOutlined,
} from '@ant-design/icons';
import { useThemeStore, THEME_PRESETS } from '@/stores/themeStore';
import type { ThemeMode, BorderRadiusMode, DensityMode, FontFamilyMode, TopbarStyle } from '@/stores/themeStore';
import { deriveColorScale } from '@/utils/colorUtils';

/* ─── Resolved dark mode helper ─────────────────────────────────────────── */
function useResolvedDark(): boolean {
  const { mode } = useThemeStore();
  const [osIsDark, setOsIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setOsIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return mode === 'dark' || (mode === 'system' && osIsDark);
}

const MODES: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light',  label: 'Light',  icon: <SunOutlined /> },
  { value: 'dark',   label: 'Dark',   icon: <MoonOutlined /> },
  { value: 'system', label: 'Auto',   icon: <DesktopOutlined /> },
];

const RADII: { value: BorderRadiusMode; label: string; preview: number }[] = [
  { value: 'sharp',   label: 'Sharp',   preview: 2  },
  { value: 'default', label: 'Default', preview: 10 },
  { value: 'rounded', label: 'Rounded', preview: 18 },
];

const DENSITIES: { value: DensityMode; label: string; rows: number }[] = [
  { value: 'compact',  label: 'Compact',  rows: 4 },
  { value: 'default',  label: 'Default',  rows: 3 },
  { value: 'spacious', label: 'Spacious', rows: 2 },
];

const FONTS: { value: FontFamilyMode; label: string; sample: string; stack: string }[] = [
  { value: 'manrope', label: 'Manrope',   sample: 'Aa', stack: 'Manrope, sans-serif' },
  { value: 'inter',   label: 'Inter',     sample: 'Aa', stack: 'Inter, sans-serif' },
  { value: 'system',  label: 'System UI', sample: 'Aa', stack: 'system-ui, sans-serif' },
];

const TOPBAR_STYLES: { value: TopbarStyle; label: string; desc: string }[] = [
  { value: 'gradient', label: 'Gradient', desc: 'Primary color gradient bar' },
  { value: 'minimal',  label: 'Minimal',  desc: 'Clean white / flat bar' },
];

/* ─── Mini App Preview (module-level to avoid React remount on every render) ── */
interface AppPreviewProps {
  isDark: boolean;
  primaryColor: string;
  primaryDark: string;
  primaryLight: string;
  topbarStyle: TopbarStyle;
  sectionBorder: string;
  br: number;
}

function AppPreview({ isDark, primaryColor, primaryDark, primaryLight, topbarStyle, sectionBorder, br }: AppPreviewProps) {
  const sbBg  = isDark ? '#161b27' : primaryLight;
  const cBg   = isDark ? '#0f1117' : '#F4F5F8';
  const crdBg = isDark ? '#1e2638' : '#ffffff';
  const divBg = isDark ? '#ffffff14' : '#0000000d';
  const topBg = topbarStyle === 'minimal'
    ? (isDark ? '#1e2638' : '#ffffff')
    : undefined;
  const topGrad = topbarStyle === 'gradient'
    ? `linear-gradient(90deg, ${primaryDark} 0%, ${primaryColor} 100%)`
    : undefined;

  return (
    <div style={{
      display: 'flex',
      height: 96,
      borderRadius: br,
      overflow: 'hidden',
      border: `1px solid ${sectionBorder}`,
      flexShrink: 0,
      transition: 'all 0.3s ease',
    }}>
      {/* Sidebar */}
      <div style={{
        width: 46,
        background: sbBg,
        borderRight: `1px solid ${sectionBorder}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 6px',
        gap: 4,
      }}>
        <div style={{ width: 28, height: 7, background: primaryColor, borderRadius: 2 }} />
        <div style={{ height: 1, background: sectionBorder, margin: '2px 0' }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            width: '100%',
            height: 8,
            borderRadius: 3,
            background: i === 1 ? primaryColor + '22' : divBg,
            borderLeft: i === 1 ? `2.5px solid ${primaryColor}` : '2.5px solid transparent',
          }} />
        ))}
      </div>
      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{
          height: 26,
          background: topGrad ?? topBg,
          borderBottom: topbarStyle === 'minimal' ? `1px solid ${sectionBorder}` : 'none',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: 6,
          flexShrink: 0,
        }}>
          <div style={{
            height: 5, flex: 1, borderRadius: 3,
            background: topbarStyle === 'minimal'
              ? (isDark ? '#ffffff22' : '#00000015')
              : 'rgba(255,255,255,0.35)',
          }} />
          <div style={{
            width: 18, height: 18, borderRadius: br / 2,
            background: topbarStyle === 'minimal'
              ? (isDark ? '#ffffff18' : '#00000010')
              : 'rgba(255,255,255,0.22)',
          }} />
        </div>
        {/* Content */}
        <div style={{ flex: 1, background: cBg, padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                flex: 1, height: 22, borderRadius: br / 2,
                background: crdBg, border: `1px solid ${sectionBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: '55%', height: 4, background: i === 1 ? primaryColor + '55' : divBg, borderRadius: 2 }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ flex: 2, height: 20, borderRadius: br / 2, background: crdBg, border: `1px solid ${sectionBorder}` }} />
            <div style={{ flex: 1, height: 20, borderRadius: br / 2, background: primaryColor }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function ThemeCenter() {
  const {
    mode, presetName, primaryColor, primaryDark, primaryLight,
    borderRadius, density, fontFamily, topbarStyle,
    setMode, applyPreset, setCustomColor, setBorderRadius,
    setDensity, setFontFamily, setTopbarStyle, reset,
  } = useThemeStore();

  const isDark = useResolvedDark();

  const [open, setOpen]             = useState(false);
  const [idle, setIdle]             = useState(true);
  const [btnHovered, setBtnHovered] = useState(false);
  const idleTimer                   = useRef<ReturnType<typeof setTimeout>>();
  const panelRef                    = useRef<HTMLDivElement>(null);

  const [customHex, setCustomHex]   = useState(primaryColor);
  const colorInputRef               = useRef<HTMLInputElement>(null);

  useEffect(() => { setCustomHex(primaryColor); }, [primaryColor]);

  useEffect(() => {
    if (open) {
      setIdle(false);
      clearTimeout(idleTimer.current);
    } else {
      idleTimer.current = setTimeout(() => setIdle(true), 3000);
    }
    return () => clearTimeout(idleTimer.current);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const fab = document.getElementById('theme-fab-btn');
        if (fab && fab.contains(e.target as Node)) return;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleCustomColorChange = useCallback((hex: string) => {
    setCustomHex(hex);
    const scale = deriveColorScale(hex);
    setCustomColor(scale.primary, scale.dark, scale.light);
  }, [setCustomColor]);

  /* ── Theme-aware palette ── */
  const panelBg        = isDark ? '#161b27' : '#ffffff';
  const panelBorder    = isDark ? '#2a3348' : '#e5e7eb';
  const sectionBg      = isDark ? '#1e2638' : '#f8fafc';
  const sectionBorder  = isDark ? '#2d3a52' : '#edf0f4';
  const textPrimary    = isDark ? '#f1f5f9' : '#111827';
  const textSecondary  = isDark ? '#94a3b8' : '#6b7280';
  const btnBg          = isDark ? '#252f42' : '#f1f5f9';
  const btnBorder      = isDark ? '#3a4660' : '#e2e8f0';
  const btnActiveBg    = isDark ? primaryColor + '33' : primaryColor + '18';
  const btnActiveBorder = primaryColor;
  const br             = borderRadius === 'sharp' ? 4 : borderRadius === 'rounded' ? 16 : 10;

  return (
    <>
      {/* ── FAB ── */}
      <div
        id="theme-fab-btn"
        className="theme-fab-wrapper"
        style={{ opacity: idle && !btnHovered && !open ? 0.32 : 1 }}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
      >
        <Tooltip title={open ? '' : 'Theme Center'} placement="left">
          <button
            className="theme-fab-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open theme center"
            style={{
              background: open
                ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`
                : isDark
                  ? `linear-gradient(135deg, #1e2638 0%, #252f42 100%)`
                  : `linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)`,
              border: `1.5px solid ${open ? primaryColor : panelBorder}`,
              color: open ? '#ffffff' : primaryColor,
            }}
          >
            {open ? <CloseOutlined style={{ fontSize: 18 }} /> : <BgColorsOutlined style={{ fontSize: 20 }} />}
          </button>
        </Tooltip>
      </div>

      {/* ── Panel ── */}
      <div
        ref={panelRef}
        className={`theme-panel ${open ? 'is-open' : ''}`}
        style={{ background: panelBg, border: `1px solid ${panelBorder}` }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="theme-panel-header" style={{ borderBottom: `1px solid ${sectionBorder}` }}>
          <div className="theme-panel-header-left">
            <span className="theme-panel-icon" style={{ background: primaryColor + '1e', color: primaryColor }}>
              <BgColorsOutlined />
            </span>
            <div>
              <div className="theme-panel-title" style={{ color: textPrimary }}>Theme Center</div>
              <div className="theme-panel-subtitle" style={{ color: textSecondary }}>Personalize your workspace</div>
            </div>
          </div>
          <Tooltip title="Reset to defaults">
            <button
              className="theme-icon-btn"
              style={{ color: textSecondary, background: btnBg, border: `1px solid ${btnBorder}` }}
              onClick={reset}
            >
              <ReloadOutlined />
            </button>
          </Tooltip>
        </div>

        <div className="theme-panel-body">

          {/* Live App Preview */}
          <AppPreview
            isDark={isDark}
            primaryColor={primaryColor}
            primaryDark={primaryDark}
            primaryLight={primaryLight}
            topbarStyle={topbarStyle}
            sectionBorder={sectionBorder}
            br={br}
          />

          {/* ── Appearance Mode ── */}
          <div className="theme-section" style={{ background: sectionBg, border: `1px solid ${sectionBorder}` }}>
            <div className="theme-section-label" style={{ color: textSecondary }}>Appearance</div>
            <div className="theme-mode-row">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  className="theme-mode-btn"
                  onClick={() => setMode(m.value)}
                  style={{
                    background: mode === m.value ? btnActiveBg : btnBg,
                    border: `1.5px solid ${mode === m.value ? btnActiveBorder : btnBorder}`,
                    color: mode === m.value ? primaryColor : textSecondary,
                  }}
                >
                  <span className="theme-mode-icon">{m.icon}</span>
                  <span className="theme-mode-label">{m.label}</span>
                  {mode === m.value && (
                    <span className="theme-mode-check" style={{ color: primaryColor }}>
                      <CheckOutlined style={{ fontSize: 10 }} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Color Presets ── */}
          <div className="theme-section" style={{ background: sectionBg, border: `1px solid ${sectionBorder}` }}>
            <div className="theme-section-label" style={{ color: textSecondary }}>Color Theme</div>
            <div className="theme-presets-grid">
              {THEME_PRESETS.map((preset) => {
                const isActive = presetName === preset.name;
                return (
                  <button
                    key={preset.name}
                    className="theme-preset-item"
                    onClick={() => applyPreset(preset.name)}
                    aria-label={preset.label}
                    style={{ borderColor: isActive ? preset.primary : 'transparent' }}
                  >
                    <div
                      className="theme-preset-swatch"
                      style={{
                        background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.dark} 100%)`,
                        boxShadow: isActive
                          ? `0 0 0 2px ${panelBg}, 0 0 0 4px ${preset.primary}`
                          : `0 2px 6px ${preset.primary}44`,
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      {isActive && <CheckOutlined style={{ color: '#fff', fontSize: 10, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />}
                    </div>
                    <span className="theme-preset-label" style={{
                      color: isActive ? primaryColor : textSecondary,
                      fontWeight: isActive ? 700 : 400,
                    }}>
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Custom Color ── */}
          <div className="theme-section" style={{ background: sectionBg, border: `1px solid ${sectionBorder}` }}>
            <div className="theme-section-label" style={{ color: textSecondary }}>Custom Color</div>
            <div className="theme-custom-color-row">
              <div
                className="theme-color-swatch-btn"
                style={{ background: customHex, boxShadow: `0 2px 8px ${customHex}66`, border: `2px solid ${panelBorder}` }}
                onClick={() => colorInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Pick custom color"
              />
              <input
                ref={colorInputRef}
                type="color"
                value={customHex}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="theme-color-native-input"
                tabIndex={-1}
              />
              <div className="theme-custom-hex-wrapper" style={{ background: btnBg, border: `1px solid ${btnBorder}` }}>
                <span className="theme-hex-hash" style={{ color: textSecondary }}>#</span>
                <input
                  type="text"
                  className="theme-hex-input"
                  style={{ color: textPrimary, background: 'transparent' }}
                  value={customHex.replace('#', '')}
                  maxLength={6}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '');
                    setCustomHex('#' + raw);
                    if (raw.length === 6) handleCustomColorChange('#' + raw);
                  }}
                  placeholder="0f766e"
                  spellCheck={false}
                />
              </div>
              <button
                className="theme-apply-btn"
                style={{ background: primaryColor, color: '#fff', border: 'none' }}
                onClick={() => handleCustomColorChange(customHex)}
              >
                Apply
              </button>
            </div>
            {presetName === 'custom' && (
              <div className="theme-custom-badge" style={{ color: primaryColor, background: primaryColor + '18' }}>
                Custom color active
              </div>
            )}
          </div>

          {/* ── Topbar Style ── */}
          <div className="theme-section" style={{ background: sectionBg, border: `1px solid ${sectionBorder}` }}>
            <div className="theme-section-label" style={{ color: textSecondary, display: 'flex', alignItems: 'center', gap: 5 }}>
              <LayoutOutlined />
              <span>Header Style</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {TOPBAR_STYLES.map((s) => {
                const isActive = topbarStyle === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setTopbarStyle(s.value)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      border: `1.5px solid ${isActive ? btnActiveBorder : btnBorder}`,
                      background: isActive ? btnActiveBg : btnBg,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 6,
                      outline: 'none',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {/* Mini topbar preview */}
                    <div style={{
                      width: '100%',
                      height: 14,
                      borderRadius: 4,
                      background: s.value === 'gradient'
                        ? `linear-gradient(90deg, ${primaryDark} 0%, ${primaryColor} 100%)`
                        : (isDark ? '#252f42' : '#ffffff'),
                      border: s.value === 'minimal' ? `1px solid ${sectionBorder}` : 'none',
                    }} />
                    <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? primaryColor : textSecondary }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 10, color: textSecondary, lineHeight: 1.2 }}>{s.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Font Family ── */}
          <div className="theme-section" style={{ background: sectionBg, border: `1px solid ${sectionBorder}` }}>
            <div className="theme-section-label" style={{ color: textSecondary, display: 'flex', alignItems: 'center', gap: 5 }}>
              <FontSizeOutlined />
              <span>Font Family</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {FONTS.map((f) => {
                const isActive = fontFamily === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFontFamily(f.value)}
                    style={{
                      flex: 1,
                      height: 54,
                      borderRadius: 10,
                      cursor: 'pointer',
                      border: `1.5px solid ${isActive ? btnActiveBorder : btnBorder}`,
                      background: isActive ? btnActiveBg : btnBg,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                      outline: 'none',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <span style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: isActive ? primaryColor : textPrimary,
                      fontFamily: f.stack,
                      lineHeight: 1,
                    }}>
                      {f.sample}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? primaryColor : textSecondary }}>
                      {f.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Corner Radius ── */}
          <div className="theme-section" style={{ background: sectionBg, border: `1px solid ${sectionBorder}` }}>
            <div className="theme-section-label" style={{ color: textSecondary }}>Corner Radius</div>
            <div className="theme-radius-row">
              {RADII.map((r) => {
                const isActive = borderRadius === r.value;
                return (
                  <button
                    key={r.value}
                    className="theme-radius-btn"
                    onClick={() => setBorderRadius(r.value)}
                    style={{
                      background: isActive ? btnActiveBg : btnBg,
                      border: `1.5px solid ${isActive ? btnActiveBorder : btnBorder}`,
                      color: isActive ? primaryColor : textSecondary,
                    }}
                  >
                    <span className="theme-radius-preview" style={{ borderRadius: r.preview, background: isActive ? primaryColor : textSecondary + '55' }} />
                    <span style={{ fontWeight: isActive ? 600 : 400 }}>{r.label}</span>
                    {isActive && <CheckOutlined style={{ fontSize: 10, marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── UI Density ── */}
          <div className="theme-section" style={{ background: sectionBg, border: `1px solid ${sectionBorder}` }}>
            <div className="theme-section-label" style={{ color: textSecondary }}>UI Density</div>
            <div className="theme-density-row">
              {DENSITIES.map((d) => {
                const isActive = density === d.value;
                return (
                  <button
                    key={d.value}
                    className="theme-density-btn"
                    onClick={() => setDensity(d.value)}
                    style={{
                      background: isActive ? btnActiveBg : btnBg,
                      border: `1.5px solid ${isActive ? btnActiveBorder : btnBorder}`,
                      color: isActive ? primaryColor : textSecondary,
                    }}
                  >
                    <span className="theme-density-preview">
                      {Array.from({ length: d.rows }).map((_, i) => (
                        <span key={i} style={{
                          display: 'block',
                          height: 3,
                          width: '80%',
                          borderRadius: 2,
                          background: isActive ? primaryColor + '88' : textSecondary + '55',
                          margin: d.value === 'spacious' ? '3px auto' : d.value === 'compact' ? '1px auto' : '2px auto',
                        }} />
                      ))}
                    </span>
                    <span style={{ fontWeight: isActive ? 600 : 400 }}>{d.label}</span>
                    {isActive && <CheckOutlined style={{ fontSize: 10, marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Live Preview ── */}
          <div className="theme-preview-strip" style={{ border: `1px solid ${sectionBorder}` }}>
            <div className="theme-preview-label" style={{ color: textSecondary }}>Preview</div>
            <div className="theme-preview-row">
              <span className="theme-preview-btn-primary" style={{ background: primaryColor, borderRadius: br }}>
                Primary
              </span>
              <span className="theme-preview-btn-outline" style={{ border: `1.5px solid ${primaryColor}`, color: primaryColor, borderRadius: br }}>
                Outline
              </span>
              <span className="theme-preview-chip" style={{ background: primaryColor + '20', color: primaryColor, borderRadius: 999 }}>
                Badge
              </span>
              <span
                className="theme-preview-card"
                style={{ background: isDark ? '#252f42' : '#f8fafc', border: `1px solid ${panelBorder}`, borderRadius: br }}
              >
                <span style={{ color: textPrimary, fontWeight: 600, fontSize: 11 }}>Card</span>
                <span style={{ color: textSecondary, fontSize: 10 }}>Surface</span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
