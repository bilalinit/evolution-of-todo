'use client';

import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState, useEffect } from 'react';
import { IS_DEVELOPMENT } from '@/lib/constants';

/**
 * ChatKit Widget Component
 * 
 * Uses the local Next.js proxy at /api/chatkit for proper auth injection.
 * Follows the chatkit-2 skill pattern.
 */
export function ChatKitWidget() {
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if ChatKit script is ready
  const scriptReady = typeof window !== 'undefined' && !!customElements.get('openai-chatkit');

  if (IS_DEVELOPMENT) {
    console.log('ChatKit: Checking script status...', {
      scriptReady,
      timestamp: new Date().toISOString()
    });
  }

  // Use local proxy pattern from chatkit-2 skill
  const { control } = useChatKit({
    api: {
      url: '/api/chatkit',  // Next.js proxy handles auth injection
      domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || 'local-dev',
    },
    // Event handlers for debugging
    onReady: () => {
      if (IS_DEVELOPMENT) {
        console.log('ChatKit: Ready to receive messages');
      }
    },
    onError: ({ error }) => {
      console.error('ChatKit: Error occurred:', error);
    },
    onResponseStart: () => {
      if (IS_DEVELOPMENT) {
        console.log('ChatKit: Agent started responding');
      }
    },
    onResponseEnd: () => {
      if (IS_DEVELOPMENT) {
        console.log('ChatKit: Agent finished responding');
      }
    },
    onThreadChange: ({ threadId }) => {
      if (IS_DEVELOPMENT) {
        console.log('ChatKit: Thread changed to:', threadId);
      }
    },
    // Optional: Customize the UI
    startScreen: {
      greeting: 'Hello! I can help you manage your tasks. What would you like to do?',
      prompts: [
        { label: 'Create a task', prompt: 'I want to create a new task' },
        { label: 'List my tasks', prompt: 'Show me my tasks' },
        { label: 'What can you do?', prompt: 'What capabilities do you have?' },
      ],
    },
    composer: {
      placeholder: 'Ask me to create, list, or update tasks...',
    },
  });

  // Check if ChatKit script is loaded using enhanced detection
  useEffect(() => {
    if (IS_DEVELOPMENT) {
      console.log('ChatKit: Starting script detection...');
    }

    const checkChatKitReady = async () => {
      if (typeof window === 'undefined') return;

      // Method 1: Check if web component is already defined
      const existingComponent = customElements.get('openai-chatkit');
      if (IS_DEVELOPMENT) {
        console.log('ChatKit: Checking for existing component...', { existingComponent: !!existingComponent });
      }

      if (existingComponent) {
        if (IS_DEVELOPMENT) {
          console.log('ChatKit: Web component already defined, ready to render');
        }
        setIsLoading(false);
        return;
      }

      // Method 2: Wait for web component to be defined (more reliable)
      if (customElements.whenDefined) {
        try {
          if (IS_DEVELOPMENT) {
            console.log('ChatKit: Using customElements.whenDefined() to wait for component...');
          }
          const component = await customElements.whenDefined('openai-chatkit');
          if (IS_DEVELOPMENT) {
            console.log('ChatKit: Web component defined successfully via whenDefined()', { component });
          }
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('ChatKit: whenDefined() failed:', error);
        }
      }

      // Method 3: Fallback - check for script element
      const scriptLoaded = document.querySelector('script[src*="chatkit.js"]');
      if (IS_DEVELOPMENT) {
        console.log('ChatKit: Script element check...', { scriptLoaded: !!scriptLoaded });
      }

      if (scriptLoaded) {
        if (IS_DEVELOPMENT) {
          console.log('ChatKit: Script element found, waiting for initialization...');
        }
        // Wait a bit longer for script to initialize
        setTimeout(() => {
          const componentNow = customElements.get('openai-chatkit');
          if (IS_DEVELOPMENT) {
            console.log('ChatKit: After timeout check...', { componentNow: !!componentNow });
          }
          if (componentNow) {
            if (IS_DEVELOPMENT) {
              console.log('ChatKit: Component initialized after script load');
            }
            setIsLoading(false);
          } else {
            console.warn('ChatKit: Script loaded but component not initialized');
            setScriptError('ChatKit script loaded but failed to initialize. Please refresh.');
          }
        }, 3000);
      } else {
        console.warn('ChatKit: Script element not found in DOM');
        if (IS_DEVELOPMENT) {
          console.log('ChatKit: All scripts on page:', Array.from(document.scripts).map(s => s.src));
        }
        setScriptError('ChatKit script not loaded. Please refresh the page.');
      }
    };

    checkChatKitReady();

    // Safety timeout - if still loading after 30 seconds, show error
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.error('ChatKit: Loading timeout after 30 seconds');
        if (IS_DEVELOPMENT) {
          console.log('ChatKit: Current component status:', customElements.get('openai-chatkit'));
        }
        setScriptError('ChatKit loading timeout. Please refresh the page.');
        setIsLoading(false);
      }
    }, 30000);

    return () => {
      clearTimeout(safetyTimer);
    };
  }, [isLoading]);

  if (scriptError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-800">ChatKit Loading Error</h3>
        <p className="text-red-600 text-sm mt-1">{scriptError}</p>
        <div>
          <p className="text-red-600 text-sm mt-2">Please ensure:</p>
          <ul className="text-red-600 text-sm mt-1 list-disc list-inside">
            <li>OPENAI_API_KEY is set in backend environment</li>
            <li>Backend server is running on port 8000</li>
            <li>ChatKit CDN script is loaded correctly</li>
            <li>Network access to OpenAI CDN</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center border border-gray-200 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ChatKit...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing chat interface...</p>
        </div>
      </div>
    );
  }

  // Debug: Log render state
  if (IS_DEVELOPMENT) {
    console.log('ChatKit: Final render check...', {
      isLoading,
      hasControl: !!control,
      componentDefined: !!customElements.get('openai-chatkit'),
      timestamp: new Date().toISOString()
    });
  }

  // Check if ChatKit web component is actually defined before rendering
  const chatKitComponentDefined = typeof window !== 'undefined' && customElements.get('openai-chatkit');

  if (!chatKitComponentDefined) {
    console.warn('ChatKit: Component not defined, showing fallback...');
    return (
      <div className="h-[600px] flex items-center justify-center border border-gray-200 rounded-lg bg-white">
        <div className="text-center">
          <p className="text-gray-600">ChatKit component not available</p>
          <p className="text-gray-400 text-sm mt-2">Please ensure the ChatKit script is loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] min-h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-white relative">
      <div className="w-full h-full min-h-[550px] relative">
        {/* @ts-ignore - ChatKit types may need adjustment */}
        <ChatKit control={control} />
      </div>
    </div>
  );
}

/**
 * ChatKit Widget with enhanced features
 */
export function EnhancedChatKitWidget() {
  const [showChat, setShowChat] = useState(false);

  if (IS_DEVELOPMENT) {
    console.log('EnhancedChatKitWidget: Render state', {
      showChat,
      componentDefined: typeof window !== 'undefined' && !!customElements.get('openai-chatkit'),
      timestamp: new Date().toISOString()
    });
  }

  return (
    <div className="w-full">
      {!showChat ? (
        <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Task Assistant</h3>
              <p className="text-sm text-gray-600 mt-1">
                Get help with your tasks using natural language. Supports English and Urdu!
              </p>
            </div>
            <button
              onClick={() => setShowChat(true)}
              className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Start Chat
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-orange-600">✓</span>
              <span>Create tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-600">✓</span>
              <span>List tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-600">✓</span>
              <span>Urdu support</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative min-h-[650px]">
          <button
            onClick={() => setShowChat(false)}
            className="absolute top-2 right-2 z-10 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Close
          </button>
          <div className="pt-10"> {/* Add padding top for close button */}
            <ChatKitWidget />
          </div>
        </div>
      )}
    </div>
  );
}