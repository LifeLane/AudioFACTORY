/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY CI Quality & Verification Test Suite
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { PLANS, getPlanFromProductId, isPaidPlan, resolveEntitlement } from '../shared/plans';
import { PRODUCT_IDS } from '../shared/types';

test('Plan Configuration Sanity Check', () => {
  assert.ok(PLANS.guest, 'Guest plan must exist');
  assert.ok(PLANS.free, 'Free plan must exist');
  assert.ok(PLANS.pro_monthly, 'Pro Monthly plan must exist');
  assert.ok(PLANS.pro_annual, 'Pro Annual plan must exist');
  assert.ok(PLANS.lifetime, 'Lifetime plan must exist');

  assert.equal(PLANS.guest.dailyGenerations, 3);
  assert.equal(PLANS.free.dailyGenerations, 10);
  assert.equal(PLANS.pro_monthly.dailyGenerations, -1);
  assert.equal(PLANS.pro_annual.dailyGenerations, -1);
  assert.equal(PLANS.lifetime.dailyGenerations, -1);
});

test('Product ID Resolution', () => {
  assert.equal(getPlanFromProductId(PRODUCT_IDS.PRO_MONTHLY), 'pro_monthly');
  assert.equal(getPlanFromProductId(PRODUCT_IDS.PRO_ANNUAL), 'pro_annual');
  assert.equal(getPlanFromProductId(PRODUCT_IDS.LIFETIME), 'lifetime');
  assert.equal(getPlanFromProductId(null), 'free');
  assert.equal(getPlanFromProductId('unknown'), 'free');
});

test('Paid Plan Predicate', () => {
  assert.equal(isPaidPlan('guest'), false);
  assert.equal(isPaidPlan('free'), false);
  assert.equal(isPaidPlan('pro_monthly'), true);
  assert.equal(isPaidPlan('pro_annual'), true);
  assert.equal(isPaidPlan('lifetime'), true);
});

test('Entitlement Resolution & Quotas', () => {
  const freeEntitlement = resolveEntitlement('free', 3);
  assert.equal(freeEntitlement.plan, 'free');
  assert.equal(freeEntitlement.dailyQuota, 10);
  assert.equal(freeEntitlement.remainingQuota, 7);
  assert.equal(freeEntitlement.isActive, true);

  const proEntitlement = resolveEntitlement('pro_monthly', 250);
  assert.equal(proEntitlement.plan, 'pro_monthly');
  assert.equal(proEntitlement.dailyQuota, -1);
  assert.equal(proEntitlement.remainingQuota, -1);
  assert.equal(proEntitlement.features.unlimitedGenerations, true);
  assert.equal(proEntitlement.features.instantVoiceCloning, true);
});
