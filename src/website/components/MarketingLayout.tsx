/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Marketing Layout Shell
 */
import React from 'react';
import { MarketingNavbar } from './MarketingNavbar';
import { MarketingFooter } from './MarketingFooter';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#080C14] text-zinc-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-black">
      <MarketingNavbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
};
