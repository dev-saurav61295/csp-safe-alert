import { describe, it, expect } from 'vitest';
import { TimerEngine } from '../../src/utils/timer';

describe('TimerEngine', () => {
  it('tracks elapsed time, stops, resumes, and calculates remaining time correctly', async () => {
    let expired = false;
    const timer = new TimerEngine({
      duration: 100,
      onExpire: () => {
        expired = true;
      },
    });

    timer.start();
    expect(timer.running()).toBe(true);

    await new Promise((r) => setTimeout(r, 30));
    const left1 = timer.getRemaining();
    expect(left1).toBeLessThanOrEqual(90);

    // Stop timer
    const leftOnStop = timer.stop();
    expect(timer.running()).toBe(false);

    await new Promise((r) => setTimeout(r, 40));
    // Time should remain unchanged while stopped
    expect(timer.getRemaining()).toBe(leftOnStop);

    // Resume timer
    timer.resume();
    expect(timer.running()).toBe(true);

    await new Promise((r) => setTimeout(r, leftOnStop + 50));
    expect(expired).toBe(true);

    timer.destroy();
  });

  it('increases timer duration', async () => {
    const timer = new TimerEngine({ duration: 50 });
    timer.start();

    await new Promise((r) => setTimeout(r, 20));
    const newRemaining = timer.increase(100);

    expect(newRemaining).toBeGreaterThanOrEqual(100);

    timer.destroy();
  });
});
