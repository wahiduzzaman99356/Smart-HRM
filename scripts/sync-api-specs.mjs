import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const DOCS_DIR = join(ROOT, 'docs');
const FEATURES_DIR = join(ROOT, 'src', 'features');
const IGNORE_DIRS = new Set(['.git', 'node_modules', 'dist', '.claude']);
const API_SPEC_PATTERN = /api[\w-]*spec[\w-]*\.md$/i;

function walk(dir, acc = [], skipIgnored = true) {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (skipIgnored && IGNORE_DIRS.has(entry.name)) continue;
      walk(fullPath, acc, skipIgnored);
      continue;
    }

    if (entry.isFile()) {
      acc.push(fullPath);
    }
  }

  return acc;
}

function toTitle(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function createSpecTemplate(moduleSlug) {
  const title = toTitle(moduleSlug);
  return `# ${title} API Specification

> **Feature:** ${title}
> **Date:** ${todayIso()}
> **Status:** Auto-generated stub (update with real endpoint contract)

---

## Overview

This API spec was auto-generated because a UI module exists for **${title}**.
Update this file with finalized backend endpoint contracts.

---

## Suggested Base URL

\`/api/v1/${moduleSlug}\`

---

## Endpoints

### 1) List
**\`GET /api/v1/${moduleSlug}/...\`**

### 2) Detail
**\`GET /api/v1/${moduleSlug}/:id\`**

### 3) Create
**\`POST /api/v1/${moduleSlug}\`**

### 4) Update
**\`PATCH /api/v1/${moduleSlug}/:id\`**

### 5) Action / Workflow
**\`POST /api/v1/${moduleSlug}/:id/action\`**
`;
}

function getUiModules() {
  if (!existsSync(FEATURES_DIR)) return [];

  const allFeatureFiles = walk(FEATURES_DIR, [], false);
  const moduleDirs = new Set();

  for (const file of allFeatureFiles) {
    if (!/[\\/]pages[\\/][^\\/]+Page\.(t|j)sx?$/i.test(file)) continue;
    moduleDirs.add(basename(dirname(dirname(file))));
  }

  return Array.from(moduleDirs).sort();
}

mkdirSync(DOCS_DIR, { recursive: true });

// 1) Move misplaced API spec files into docs
const allFiles = walk(ROOT);
let movedCount = 0;

for (const file of allFiles) {
  if (!API_SPEC_PATTERN.test(basename(file))) continue;

  const relToDocs = relative(DOCS_DIR, file);
  const isInsideDocs = !relToDocs.startsWith('..') && relToDocs !== '';
  if (isInsideDocs) continue;

  let target = join(DOCS_DIR, basename(file));
  if (existsSync(target)) {
    const stamp = Date.now();
    const base = basename(file, extname(file));
    target = join(DOCS_DIR, `${base}-${stamp}.md`);
  }

  renameSync(file, target);
  movedCount += 1;
  console.log(`ℹ moved: ${relative(ROOT, file).replace(/\\/g, '/')} -> ${relative(ROOT, target).replace(/\\/g, '/')}`);
}

// 2) Auto-generate missing API specs for UI modules
const uiModules = getUiModules();
let generatedCount = 0;

for (const moduleSlug of uiModules) {
  const specPath = join(DOCS_DIR, `${moduleSlug}-api-spec.md`);
  if (existsSync(specPath)) continue;

  writeFileSync(specPath, createSpecTemplate(moduleSlug), 'utf8');
  generatedCount += 1;
  console.log(`ℹ generated: ${relative(ROOT, specPath).replace(/\\/g, '/')}`);
}

console.log(`✅ API spec sync complete. moved=${movedCount}, generated=${generatedCount}, uiModules=${uiModules.length}`);
