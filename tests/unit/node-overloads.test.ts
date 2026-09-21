// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { CspAlert } from '../../src/core/CspAlert';

describe('Browser-free overloads', () => {
  it('resolves CspAlert.fire(string) without DOM globals', async () => {
    const result = await CspAlert.fire('Test');
    expect(result.isDismissed).toBe(true);
  });

  it('resolves mixin.fire(string) without DOM globals and shares the base lifecycle contract', async () => {
    const Preset = CspAlert.mixin({ title: 'Preset' });
    const result = await Preset.fire('Test');
    expect(result.isDismissed).toBe(true);
  });
});
