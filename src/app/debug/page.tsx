

import React from 'react';

export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CSS Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-background text-foreground border rounded-lg">
          <h2 className="text-xl mb-2">Background & Text Colors</h2>
          <p>This should use background and foreground colors</p>
        </div>
        
        <div className="p-4 bg-primary text-primary-foreground rounded-lg">
          <h2 className="text-xl mb-2">Primary Colors</h2>
          <p>This should use primary colors</p>
        </div>
        
        <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
          <h2 className="text-xl mb-2">Secondary Colors</h2>
          <p>This should use secondary colors</p>
        </div>
        
        <div className="p-4 bg-muted text-muted-foreground rounded-lg">
          <h2 className="text-xl mb-2">Muted Colors</h2>
          <p>This should use muted colors</p>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Animation Tests</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="animate-blink w-8 h-8 bg-lime-500"></div>
          <div className="w-40 h-4 bg-gray-200 rounded overflow-hidden">
            <div className="animate-progress h-full bg-lime-500"></div>
          </div>
          <div className="animate-typewriter w-0 overflow-hidden whitespace-nowrap border-r-2 border-lime-500">
            This text should appear with a typewriter effect
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Custom Classes</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="phone-frame">
            <div className="phone-notch"></div>
            <div className="phone-screen bg-black p-2">
              <p className="text-white text-xs">Phone Frame Test</p>
            </div>
          </div>
          
          <div className="neon-glow p-4 text-lime-500">
            This should have a neon glow effect
          </div>
          
          <div className="neon-box-glow p-4 border border-lime-500">
            This should have a box glow effect
          </div>
        </div>
      </div>
      
      <div className="scrollable h-40 border p-4 rounded">
        <h3 className="font-bold mb-2">Scrollable Container</h3>
        {Array(20).fill(0).map((_, i) => (
          <p key={i} className="py-1">Scroll content line {i+1}</p>
        ))}
      </div>
      
      <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-sm">
        CSS Debug Page - If styled correctly, CSS is working!
      </div>
      
      {/* Client-side script to check for loaded stylesheets */}
      <script dangerouslySetInnerHTML={{
        __html: `
          setTimeout(() => {
            console.log("CSS Debug Info:");
            console.log("Stylesheets loaded:", document.styleSheets.length);
            
            // Check if specific styles are applied
            const testDiv = document.querySelector('.bg-primary');
            if (testDiv) {
              const computedStyle = window.getComputedStyle(testDiv);
              console.log("Primary background color:", computedStyle.backgroundColor);
            }
            
            // Add visible debug info
            const debugInfo = document.createElement('div');
            debugInfo.style.position = 'fixed';
            debugInfo.style.top = '4px';
            debugInfo.style.right = '4px';
            debugInfo.style.backgroundColor = 'black';
            debugInfo.style.color = 'white';
            debugInfo.style.padding = '4px 8px';
            debugInfo.style.borderRadius = '4px';
            debugInfo.style.fontSize = '12px';
            debugInfo.style.zIndex = '9999';
            debugInfo.textContent = \`Stylesheets: \${document.styleSheets.length}\`;
            document.body.appendChild(debugInfo);
          }, 1000);
        `
      }} />
    </div>
  );
}