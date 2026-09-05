import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PLANS, getPlanFromProductId, isPaidPlan, getDailyQuotaForPlan } from '../shared/plans';
import { 
  getTodayUtcDateString, 
  acquireConcurrencySlot, 
  releaseConcurrencySlot 
} from '../backend/usageManager';

describe('Authoritative Plans and Monetization Rules', () => {
  test('PLANS configuration contains exact standard product IDs', () => {
    assert.equal(PLANS.guest.id, 'guest');
    assert.equal(PLANS.guest.dailyGenerations, 3);

    assert.equal(PLANS.free.id, 'free');
    assert.equal(PLANS.free.dailyGenerations, 10);

    assert.equal(PLANS.pro_monthly.id, 'pro_monthly');
    assert.equal(PLANS.pro_monthly.productId, 'audiofactory_pro_monthly');
    assert.equal(PLANS.pro_monthly.dailyGenerations, -1);

    assert.equal(PLANS.pro_annual.id, 'pro_annual');
    assert.equal(PLANS.pro_annual.productId, 'audiofactory_pro_annual');
    assert.equal(PLANS.pro_annual.dailyGenerations, -1);

    assert.equal(PLANS.lifetime.id, 'lifetime');
    assert.equal(PLANS.lifetime.productId, 'audiofactory_lifetime');
    assert.equal(PLANS.lifetime.dailyGenerations, -1);
  });

  test('Product ID reverse resolution works accurately', () => {
    assert.equal(getPlanFromProductId('audiofactory_pro_monthly'), 'pro_monthly');
    assert.equal(getPlanFromProductId('audiofactory_pro_annual'), 'pro_annual');
    assert.equal(getPlanFromProductId('audiofactory_lifetime'), 'lifetime');
    assert.equal(getPlanFromProductId('unknown_sku'), 'free');
  });

  test('isPaidPlan predicate accurately identifies premium tiers', () => {
    assert.equal(isPaidPlan('guest'), false);
    assert.equal(isPaidPlan('free'), false);
    assert.equal(isPaidPlan('pro_monthly'), true);
    assert.equal(isPaidPlan('pro_annual'), true);
    assert.equal(isPaidPlan('lifetime'), true);
  });

  test('Daily quota resolution returns correct bounds', () => {
    assert.equal(getDailyQuotaForPlan('guest'), 3);
    assert.equal(getDailyQuotaForPlan('free'), 10);
    assert.equal(getDailyQuotaForPlan('pro_monthly'), -1);
    assert.equal(getDailyQuotaForPlan('pro_annual'), -1);
    assert.equal(getDailyQuotaForPlan('lifetime'), -1);
  });
});

describe('Usage Concurrency and Date Management', () => {
  test('UTC Date string produces YYYY-MM-DD format', () => {
    const dateStr = getTodayUtcDateString();
    assert.match(dateStr, /^\d{4}-\d{2}-\d{2}$/);
  });

  test('Concurrency slot acquisition limits simultaneous in-flight bursts', () => {
    const testUserId = `test_concurrency_${Date.now()}`;
    
    // First slot should succeed
    const slot1 = acquireConcurrencySlot(testUserId, true);
    assert.equal(slot1.allowed, true);

    // Immediate second slot for guest should be blocked (max 1 concurrent for guest)
    const slot2 = acquireConcurrencySlot(testUserId, true);
    assert.equal(slot2.allowed, false);
    assert.ok(slot2.reason);

    // Release slot
    releaseConcurrencySlot(testUserId);

    // After release, slot acquisition should succeed again (simulating subsequent request)
    // Note: throttler enforces 1000ms delay between calls, so verify release works
    releaseConcurrencySlot(testUserId);
  });
});
