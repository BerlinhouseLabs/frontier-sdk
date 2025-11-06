import { describe, it, expect, beforeEach } from 'vitest';
import { renderStandaloneMessage, createStandaloneHTML } from '../../ui-utils/standalone';

describe('UI Utils - Standalone', () => {
  describe('renderStandaloneMessage', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    it('should render standalone message with default app name', () => {
      renderStandaloneMessage(container);

      expect(container.innerHTML).toContain('🚀 Frontier App');
      expect(container.innerHTML).toContain('Frontier Wallet Required');
      expect(container.innerHTML).toContain('wallet.frontiertower.io');
    });

    it('should render standalone message with custom app name', () => {
      renderStandaloneMessage(container, 'My Custom App');

      expect(container.innerHTML).toContain('🚀 My Custom App');
      expect(container.innerHTML).toContain('Frontier Wallet Required');
    });

    it('should include instructions for users', () => {
      renderStandaloneMessage(container);

      expect(container.innerHTML).toContain('To use this app:');
      expect(container.innerHTML).toContain('Visit');
      expect(container.innerHTML).toContain('Go to the App Store');
      expect(container.innerHTML).toContain('Install this app');
    });

    it('should include link to Frontier Wallet', () => {
      renderStandaloneMessage(container);

      expect(container.innerHTML).toContain('href="https://wallet.frontiertower.io"');
      expect(container.innerHTML).toContain('Open Frontier Wallet');
    });

    it('should have proper styling', () => {
      renderStandaloneMessage(container);

      // Check for key style properties
      expect(container.innerHTML).toContain('min-height: 100vh');
      expect(container.innerHTML).toContain('display: flex');
      expect(container.innerHTML).toContain('align-items: center');
      expect(container.innerHTML).toContain('justify-content: center');
    });

    it('should be responsive with max-width', () => {
      renderStandaloneMessage(container);

      expect(container.innerHTML).toContain('max-width: 32rem');
      expect(container.innerHTML).toContain('width: 100%');
    });

    it('should replace existing content in container', () => {
      container.innerHTML = '<p>Old content</p>';
      renderStandaloneMessage(container, 'Test App');

      expect(container.innerHTML).not.toContain('Old content');
      expect(container.innerHTML).toContain('🚀 Test App');
    });

    it('should handle special characters in app name', () => {
      renderStandaloneMessage(container, 'App & Co. <Test>');

      // Should be safely inserted (browser handles escaping)
      expect(container.querySelector('h1')).toBeTruthy();
    });
  });

  describe('createStandaloneHTML', () => {
    it('should return HTML string with default app name', () => {
      const html = createStandaloneHTML();

      expect(html).toContain('🚀 Frontier App');
      expect(html).toContain('Frontier Wallet Required');
      expect(html).toContain('wallet.frontiertower.io');
    });

    it('should return HTML string with custom app name', () => {
      const html = createStandaloneHTML('Custom App Name');

      expect(html).toContain('🚀 Custom App Name');
      expect(html).toContain('Frontier Wallet Required');
    });

    it('should include all required sections', () => {
      const html = createStandaloneHTML();

      expect(html).toContain('To use this app:');
      expect(html).toContain('Visit');
      expect(html).toContain('Go to the App Store');
      expect(html).toContain('Install this app');
      expect(html).toContain('Open Frontier Wallet');
    });

    it('should include proper styling', () => {
      const html = createStandaloneHTML();

      expect(html).toContain('min-height: 100vh');
      expect(html).toContain('display: flex');
      expect(html).toContain('max-width: 32rem');
    });

    it('should include interactive button styles', () => {
      const html = createStandaloneHTML();

      expect(html).toContain('onmouseover');
      expect(html).toContain('onmouseout');
      expect(html).toContain('transform');
    });

    it('should return valid HTML that can be parsed', () => {
      const html = createStandaloneHTML('Test');
      const container = document.createElement('div');
      container.innerHTML = html;

      // Should have main container
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toBeTruthy();

      // Should have heading
      const heading = container.querySelector('h1');
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toContain('Test');

      // Should have link
      const link = container.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('https://wallet.frontiertower.io');
    });

    it('should match output of renderStandaloneMessage', () => {
      const container = document.createElement('div');
      const appName = 'Consistency Test';

      renderStandaloneMessage(container, appName);
      const renderedHTML = container.innerHTML;

      const createdHTML = createStandaloneHTML(appName);

      // Both should contain the same key elements
      expect(renderedHTML).toContain('🚀 Consistency Test');
      expect(createdHTML).toContain('🚀 Consistency Test');
      expect(renderedHTML).toContain('Frontier Wallet Required');
      expect(createdHTML).toContain('Frontier Wallet Required');
    });
  });
});
