/**
 * Render a standalone message when app is not running in Frontier Wallet
 * @param container - The HTML element to render into
 * @param appName - Optional custom app name (defaults to "Frontier App")
 */
export function renderStandaloneMessage(
  container: HTMLElement,
  appName: string = 'Frontier App'
): void {
  container.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        max-width: 32rem;
        width: 100%;
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      ">
        <h1 style="
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: #1a202c;
        ">
          🚀 ${appName}
        </h1>
        
        <div style="
          background: #f7fafc;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
        ">
          <h2 style="
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #2d3748;
          ">
            Frontier Wallet Required
          </h2>
          <p style="
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 1rem;
          ">
            This is a Frontier App and needs to be opened within the Frontier Wallet.
          </p>
          <p style="
            color: #4a5568;
            font-weight: 600;
            margin-bottom: 0.5rem;
          ">
            To use this app:
          </p>
          <ol style="
            margin-left: 1.5rem;
            color: #4a5568;
            line-height: 1.8;
          ">
            <li>Visit <a href="https://wallet.frontiertower.io" style="color: #667eea; text-decoration: underline; font-weight: 500;">wallet.frontiertower.io</a></li>
            <li>Go to the App Store</li>
            <li>Install this app</li>
          </ol>
        </div>
        
        <div style="
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        ">
          <a 
            href="https://wallet.frontiertower.io" 
            style="
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 0.75rem 2rem;
              border-radius: 0.5rem;
              text-decoration: none;
              font-weight: 600;
              transition: transform 0.2s;
            "
            onmouseover="this.style.transform='scale(1.05)'"
            onmouseout="this.style.transform='scale(1)'"
          >
            Open Frontier Wallet
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create a standalone message element (returns HTML string)
 * @param appName - Optional custom app name (defaults to "Frontier App")
 */
export function createStandaloneHTML(appName: string = 'Frontier App'): string {
  return `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        max-width: 32rem;
        width: 100%;
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      ">
        <h1 style="
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: #1a202c;
        ">
          🚀 ${appName}
        </h1>
        
        <div style="
          background: #f7fafc;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
        ">
          <h2 style="
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #2d3748;
          ">
            Frontier Wallet Required
          </h2>
          <p style="
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 1rem;
          ">
            This is a Frontier App and needs to be opened within the Frontier Wallet.
          </p>
          <p style="
            color: #4a5568;
            font-weight: 600;
            margin-bottom: 0.5rem;
          ">
            To use this app:
          </p>
          <ol style="
            margin-left: 1.5rem;
            color: #4a5568;
            line-height: 1.8;
          ">
            <li>Visit <a href="https://wallet.frontiertower.io" style="color: #667eea; text-decoration: underline; font-weight: 500;">wallet.frontiertower.io</a></li>
            <li>Go to the App Store</li>
            <li>Install this app</li>
          </ol>
        </div>
        
        <div style="
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        ">
          <a 
            href="https://wallet.frontiertower.io" 
            style="
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 0.75rem 2rem;
              border-radius: 0.5rem;
              text-decoration: none;
              font-weight: 600;
              transition: transform 0.2s;
            "
            onmouseover="this.style.transform='scale(1.05)'"
            onmouseout="this.style.transform='scale(1)'"
          >
            Open Frontier Wallet
          </a>
        </div>
      </div>
    </div>
  `;
}
