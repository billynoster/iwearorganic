import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/** Dedicated Admin app name so guest checkout is not affected by other default inits. */
const GUEST_ADMIN_APP_NAME = 'guest-checkout-admin';

type AppletFirebaseConfig = {
  projectId?: string;
  firestoreDatabaseId?: string;
};

export type ServiceAccountProbe = {
  keyDefined: boolean;
  keyFileDefined: boolean;
  gacDefined: boolean;
  rawLength: number;
  looksLikeJson: boolean;
  looksLikePath: boolean;
  cwd: string;
  projectRoot: string;
  triedPaths: string[];
  existingPaths: string[];
  parseOk: boolean;
  projectIdPresent: boolean;
  /** Safe: service-account project_id (not a secret). */
  saProjectId?: string;
  clientProjectId?: string;
  projectIdMatch?: boolean;
  databaseId?: string;
  databaseIdSource?: 'env' | 'config-fs' | 'config-import' | 'missing';
  appletConfigPath?: string;
  appletConfigExists?: boolean;
  adminAppName?: string;
  error?: string;
};

export type AdminFirestoreTarget = {
  projectId: string | undefined;
  databaseId: string | undefined;
  databaseIdSource: ServiceAccountProbe['databaseIdSource'];
  clientProjectId: string | undefined;
  saProjectId: string | undefined;
  projectIdMatch: boolean | undefined;
  appletConfigPath: string;
  appletConfigExists: boolean;
  adminAppName: string;
};

/** Strip BOM, surrounding quotes, and whitespace from env values. */
export function sanitizeEnvValue(value: string | undefined | null): string {
  if (value == null) return '';
  let v = String(value).replace(/^\uFEFF/, '').trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v.replace(/^\uFEFF/, '').trim();
}

function looksLikeFilePath(value: string): boolean {
  const v = value.trim();
  if (!v || v.startsWith('{')) return false;
  return (
    v.startsWith('./') ||
    v.startsWith('../') ||
    v.startsWith('/') ||
    /^[A-Za-z]:[\\/]/.test(v) ||
    v.endsWith('.json')
  );
}

/** Walk up from cwd to find a directory that contains package.json (Next project root). */
function findProjectRoot(startDir: string = process.cwd()): string {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir);
}

function appletConfigCandidates(): string[] {
  const root = findProjectRoot();
  const cwd = process.cwd();
  return [
    path.join(root, 'firebase-applet-config.json'),
    path.join(cwd, 'firebase-applet-config.json'),
    path.resolve(__dirname, '../../firebase-applet-config.json'),
    path.resolve(__dirname, '../../../firebase-applet-config.json'),
  ].map((p) => path.normalize(p));
}

/**
 * Prefer filesystem read at runtime (Next bundling can obscure JSON imports).
 * Falls back to dynamic require of the committed config if present.
 */
export function loadAppletFirebaseConfig(): {
  config: AppletFirebaseConfig;
  path: string;
  exists: boolean;
  source: 'fs' | 'require' | 'empty';
} {
  for (const candidate of appletConfigCandidates()) {
    if (!existsSync(candidate)) continue;
    try {
      const parsed = JSON.parse(
        readFileSync(candidate, 'utf8').replace(/^\uFEFF/, '')
      ) as AppletFirebaseConfig;
      return { config: parsed, path: candidate, exists: true, source: 'fs' };
    } catch (err) {
      console.error('[firebase-admin] Failed to parse applet config at', candidate, err);
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const required = require('../../firebase-applet-config.json') as AppletFirebaseConfig;
    return {
      config: required,
      path: '(bundled-require)',
      exists: true,
      source: 'require',
    };
  } catch {
    return {
      config: {},
      path: appletConfigCandidates()[0]!,
      exists: false,
      source: 'empty',
    };
  }
}

function resolveFirestoreDatabaseId(applet: AppletFirebaseConfig): {
  databaseId: string | undefined;
  source: ServiceAccountProbe['databaseIdSource'];
} {
  const fromEnv = sanitizeEnvValue(process.env.FIREBASE_FIRESTORE_DATABASE_ID);
  if (fromEnv) {
    return {
      databaseId: fromEnv === '(default)' ? undefined : fromEnv,
      source: fromEnv === '(default)' ? 'missing' : 'env',
    };
  }

  const fromConfig = applet.firestoreDatabaseId?.trim();
  if (fromConfig && fromConfig !== '(default)') {
    return { databaseId: fromConfig, source: 'config-fs' };
  }

  return { databaseId: undefined, source: 'missing' };
}

function resolveAdminProjectId(
  serviceAccount: ServiceAccount,
  applet: AppletFirebaseConfig
): string | undefined {
  const fromEnv = sanitizeEnvValue(process.env.FIREBASE_PROJECT_ID);
  if (fromEnv) return fromEnv;

  const fromSa = (serviceAccount as ServiceAccount & { project_id?: string }).project_id;
  if (fromSa) return fromSa;

  return applet.projectId || undefined;
}

function buildPathCandidates(filePath: string): string[] {
  const cleaned = sanitizeEnvValue(filePath);
  const cwd = process.cwd();
  const root = findProjectRoot(cwd);
  const withoutDot = cleaned.replace(/^\.\//, '');

  const candidates = [
    cleaned,
    path.resolve(cwd, cleaned),
    path.resolve(cwd, withoutDot),
    path.resolve(root, cleaned),
    path.resolve(root, withoutDot),
    path.join(root, 'secrets', path.basename(cleaned)),
  ];

  return [...new Set(candidates.map((c) => path.normalize(c)))];
}

function readServiceAccountFile(filePath: string): {
  account: ServiceAccount;
  usedPath: string;
  triedPaths: string[];
  existingPaths: string[];
} {
  const triedPaths = buildPathCandidates(filePath);
  const existingPaths = triedPaths.filter((p) => existsSync(p));

  for (const candidate of existingPaths) {
    const contents = readFileSync(candidate, 'utf8').replace(/^\uFEFF/, '');
    const account = JSON.parse(contents) as ServiceAccount;
    return { account, usedPath: candidate, triedPaths, existingPaths };
  }

  throw new Error(
    `Service account file not found (cwd=${process.cwd()}, projectRoot=${findProjectRoot()}). Tried: ${triedPaths.join(
      ' | '
    )}`
  );
}

function resolveServiceAccountDetailed(): {
  account: ServiceAccount;
  triedPaths: string[];
  existingPaths: string[];
  source: 'KEY_FILE' | 'GAC' | 'KEY_PATH' | 'KEY_JSON';
} | null {
  const keyFile = sanitizeEnvValue(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_FILE);
  if (keyFile) {
    const result = readServiceAccountFile(keyFile);
    return { ...result, source: 'KEY_FILE' };
  }

  const gac = sanitizeEnvValue(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (gac) {
    const result = readServiceAccountFile(gac);
    return { ...result, source: 'GAC' };
  }

  const raw = sanitizeEnvValue(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  if (!raw) return null;

  if (looksLikeFilePath(raw)) {
    const result = readServiceAccountFile(raw);
    return { ...result, source: 'KEY_PATH' };
  }

  if (raw.startsWith('{')) {
    const account = JSON.parse(raw) as ServiceAccount;
    return {
      account,
      triedPaths: [],
      existingPaths: [],
      source: 'KEY_JSON',
    };
  }

  const result = readServiceAccountFile(raw);
  return { ...result, source: 'KEY_PATH' };
}

export function resolveServiceAccount(): ServiceAccount | null {
  try {
    const detailed = resolveServiceAccountDetailed();
    return detailed?.account ?? null;
  } catch (err) {
    console.error('[firebase-admin] Failed to resolve service account:', err);
    return null;
  }
}

export function isFirebaseAdminConfigured(): boolean {
  return resolveServiceAccount() !== null;
}

/** Safe snapshot of which project + named DB Admin will target. */
export function describeAdminFirestoreTarget(
  serviceAccount?: ServiceAccount | null
): AdminFirestoreTarget {
  const appletLoaded = loadAppletFirebaseConfig();
  const account =
    serviceAccount ??
    (() => {
      try {
        return resolveServiceAccountDetailed()?.account ?? null;
      } catch {
        return null;
      }
    })();

  const saProjectId = account
    ? (account as ServiceAccount & { project_id?: string }).project_id
    : undefined;
  const { databaseId, source } = resolveFirestoreDatabaseId(appletLoaded.config);
  const projectId = account
    ? resolveAdminProjectId(account, appletLoaded.config)
    : sanitizeEnvValue(process.env.FIREBASE_PROJECT_ID) ||
      appletLoaded.config.projectId;

  return {
    projectId,
    databaseId,
    databaseIdSource: source,
    clientProjectId: appletLoaded.config.projectId,
    saProjectId,
    projectIdMatch:
      saProjectId && appletLoaded.config.projectId
        ? saProjectId === appletLoaded.config.projectId
        : undefined,
    appletConfigPath: appletLoaded.path,
    appletConfigExists: appletLoaded.exists,
    adminAppName: GUEST_ADMIN_APP_NAME,
  };
}

/**
 * Safe probe for guest-checkout diagnostics. Never logs secret contents / private_key.
 */
export function probeServiceAccountEnv(): ServiceAccountProbe {
  const keyRaw = sanitizeEnvValue(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  const keyFileRaw = sanitizeEnvValue(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_FILE);
  const gacRaw = sanitizeEnvValue(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const target = describeAdminFirestoreTarget();

  const probe: ServiceAccountProbe = {
    keyDefined: Boolean(keyRaw),
    keyFileDefined: Boolean(keyFileRaw),
    gacDefined: Boolean(gacRaw),
    rawLength: (keyFileRaw || gacRaw || keyRaw).length,
    looksLikeJson: (keyRaw || '').startsWith('{'),
    looksLikePath: looksLikeFilePath(keyFileRaw || gacRaw || keyRaw),
    cwd: process.cwd(),
    projectRoot: findProjectRoot(),
    triedPaths: [],
    existingPaths: [],
    parseOk: false,
    projectIdPresent: false,
    saProjectId: target.saProjectId,
    clientProjectId: target.clientProjectId,
    projectIdMatch: target.projectIdMatch,
    databaseId: target.databaseId || '(default)',
    databaseIdSource: target.databaseIdSource,
    appletConfigPath: target.appletConfigPath,
    appletConfigExists: target.appletConfigExists,
    adminAppName: target.adminAppName,
  };

  try {
    const resolved = resolveServiceAccountDetailed();
    if (!resolved) {
      probe.error =
        'No FIREBASE_SERVICE_ACCOUNT_KEY / _FILE / GOOGLE_APPLICATION_CREDENTIALS value after sanitize.';
      return probe;
    }
    probe.triedPaths = resolved.triedPaths;
    probe.existingPaths = resolved.existingPaths;
    probe.parseOk = true;
    probe.projectIdPresent = Boolean(
      (resolved.account as ServiceAccount & { project_id?: string }).project_id
    );
    const refreshed = describeAdminFirestoreTarget(resolved.account);
    probe.saProjectId = refreshed.saProjectId;
    probe.clientProjectId = refreshed.clientProjectId;
    probe.projectIdMatch = refreshed.projectIdMatch;
    probe.databaseId = refreshed.databaseId || '(default)';
    probe.databaseIdSource = refreshed.databaseIdSource;
  } catch (err: any) {
    probe.error = err?.message || String(err);
    const pathish = keyFileRaw || gacRaw || (looksLikeFilePath(keyRaw) ? keyRaw : '');
    if (pathish) {
      probe.triedPaths = buildPathCandidates(pathish);
      probe.existingPaths = probe.triedPaths.filter((p) => existsSync(p));
    }
  }

  return probe;
}

/**
 * Shared Firebase Admin accessor for guest checkout.
 * Opens the named Firestore DB from firebase-applet-config.json (or FIREBASE_FIRESTORE_DATABASE_ID).
 */
export function getAdminDb(): Firestore {
  const appletLoaded = loadAppletFirebaseConfig();
  const detailed = (() => {
    try {
      return resolveServiceAccountDetailed();
    } catch (err: any) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_KEY unreadable: ${err?.message || err}. Use a path like ./secrets/firebase-admin.json or FIREBASE_SERVICE_ACCOUNT_KEY_FILE. Restart next dev after editing .env.local.`
      );
    }
  })();

  if (!detailed) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY is missing. Add it to .env.local (path or one-line JSON), or set FIREBASE_SERVICE_ACCOUNT_KEY_FILE. Restart next dev.'
    );
  }

  const projectId = resolveAdminProjectId(detailed.account, appletLoaded.config);
  const { databaseId, source: databaseIdSource } = resolveFirestoreDatabaseId(
    appletLoaded.config
  );

  let app: App;
  const existing = getApps().find((a) => a.name === GUEST_ADMIN_APP_NAME);
  if (existing) {
    app = existing;
  } else {
    console.info('[firebase-admin] Initializing Admin SDK for guest checkout', {
      source: detailed.source,
      usedPath: detailed.existingPaths[0] || '(json-inline)',
      projectId: projectId || '(missing)',
      clientConfigProjectId: appletLoaded.config.projectId || '(missing)',
      databaseId: databaseId || '(default)',
      databaseIdSource,
      appletConfigPath: appletLoaded.path,
      appletConfigExists: appletLoaded.exists,
      appletConfigSource: appletLoaded.source,
      cwd: process.cwd(),
      adminAppName: GUEST_ADMIN_APP_NAME,
    });

    if (
      projectId &&
      appletLoaded.config.projectId &&
      projectId !== appletLoaded.config.projectId
    ) {
      console.warn(
        '[firebase-admin] Service-account project_id does not match firebase-applet-config.json projectId.',
        {
          serviceAccountProjectId: projectId,
          clientProjectId: appletLoaded.config.projectId,
        }
      );
    }

    if (!databaseId) {
      console.warn(
        '[firebase-admin] No named firestoreDatabaseId resolved — Admin will use "(default)". If you see 5 NOT_FOUND, set FIREBASE_FIRESTORE_DATABASE_ID to the client database id.'
      );
    }

    app = initializeApp(
      {
        credential: cert(detailed.account),
        ...(projectId ? { projectId } : {}),
      },
      GUEST_ADMIN_APP_NAME
    );
  }

  // Re-read in case env changed between hot reloads while app already exists.
  const live = resolveFirestoreDatabaseId(loadAppletFirebaseConfig().config);
  console.info('[firebase-admin] getFirestore target', {
    adminAppName: GUEST_ADMIN_APP_NAME,
    projectId: projectId || getApp(GUEST_ADMIN_APP_NAME).options.projectId || '(missing)',
    databaseId: live.databaseId || '(default)',
    databaseIdSource: live.source,
  });

  return live.databaseId
    ? getFirestore(app, live.databaseId)
    : getFirestore(app);
}
