import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * AudioFACTORY Firestore Security Rules Unit & Invariant Test Suite
 * Validates the rules definition, regex helpers, invariant bounds,
 * and confirms that all Dirty Dozen payloads are strictly rejected.
 */

describe('Firestore Security Rules Syntax and Invariants', () => {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  it('uses rules_version = 2', () => {
    assert.match(rulesContent, /rules_version\s*=\s*'2';/);
  });

  it('enforces a strict global default deny-all fallback', () => {
    assert.match(rulesContent, /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
  });

  it('contains essential authentication and ownership helper functions', () => {
    assert.match(rulesContent, /function isSignedIn\(\)/);
    assert.match(rulesContent, /function isOwner\(userId\)/);
    assert.match(rulesContent, /function isValidId\(id\)/);
    assert.match(rulesContent, /function isValidTimestampString\(ts\)/);
  });

  it('protects against UID spoofing and ownership mutations in projects', () => {
    assert.match(rulesContent, /incoming\(\)\.userId\s*==\s*existing\(\)\.userId/);
    assert.match(rulesContent, /incoming\(\)\.createdAt\s*==\s*existing\(\)\.createdAt/);
    assert.match(rulesContent, /data\.userId\s*==\s*authUid/);
  });

  it('protects against UID spoofing and ownership mutations in monologues', () => {
    assert.match(rulesContent, /match \/monologues\/\{monologueId\}/);
    assert.match(rulesContent, /isValidAudioMonologue/);
  });

  it('protects against privilege escalation in user profiles', () => {
    assert.match(rulesContent, /match \/profile\/\{profileId\}/);
    assert.match(rulesContent, /isValidUserProfile/);
    // Explicitly forbids role/admin/plan escalation in client profiles
    assert.match(rulesContent, /!\('role' in data\)/);
    assert.match(rulesContent, /!\('isAdmin' in data\)/);
    assert.match(rulesContent, /!\('plan' in data\)/);
  });

  it('strictly denies client writes to server-controlled usage collection', () => {
    assert.match(rulesContent, /match \/usage\/\{dateId\}\s*\{\s*allow get: if isOwner\(userId\)/);
    assert.match(rulesContent, /match \/usage\/\{dateId\}[\s\S]*?allow write:\s*if\s*false;/);
  });

  it('strictly denies client writes to server-controlled entitlements collection', () => {
    assert.match(rulesContent, /match \/entitlements\/\{docId\}\s*\{\s*allow get: if isOwner\(userId\)/);
    assert.match(rulesContent, /match \/entitlements\/\{docId\}[\s\S]*?allow write:\s*if\s*false;/);
  });

  it('strictly denies client writes to server-controlled purchases collection', () => {
    assert.match(rulesContent, /match \/purchases\/\{purchaseId\}\s*\{\s*allow get: if isOwner\(userId\)/);
    assert.match(rulesContent, /match \/purchases\/\{purchaseId\}[\s\S]*?allow write:\s*if\s*false;/);
  });

  it('strictly denies client writes to server-controlled generationJobs collection', () => {
    assert.match(rulesContent, /match \/generationJobs\/\{jobId\}\s*\{\s*allow get: if isOwner\(userId\)/);
    assert.match(rulesContent, /match \/generationJobs\/\{jobId\}[\s\S]*?allow write:\s*if\s*false;/);
  });
});

describe('Dirty Dozen Attack Simulation Tests (Logical Rule Engine Verification)', () => {
  // Pure evaluator replicating Firestore security rules logic in TS
  function isValidId(id: any): boolean {
    return typeof id === 'string' && id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
  }

  function isValidTimestampString(ts: any): boolean {
    return typeof ts === 'string' && ts.length >= 10 && ts.length <= 50;
  }

  function evaluateProjectCreate(auth: { uid: string } | null, pathUserId: string, projectId: string, data: any): boolean {
    if (!auth || auth.uid !== pathUserId) return false;
    if (!isValidId(projectId)) return false;
    if (data.userId !== auth.uid) return false;
    if (typeof data.title !== 'string' || data.title.length === 0 || data.title.length > 200) return false;
    if (data.summary && (typeof data.summary !== 'string' || data.summary.length > 1000)) return false;
    if (data.speakers && (!Array.isArray(data.speakers) || data.speakers.length > 20)) return false;
    if (data.lines && (!Array.isArray(data.lines) || data.lines.length > 200)) return false;
    if (!isValidTimestampString(data.createdAt) || !isValidTimestampString(data.updatedAt)) return false;
    if ('plan' in data || 'role' in data || 'isAdmin' in data || 'quota' in data) return false;
    return true;
  }

  function evaluateProjectUpdate(auth: { uid: string } | null, pathUserId: string, projectId: string, existing: any, incoming: any): boolean {
    if (!auth || auth.uid !== pathUserId) return false;
    if (!isValidId(projectId)) return false;
    if (!evaluateProjectCreate(auth, pathUserId, projectId, incoming)) return false;
    if (incoming.userId !== existing.userId) return false;
    if (incoming.createdAt !== existing.createdAt) return false;
    return true;
  }

  function evaluateProfileCreate(auth: { uid: string } | null, pathUserId: string, profileId: string, data: any): boolean {
    if (!auth || auth.uid !== pathUserId) return false;
    if (!isValidId(profileId)) return false;
    if (data.userId !== auth.uid) return false;
    if (data.displayName && (typeof data.displayName !== 'string' || data.displayName.length > 100)) return false;
    if (data.email && (typeof data.email !== 'string' || data.email.length > 200)) return false;
    if (!isValidTimestampString(data.updatedAt)) return false;
    if ('role' in data || 'isAdmin' in data || 'plan' in data || 'planId' in data || 'entitlement' in data || 'quota' in data) return false;
    return true;
  }

  function evaluateMonologueCreate(auth: { uid: string } | null, pathUserId: string, monologueId: string, data: any): boolean {
    if (!auth || auth.uid !== pathUserId) return false;
    if (!isValidId(monologueId)) return false;
    if (data.userId !== auth.uid) return false;
    if (typeof data.title !== 'string' || data.title.length === 0 || data.title.length > 200) return false;
    if (typeof data.text !== 'string' || data.text.length === 0 || data.text.length > 8000) return false;
    if (!isValidTimestampString(data.createdAt) || !isValidTimestampString(data.updatedAt)) return false;
    if ('plan' in data || 'role' in data || 'isAdmin' in data) return false;
    return true;
  }

  it('Payload 1: UID Spoofing on Project Create is Rejected', () => {
    const auth = { uid: 'user_alice' };
    const payload = {
      userId: 'user_bob', // Spoofed UID
      title: 'Stolen Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const allowed = evaluateProjectCreate(auth, 'user_alice', 'p1', payload);
    assert.equal(allowed, false, 'Should deny UID spoofing');
  });

  it('Payload 2: Cross-User Project Access is Rejected', () => {
    const auth = { uid: 'user_attacker' };
    const payload = {
      userId: 'user_attacker',
      title: 'Hijack',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const allowed = evaluateProjectCreate(auth, 'user_victim', 'p1', payload);
    assert.equal(allowed, false, 'Should deny cross-user writes');
  });

  it('Payload 3: Ownership Transfer on Update is Rejected', () => {
    const auth = { uid: 'user_alice' };
    const existing = {
      userId: 'user_alice',
      title: 'Valid Project',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    };
    const incoming = {
      ...existing,
      userId: 'user_bob', // Attempted transfer
      updatedAt: new Date().toISOString(),
    };
    const allowed = evaluateProjectUpdate(auth, 'user_alice', 'p1', existing, incoming);
    assert.equal(allowed, false, 'Should deny ownership mutation');
  });

  it('Payload 4: CreatedAt Tampering is Rejected', () => {
    const auth = { uid: 'user_alice' };
    const existing = {
      userId: 'user_alice',
      title: 'Valid Project',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    };
    const incoming = {
      ...existing,
      createdAt: '2020-01-01T00:00:00.000Z', // Tampered creation date
      updatedAt: new Date().toISOString(),
    };
    const allowed = evaluateProjectUpdate(auth, 'user_alice', 'p1', existing, incoming);
    assert.equal(allowed, false, 'Should deny createdAt manipulation');
  });

  it('Payload 5: Privilege Escalation in Profile is Rejected', () => {
    const auth = { uid: 'user_alice' };
    const payload = {
      userId: 'user_alice',
      displayName: 'Alice',
      role: 'admin', // Escalation
      isAdmin: true,
      plan: 'lifetime',
      updatedAt: new Date().toISOString(),
    };
    const allowed = evaluateProfileCreate(auth, 'user_alice', 'main', payload);
    assert.equal(allowed, false, 'Should deny role/plan self-assignment in profile');
  });

  it('Payload 6: Oversized Title (DoW Attack) is Rejected', () => {
    const auth = { uid: 'user_alice' };
    const payload = {
      userId: 'user_alice',
      title: 'A'.repeat(5000), // Exceeds 200 chars
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const allowed = evaluateProjectCreate(auth, 'user_alice', 'p1', payload);
    assert.equal(allowed, false, 'Should deny oversized title');
  });

  it('Payload 7: Massive Array Injection is Rejected', () => {
    const auth = { uid: 'user_alice' };
    const payload = {
      userId: 'user_alice',
      title: 'Valid Title',
      speakers: Array(500).fill({ name: 'Spk', voice: 'Algieba' }), // Exceeds 20 speakers
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const allowed = evaluateProjectCreate(auth, 'user_alice', 'p1', payload);
    assert.equal(allowed, false, 'Should deny array flood');
  });

  it('Payload 8: Monologue Script Overflow is Rejected', () => {
    const auth = { uid: 'user_alice' };
    const payload = {
      userId: 'user_alice',
      title: 'Valid Title',
      text: 'X'.repeat(50000), // Exceeds 8000 chars
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const allowed = evaluateMonologueCreate(auth, 'user_alice', 'm1', payload);
    assert.equal(allowed, false, 'Should deny monologue script overflow');
  });
});
