# ChatKit Tool Integration

## Overview

Tool integration allows ChatKit to interact with browser APIs, external services, and your application's UI. This enables rich, interactive AI experiences beyond simple text responses.

**Two types of tools:**
1. **Client-side tools** (`onClientTool`) - Run in browser, called by AI
2. **Composer tools** - UI buttons users click to trigger actions

**Works perfectly with OpenAI Agents SDK** - your agent can call tools, ChatKit handles the execution.

---

## Client-Side Tools (`onClientTool`)

### Basic Setup

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

function MyChat() {
  const { control } = useChatKit({
    api: {
      url: 'http://localhost:8000/api/chatkit',
      domainKey: 'localhost',
    },
    onClientTool: async (toolCall) => {
      const { name, params } = toolCall;

      // Handle different tools
      switch (name) {
        case 'send_email':
          return await handleSendEmail(params);

        case 'show_modal':
          return await handleShowModal(params);

        case 'get_geolocation':
          return await handleGeolocation();

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    },
  });

  return <ChatKit control={control} className="h-[600px]" />;
}
```

### Common Tool Patterns

#### 1. Email Integration
```typescript
onClientTool: async ({ name, params }) => {
  if (name === 'send_email') {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        body: params.body,
      }),
    });

    return { success: response.ok, messageId: response.id };
  }
}
```

#### 2. Modal/Dialog Management
```typescript
function ChatWithModals() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const { control } = useChatKit({
    onClientTool: async ({ name, params }) => {
      if (name === 'show_modal') {
        setModalContent(params.content);
        setModalOpen(true);
        return { success: true };
      }

      if (name === 'close_modal') {
        setModalOpen(false);
        return { success: true };
      }
    },
  });

  return (
    <>
      <ChatKit control={control} />
      {modalOpen && (
        <div className="modal">
          <p>{modalContent}</p>
          <button onClick={() => setModalOpen(false)}>Close</button>
        </div>
      )}
    </>
  );
}
```

#### 3. Browser APIs (Geolocation, Clipboard, etc.)
```typescript
onClientTool: async ({ name, params }) => {
  switch (name) {
    case 'get_geolocation':
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
          (err) => reject({ error: err.message })
        );
      });

    case 'get_clipboard':
      try {
        const text = await navigator.clipboard.readText();
        return { content: text };
      } catch (error) {
        return { error: 'Clipboard access denied' };
      }

    case 'copy_to_clipboard':
      try {
        await navigator.clipboard.writeText(params.text);
        return { success: true };
      } catch (error) {
        return { error: 'Clipboard write failed' };
      }

    case 'open_url':
      window.open(params.url, '_blank', 'noopener');
      return { success: true };
  }
}
```

#### 4. File System Access
```typescript
onClientTool: async ({ name, params }) => {
  if (name === 'read_file') {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'Text Files',
          accept: { 'text/plain': ['.txt', '.md', '.json'] },
        }],
      });
      const file = await handle.getFile();
      const content = await file.text();
      return { content, name: file.name, size: file.size };
    } catch (error) {
      return { error: 'File selection cancelled' };
    }
  }

  if (name === 'download_file') {
    const blob = new Blob([params.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = params.filename || 'download.txt';
    a.click();
    URL.revokeObjectURL(url);
    return { success: true };
  }
}
```

#### 5. Local Storage & State Management
```typescript
onClientTool: async ({ name, params }) => {
  switch (name) {
    case 'save_preference':
      localStorage.setItem(`pref_${params.key}`, JSON.stringify(params.value));
      return { success: true };

    case 'load_preference':
      const value = localStorage.getItem(`pref_${params.key}`);
      return value ? JSON.parse(value) : null;

    case 'clear_preferences':
      Object.keys(localStorage)
        .filter(key => key.startsWith('pref_'))
        .forEach(key => localStorage.removeItem(key));
      return { success: true };
  }
}
```

#### 6. External API Calls (from browser)
```typescript
onClientTool: async ({ name, params }) => {
  if (name === 'fetch_weather') {
    const response = await fetch(
      `https://api.weather.gov/points/${params.lat},${params.lon}`
    );
    const data = await response.json();
    return data;
  }

  if (name === 'search_google') {
    // Note: This opens a new tab - actual search requires backend API
    window.open(`https://www.google.com/search?q=${encodeURIComponent(params.query)}`);
    return { success: true };
  }
}
```

#### 7. System Notifications
```typescript
onClientTool: async ({ name, params }) => {
  if (name === 'show_notification') {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(params.title || 'ChatKit', {
          body: params.message,
          icon: params.icon,
        });
        return { success: true };
      }
      return { error: 'Notification permission denied' };
    }
    return { error: 'Notifications not supported' };
  }
}
```

#### 8. Audio/Video Control
```typescript
onClientTool: async ({ name, params }) => {
  if (name === 'play_sound') {
    const audio = new Audio(params.url);
    await audio.play();
    return { success: true };
  }

  if (name === 'speak_text') {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(params.text);
      utterance.rate = params.rate || 1;
      utterance.pitch = params.pitch || 1;
      window.speechSynthesis.speak(utterance);
      return { success: true };
    }
    return { error: 'Speech synthesis not supported' };
  }
}
```

---

## Composer Tools (UI Buttons)

### Basic Configuration

```typescript
const { control } = useChatKit({
  composer: {
    tools: [
      {
        id: 'general',
        label: 'General Chat',
        shortLabel: 'Chat',
        icon: 'sparkle',
        placeholderOverride: 'Ask me anything...',
        pinned: true,
      },
      {
        id: 'code',
        label: 'Code Assistant',
        shortLabel: 'Code',
        icon: 'square-code',
        placeholderOverride: 'Describe what code you need...',
        pinned: true,
      },
    ],
  },
});
```

### Tool Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the tool |
| `label` | string | Full display text |
| `shortLabel` | string | Short text for compact UI |
| `icon` | string | Icon name (see available icons) |
| `placeholderOverride` | string | Custom placeholder when selected |
| `pinned` | boolean | Always visible vs dropdown |

### Common Tool Sets

#### Development Tools
```typescript
composer: {
  tools: [
    {
      id: 'debug',
      label: 'Debug Mode',
      shortLabel: 'Debug',
      icon: 'bug',
      placeholderOverride: 'Describe the bug...',
      pinned: true,
    },
    {
      id: 'refactor',
      label: 'Refactor Code',
      shortLabel: 'Refactor',
      icon: 'wand',
      placeholderOverride: 'What should I refactor?',
      pinned: false,
    },
    {
      id: 'review',
      label: 'Code Review',
      shortLabel: 'Review',
      icon: 'checklist',
      placeholderOverride: 'Paste code for review...',
      pinned: false,
    },
  ],
}
```

#### Data Analysis Tools
```typescript
composer: {
  tools: [
    {
      id: 'analyze',
      label: 'Analyze Data',
      shortLabel: 'Analyze',
      icon: 'chart',
      placeholderOverride: 'What data should I analyze?',
      pinned: true,
    },
    {
      id: 'visualize',
      label: 'Create Charts',
      shortLabel: 'Visualize',
      icon: 'graph',
      placeholderOverride: 'Describe the chart you want...',
      pinned: false,
    },
    {
      id: 'search',
      label: 'Search Documents',
      shortLabel: 'Search',
      icon: 'search',
      placeholderOverride: 'What are you looking for?',
      pinned: true,
    },
  ],
}
```

---

## Custom Actions (Server Communication)

### Sending Actions to Backend

```typescript
const { control } = useChatKit({
  api: { clientToken },
});

// Send custom action to server
await control.ref.current?.sendCustomAction({
  type: 'refresh_dashboard',
  payload: { page: 'settings' },
});

// With widget context
await control.ref.current?.sendCustomAction(
  {
    type: 'request_approved',
    payload: { requestId: '123' },
  },
  widgetId,
);
```

### Backend Handling (OpenAI Agents SDK Integration)

```python
# In your ChatKitServer implementation
class ChatKitServerImpl(ChatKitServer):
    async def respond(self, thread, input, context):
        # Check for custom actions
        if hasattr(input, 'custom_action'):
            action = input.custom_action
            if action.type == 'refresh_dashboard':
                await self.handle_dashboard_refresh(action.payload)
                return

        # Normal agent flow
        agent = Agent(
            name="Assistant",
            instructions="You are helpful.",
            model=self.model,
            tools=[self.refresh_dashboard_tool, self.approve_request_tool]
        )

        result = Runner.run_streamed(agent, agent_input, context=agent_context)
        async for event in stream_agent_response(agent_context, result):
            yield event

    @function_tool
    def refresh_dashboard(self, page: str) -> str:
        """Refresh the dashboard view"""
        return f"Dashboard {page} refreshed"
```

---

## Integration with OpenAI Agents SDK

### Complete Example: Tools + Agent + ChatKit

#### Backend (Python)
```python
from agents import Agent, Runner, function_tool
from chatkit.server import ChatKitServer
from chatkit.agents import AgentContext, stream_agent_response, ThreadItemConverter
import os

@function_tool
def get_user_profile(user_id: str) -> dict:
    """Get user profile information"""
    # Database lookup
    return {"name": "John Doe", "email": "john@example.com"}

@function_tool
def send_internal_email(to: str, subject: str, body: str) -> dict:
    """Send email via internal system"""
    # Your email logic
    return {"status": "sent", "message_id": "12345"}

class ChatKitServerImpl(ChatKitServer):
    def __init__(self, store, model):
        super().__init__(store)
        self.store = store
        self.model = model
        self.converter = ThreadItemConverter()

    async def respond(self, thread, input, context):
        # Load conversation history
        page = await self.store.load_thread_items(thread.id, None, 100, "asc", context)
        all_items = list(page.data)
        if input:
            all_items.append(input)

        agent_input = await self.converter.to_agent_input(all_items)

        # Create agent with tools
        agent = Agent(
            name="SupportBot",
            instructions="""You are a helpful support assistant.
            You can:
            - Get user profiles
            - Send emails
            - Trigger client-side actions (modals, notifications, etc.)

            For client actions, describe what the user should see/do.
            """,
            tools=[get_user_profile, send_internal_email],
            model=self.model
        )

        # Run with streaming
        result = Runner.run_streamed(
            agent,
            agent_input,
            context=AgentContext(
                thread=thread,
                store=self.store,
                request_context=context,
            ),
        )

        # Stream response
        async for event in stream_agent_response(
            AgentContext(thread, self.store, context),
            result
        ):
            yield event
```

#### Frontend (TypeScript)
```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState } from 'react';

export function SupportChat({ user }: { user: User }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const { control } = useChatKit({
    api: {
      url: `/api/chatkit?userId=${user.id}`,
      domainKey: 'localhost',
    },

    // Handle client-side tools called by AI
    onClientTool: async ({ name, params }) => {
      switch (name) {
        case 'show_user_profile':
          setModalContent(JSON.stringify(params.profile, null, 2));
          setModalOpen(true);
          return { success: true };

        case 'show_notification':
          if ('Notification' in window) {
            await Notification.requestPermission();
            new Notification(params.title, { body: params.message });
            return { success: true };
          }
          return { error: 'Notifications not supported' };

        case 'open_email_composer':
          window.location.href = `mailto:${params.to}?subject=${params.subject}`;
          return { success: true };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    },

    // Composer tools for user
    composer: {
      tools: [
        {
          id: 'support',
          label: 'Get Support',
          shortLabel: 'Support',
          icon: 'life-buoy',
          placeholderOverride: 'Describe your issue...',
          pinned: true,
        },
        {
          id: 'billing',
          label: 'Billing Questions',
          shortLabel: 'Billing',
          icon: 'credit-card',
          placeholderOverride: 'What billing question do you have?',
          pinned: false,
        },
      ],
    },

    // Personalized start screen
    startScreen: {
      greeting: `Hello ${user.name}! How can I help you today?`,
      prompts: [
        { label: 'Account help', prompt: 'Help me with my account' },
        { label: 'Technical issue', prompt: 'I have a technical problem' },
      ],
    },
  });

  return (
    <>
      <ChatKit control={control} className="h-[600px] w-[400px]" />

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <pre>{modalContent}</pre>
            <button onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## Advanced Patterns

### 1. Tool Chaining (AI → Client → Backend)

```typescript
onClientTool: async ({ name, params }) => {
  if (name === 'collect_feedback') {
    // 1. Show modal to user
    const feedback = await showFeedbackModal(params.prompt);

    // 2. Send to backend for processing
    const response = await fetch('/api/process-feedback', {
      method: 'POST',
      body: JSON.stringify({ feedback, context: params.context }),
    });

    // 3. Return result to AI
    return await response.json();
  }
}
```

### 2. Real-time Updates
```typescript
// Use with WebSocket or Server-Sent Events
const { control } = useChatKit({
  onClientTool: async ({ name, params }) => {
    if (name === 'subscribe_updates') {
      const eventSource = new EventSource(`/api/updates/${params.channel}`);
      eventSource.onmessage = (event) => {
        // Update UI or send back to AI
        control.ref.current?.sendUserMessage({
          text: `Update received: ${event.data}`
        });
      };
      return { success: true };
    }
  },
});
```

### 3. Conditional Tool Execution
```typescript
onClientTool: async ({ name, params }) => {
  // Check permissions before executing
  if (name === 'delete_file') {
    const confirmed = await showConfirmDialog(
      `Delete ${params.filename}?`
    );

    if (!confirmed) {
      return { cancelled: true };
    }

    // Proceed with deletion
    await deleteFile(params.fileId);
    return { success: true };
  }
}
```

---

## Error Handling & Security

### 1. Graceful Degradation
```typescript
onClientTool: async ({ name, params }) => {
  try {
    switch (name) {
      case 'get_geolocation':
        if (!('geolocation' in navigator)) {
          throw new Error('Geolocation not supported');
        }
        return await getGeolocation();

      case 'show_notification':
        if (!('Notification' in window)) {
          return { error: 'Notifications not supported' };
        }
        return await showNotification(params);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Tool ${name} failed:`, error);
    return { error: error.message };
  }
}
```

### 2. Permission Checks
```typescript
onClientTool: async ({ name, params }) => {
  // Check user authentication
  if (!user.isAuthenticated) {
    return { error: 'Authentication required' };
  }

  // Check role-based access
  if (name === 'delete_user' && user.role !== 'admin') {
    return { error: 'Insufficient permissions' };
  }

  // Check feature flags
  if (name === 'advanced_analytics' && !featureFlags.analyticsEnabled) {
    return { error: 'Feature not enabled' };
  }

  // Proceed with execution
  return await executeTool(name, params);
}
```

### 3. Input Validation
```typescript
onClientTool: async ({ name, params }) => {
  // Validate parameters
  if (name === 'send_email') {
    if (!params.to || !isValidEmail(params.to)) {
      return { error: 'Invalid email address' };
    }

    if (!params.subject || params.subject.length > 200) {
      return { error: 'Subject too long or missing' };
    }
  }

  // Sanitize inputs
  if (name === 'show_modal') {
    // Prevent XSS
    params.content = sanitizeHTML(params.content);
  }

  return await executeTool(name, params);
}
```

---

## Testing Tools

### Mocking for Tests
```typescript
// test-utils.ts
export const createMockChatKit = (overrides = {}) => {
  const mockControl = {
    ref: { current: null },
    sendUserMessage: jest.fn(),
    focusComposer: jest.fn(),
  };

  return {
    control: mockControl,
    onClientTool: overrides.onClientTool || jest.fn(),
  };
};

// Example test
test('send_email tool', async () => {
  const mockSend = jest.fn().mockResolvedValue({ success: true });

  const { control } = renderHook(() =>
    useChatKit({
      onClientTool: async ({ name, params }) => {
        if (name === 'send_email') {
          return await mockSend(params);
        }
      },
    })
  );

  // Simulate AI calling the tool
  const result = await control.onClientTool({
    name: 'send_email',
    params: { to: 'test@example.com', subject: 'Test' },
  });

  expect(result.success).toBe(true);
  expect(mockSend).toHaveBeenCalled();
});
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `onClientTool not called` | Tool not defined in agent | Add tool to agent's `tools` array |
| `Tool execution timeout` | Async operations too long | Use `Promise.race()` with timeout |
| `CORS error` | Browser blocking request | Configure CORS on backend |
| `Permission denied` | Browser API restrictions | Request permissions upfront |
| `Tool not recognized` | Wrong tool name | Check agent tool definitions |
| `State not updating` | Missing React state | Use `useState` for UI changes |

---

## Performance Tips

1. **Batch Operations**: Group multiple tool calls when possible
2. **Cache Results**: Store frequently accessed data in localStorage
3. **Debounce Calls**: Prevent rapid tool execution
4. **Lazy Loading**: Load tool handlers only when needed
5. **Web Workers**: Offload heavy computation

```typescript
// Lazy load heavy tools
const toolHandlers = {
  light: async (params) => { /* quick operations */ },
  heavy: async (params) => {
    // Load worker on demand
    const worker = new Worker('/heavy-tool-worker.js');
    return new Promise((resolve) => {
      worker.onmessage = (e) => resolve(e.data);
      worker.postMessage(params);
    });
  },
};
```

---

## Integration Checklist

- [ ] Tools defined in OpenAI Agents SDK agent
- [ ] `onClientTool` handler implemented in frontend
- [ ] Error handling for all tool failures
- [ ] Permission checks for sensitive operations
- [ ] UI feedback for tool execution (loading states)
- [ ] Testing with mock tool calls
- [ ] Security review for browser API access
- [ ] Documentation for each tool's parameters

---

## Related Files

- **BACKEND_PATTERNS.md**: OpenAI Agents SDK integration
- **FRONTEND_PATTERNS.md**: Basic ChatKit setup
- **API_REFERENCE.md**: Tool method signatures
- **DEBUGGING.md**: Tool troubleshooting

---

**Next**: See API_REFERENCE.md for complete tool method signatures and debugging tips.