# Todo App - Demo Mode Guide

## 🚀 Quick Start (30 seconds)

1. **Enable Demo Mode:**
   ```bash
   # Copy demo environment file
   cp .env.demo .env.local
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Visit:** http://localhost:3000/tasks

That's it! No backend required. 🎉

## 🎯 What You Can Test

### ✅ **Full Task Management**
- **View Tasks:** See 5 pre-loaded demo tasks
- **Create Tasks:** Add new tasks with title, description, priority, category, and due date
- **Edit Tasks:** Modify existing tasks
- **Delete Tasks:** Remove tasks with confirmation
- **Toggle Completion:** Mark tasks as complete/incomplete

### ✅ **Search & Filter**
- **Search:** Find tasks by title or description (debounced)
- **Filter by Status:** All, Pending, or Completed
- **Filter by Priority:** All, Low, Medium, High
- **Filter by Category:** Work, Personal, Shopping, Health, Other
- **Sort:** 8 different sorting options (date, priority, title, etc.)

### ✅ **UI Features**
- **Real-time Stats:** Total, Pending, and Completed counters
- **Loading States:** Skeleton loaders during operations
- **Empty States:** Contextual messages when no tasks exist
- **Error Handling:** Toast notifications for all operations
- **Responsive Design:** Works on mobile, tablet, and desktop

## 📋 Demo Tasks Included

1. **Complete project documentation** (High priority, Work)
2. **Buy groceries** (Completed, Low priority, Shopping)
3. **Morning workout** (Pending, Medium priority, Health)
4. **Call mom** (Pending, Medium priority, Personal)
5. **Plan weekend trip** (Pending, Low priority, Other)

## 🔧 Demo Mode Features

### **No Authentication Required**
- Bypasses all auth checks
- Uses a mock "Demo User" session
- No login/signup needed

### **Mock API Layer**
- All operations use local mock data
- Simulated network delays (300ms)
- Data persists in browser memory (refresh to reset)

### **Full UI Integration**
- All React Query hooks work
- Optimistic updates enabled
- Toast notifications for feedback
- Loading states and error handling

## 🎨 Design System

The app uses a **Modern Technical Editorial** design system:

- **Colors:** Cream background (`#F9F7F2`) + Orange accents (`#FF6B4A`)
- **Typography:** Serif headings, Sans body, Mono labels
- **Layout:** Technical lines, subtle borders, clean spacing
- **Components:** Custom-built with attention to detail

## 🧪 Testing Checklist

Try these operations:

- [ ] **Create a new task** with all fields
- [ ] **Edit an existing task** and change priority
- [ ] **Toggle task completion** (click the checkbox)
- [ ] **Delete a task** (click trash icon, confirm)
- [ ] **Search for "work"** (should find 2 tasks)
- [ ] **Filter by "Completed"** (should show 1 task)
- [ ] **Sort by "Due Date"** (should reorder tasks)
- [ ] **Clear all filters** (should show all tasks)
- [ ] **Test empty state** (delete all tasks, see message)
- [ ] **Test loading states** (watch skeleton loaders)

## 🔄 Switching to Production

When ready to use with a real backend:

1. **Remove demo mode:**
   ```bash
   # Edit .env.local and remove or set to false:
   NEXT_PUBLIC_DEMO_MODE=false
   ```

2. **Set up backend API:**
   ```bash
   # Update API URL in .env.local:
   NEXT_PUBLIC_API_URL=http://your-backend:8000
   ```

3. **Update auth system:**
   - Configure Better Auth with your backend
   - Set up proper JWT token handling
   - Implement real user sessions

## 🐛 Troubleshooting

**"Auth blocked" error:**
- Make sure `.env.local` exists with `NEXT_PUBLIC_DEMO_MODE=true`
- Restart the dev server

**No tasks showing:**
- Check browser console for errors
- Verify demo mode is enabled
- Try refreshing the page

**UI looks broken:**
- Ensure all dependencies are installed: `npm install`
- Check Tailwind CSS is working: `npm run build`

## 📚 Files Modified for Demo Mode

- `src/lib/auth/auth-client.ts` - Mock session support
- `src/lib/api/tasks.ts` - Demo API routing
- `src/lib/api/demo-tasks.ts` - Mock data and operations (new file)

## 🎯 Next Steps

Once you've tested the UI:

1. **Explore the codebase** - All components are well-documented
2. **Customize the design** - Easy to modify colors and styles
3. **Add your features** - Build on the existing foundation
4. **Connect your backend** - Replace demo mode with real API

---

**Enjoy testing your new Todo App! 🎉**

For questions or issues, check the console logs or refer to the component documentation in the source code.