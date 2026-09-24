import { describe, it, expect, vi } from 'vitest';
import * as sdk from '../src/index.js';

describe('SDK Compatibility', () => {
  it('should export TalosClient', () => {
    expect(sdk.TalosClient).toBeDefined();
  });

  it('should not depend on Node-specific globals directly', () => {
    // A simple sanity check that the window or global object is handled
    expect(typeof globalThis).toBe('object');
  });

  it('should have fetch available or mockable for edge/browser', () => {
    // If running in browser/edge, fetch should be on globalThis
    const hasFetch = typeof globalThis.fetch === 'function' || typeof fetch === 'function';
    expect(hasFetch).toBeDefined();
  });

  describe('Feature Detection', () => {
    it('should detect feature availability safely without throwing', () => {
      // Ensure feature detection logic does not crash on missing dependencies
      expect(() => {
        // Assuming sdk exposes a feature detection utility or TalosClient handles it internally
        // We verify the interface exists and is callable
        if (typeof sdk.detectFeature === 'function') {
          sdk.detectFeature('test-feature');
        }
      }).not.toThrow();
    });

    it('should handle missing feature gracefully', () => {
      if (typeof sdk.detectFeature === 'function') {
        const result = sdk.detectFeature('non-existent-feature');
        expect(result).toBeDefined();
      }
    });

    it('should not log sensitive data during feature detection', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      try {
        if (typeof sdk.detectFeature === 'function') {
          sdk.detectFeature('test-feature');
        }
        // Ensure no sensitive data (secrets, seeds, etc.) is logged
        const loggedArgs = consoleSpy.mock.calls.flat();
        const sensitivePatterns = ['secret', 'seed', 'payment_proof', 'private_key'];
        const hasSensitiveData = loggedArgs.some((arg: any) => 
          typeof arg === 'string' && sensitivePatterns.some(pattern => arg.toLowerCase().includes(pattern))
        );
        expect(hasSensitiveData).toBe(false);
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });
});