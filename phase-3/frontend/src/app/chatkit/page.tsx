/**
 * ChatKit Integration Page
 *
 * OpenAI ChatKit integration with dual-agent support (Orchestrator + UrduSpecialist)
 * Features: ChatKit UI, session management, thread persistence, MCP tools
 */

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, useAuth } from "@/lib/auth/hooks";
import { EnhancedChatKitWidget } from "@/components/chat/ChatKitWidget";
import { Button } from "@/components/ui/Button";
import { Bot, Shield, Database, Globe, Home } from "lucide-react";
import { IS_DEVELOPMENT } from "@/lib/constants";

export default function ChatKitPage() {
  const { user } = useSession();
  const { signOut, isSigningOut } = useAuth();
  const [chatkitReady, setChatkitReady] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowMenu(false);
  };

  // Debug logging (safe for server-side rendering)
  if (IS_DEVELOPMENT) {
    console.log('ChatKit page: Render state', {
      user: !!user,
      chatkitReady,
      componentDefined: typeof window !== 'undefined' && !!customElements.get('openai-chatkit'),
      scriptElement: typeof window !== 'undefined' && !!document.querySelector('script[src*="chatkit.js"]'),
      allScripts: typeof window !== 'undefined' ? Array.from(document.scripts).map(s => s.src).filter(s => s.includes('chatkit')) : []
    });
  }

  useEffect(() => {
    // Check if ChatKit script is available using web components
    const checkChatKit = () => {
      if (typeof window !== 'undefined') {
        // Use web components detection (correct method for ChatKit)
        const chatkitLoaded =
          (typeof window !== 'undefined' && customElements.get('openai-chatkit')) ||
          (typeof window !== 'undefined' && document.querySelector('script[src*="chatkit.js"]'));

        if (chatkitLoaded) {
          if (IS_DEVELOPMENT) {
            console.log('ChatKit page: Script detected', {
              componentDefined: typeof window !== 'undefined' && !!customElements.get('openai-chatkit'),
              scriptElement: typeof window !== 'undefined' && !!document.querySelector('script[src*="chatkit.js"]')
            });
          }
          setChatkitReady(true);
        } else {
          if (IS_DEVELOPMENT) {
            console.log('ChatKit page: Script not found, loading dynamically...');
          }
          // Try to load ChatKit script dynamically
          const script = document.createElement('script');
          script.src = 'https://cdn.platform.openai.com/deployments/chatkit/chatkit.js';
          script.async = true;
          script.onload = () => {
            if (IS_DEVELOPMENT) {
              console.log('ChatKit page: Script loaded successfully');
            }
            setChatkitReady(true);
          };
          script.onerror = (error) => {
            console.error('Failed to load ChatKit script:', error);
            if (IS_DEVELOPMENT) {
              console.log('This might be due to:');
              console.log('1. Network issues blocking CDN');
              console.log('2. Browser extensions blocking the script');
              console.log('3. CORS issues');
              console.log('Current domain:', window.location.hostname);
            }
          };

          // Add manual test function to window for debugging
          if (IS_DEVELOPMENT) {
            (window as any).testChatKit = () => {
              console.log('Manual ChatKit test:');
              console.log('1. Script element:', document.querySelector('script[src*="chatkit.js"]'));
              console.log('2. Web component:', customElements.get('openai-chatkit'));
              console.log('3. All scripts:', Array.from(document.scripts).map(s => s.src));
              console.log('4. customElements.whenDefined:', typeof customElements.whenDefined);
            };
            console.log('Run testChatKit() in console for manual debugging');
          }
          document.body.appendChild(script);
        }
      }
    };

    checkChatKit();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo / Home Link */}
          <button
            onClick={() => {
              // Hard reload to tasks page
              window.location.href = '/tasks';
            }}
            className="text-xl font-serif font-bold text-foreground hover:text-accent transition-colors cursor-pointer bg-none border-none p-0"
          >
            PlanStack
          </button>

          {/* Navigation and User Menu */}
          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => {
                  // Hard reload to tasks page
                  window.location.href = '/tasks';
                }}
                className="text-sm font-medium text-foreground hover:text-accent transition-colors cursor-pointer bg-none border-none p-0"
              >
                Tasks
              </button>
              <Link
                href="/chatkit"
                className="text-sm font-medium text-accent transition-colors font-bold"
              >
                Agents
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                Profile
              </Link>
            </nav>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2"
                >
                  <span className="hidden sm:inline">{user.name || "User"}</span>
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </span>
                </Button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isSigningOut}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {isSigningOut ? "Signing out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-2 flex gap-4">
            <button
              onClick={() => {
                // Hard reload to tasks page
                window.location.href = '/tasks';
              }}
              className="text-sm font-medium text-foreground hover:text-accent transition-colors py-2 cursor-pointer bg-none border-none p-0"
            >
              Tasks
            </button>
            <Link
              href="/chatkit"
              className="text-sm font-medium text-accent transition-colors py-2 font-bold"
            >
              Agents
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors py-2"
            >
              Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#2A1B12]">
              ChatKit Integration
            </h1>
            <p className="font-sans text-[#5C4D45] mt-1">
              OpenAI ChatKit with dual-agent system and MCP tools
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                // Hard reload to tasks page
                window.location.href = '/tasks';
              }}
            >
              <Home className="w-4 h-4 mr-2" strokeWidth={2} />
              Back to Tasks
            </Button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 bg-[#F0EBE0] px-4 py-3 rounded border border-[#2A1B12]/10">
            <Shield className="w-5 h-5 text-[#FF6B4A]" />
            <div>
              <div className="font-mono font-bold text-sm">Auth</div>
              <div className="text-xs text-[#5C4D45]">{user ? "Logged in" : "Guest"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#F0EBE0] px-4 py-3 rounded border border-[#2A1B12]/10">
            <Database className="w-5 h-5 text-[#FF6B4A]" />
            <div>
              <div className="font-mono font-bold text-sm">Storage</div>
              <div className="text-xs text-[#5C4D45]">PostgreSQL</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#F0EBE0] px-4 py-3 rounded border border-[#2A1B12]/10">
            <Bot className="w-5 h-5 text-[#FF6B4A]" />
            <div>
              <div className="font-mono font-bold text-sm">Agents</div>
              <div className="text-xs text-[#5C4D45]">Orchestrator + Urdu</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#F0EBE0] px-4 py-3 rounded border border-[#2A1B12]/10">
            <Globe className="w-5 h-5 text-[#FF6B4A]" />
            <div>
              <div className="font-mono font-bold text-sm">Status</div>
              <div className="text-xs text-[#5C4D45]">
                {chatkitReady ? "Ready" : "Loading..."}
              </div>
            </div>
          </div>
        </div>

        {/* ChatKit Widget or Auth Prompt */}
        <div className="mb-6">
          {!user ? (
            <div className="text-center py-12 bg-[#F0EBE0] border border-[#2A1B12]/10 rounded-lg">
              <h2 className="font-serif text-xl font-bold text-[#2A1B12] mb-2">
                Authentication Required
              </h2>
              <p className="text-[#5C4D45] mb-4">
                Please sign in to use the ChatKit integration
              </p>
              <a
                href="/login"
                className="inline-block px-6 py-2 bg-[#FF6B4A] text-white font-mono rounded hover:bg-[#E55A3D] transition-colors"
              >
                Sign In
              </a>
            </div>
          ) : !chatkitReady ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-[#5C4D45]">Loading ChatKit...</p>
            </div>
          ) : (
            <div className="min-h-[600px] bg-[#F9F7F2] rounded-lg border border-[#2A1B12]/10 overflow-hidden">
              <EnhancedChatKitWidget />
            </div>
          )}
        </div>

        {/* Features and Commands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#F0EBE0] p-6 rounded-lg border border-[#2A1B12]/10">
            <h3 className="font-mono font-bold text-sm mb-3 text-[#2A1B12]">
              Features
            </h3>
            <ul className="text-sm text-[#5C4D45] space-y-2 font-mono">
              <li>• Thread persistence in PostgreSQL</li>
              <li>• User data isolation</li>
              <li>• Dual-agent routing (Orchestrator → Urdu)</li>
              <li>• MCP tool integration</li>
              <li>• Session management</li>
            </ul>
          </div>
          <div className="bg-[#F0EBE0] p-6 rounded-lg border border-[#2A1B12]/10">
            <h3 className="font-mono font-bold text-sm mb-3 text-[#2A1B12]">
              Try These Commands
            </h3>
            <ul className="text-sm text-[#5C4D45] space-y-2 font-mono">
              <li>• "Create a task for tomorrow"</li>
              <li>• "Show my pending tasks"</li>
              <li>• "میرے ٹاسک دکھاؤ" (Urdu)</li>
              <li>• "Update task [id] to completed"</li>
              <li>• "Delete task [id]"</li>
            </ul>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 bg-[#F0EBE0] p-4 rounded-lg border border-[#2A1B12]/10">
          <div className="text-xs font-mono text-[#5C4D45] flex flex-wrap items-center justify-between gap-2">
            <span>ChatKit v1.5.3 | OpenAI GPT-4o | MCP Tools</span>
            <span>Thread persistence: PostgreSQL</span>
          </div>
        </div>
      </main>
    </div>
  );
}