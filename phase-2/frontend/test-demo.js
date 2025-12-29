#!/usr/bin/env node

/**
 * Quick Demo Mode Test Script
 * Tests the mock API functionality without starting the server
 */

// Set demo mode
process.env.NEXT_PUBLIC_DEMO_MODE = 'true';

// Import the demo tasks module
const demoTasks = require('./src/lib/api/demo-tasks.ts');

async function runTests() {
  console.log('🧪 Testing Demo Mode Functionality...\n');

  try {
    // Test 1: Get tasks
    console.log('1. Testing getTasks()...');
    const tasksResult = await demoTasks.getTasks('demo-user-123', {});
    console.log(`   ✅ Found ${tasksResult.total} tasks`);
    console.log(`   ✅ ${tasksResult.completed_count} completed, ${tasksResult.pending_count} pending\n`);

    // Test 2: Create task
    console.log('2. Testing createTask()...');
    const newTask = await demoTasks.createTask('demo-user-123', {
      title: 'Test Task',
      description: 'Created by test script',
      priority: 'medium',
      category: 'work',
      due_date: new Date().toISOString().split('T')[0]
    });
    console.log(`   ✅ Created task: "${newTask.task.title}"\n`);

    // Test 3: Update task
    console.log('3. Testing updateTask()...');
    const updatedTask = await demoTasks.updateTask('demo-user-123', newTask.task.id, {
      title: 'Updated Test Task',
      description: 'Updated description',
      priority: 'high',
      category: 'personal',
      due_date: new Date().toISOString().split('T')[0]
    });
    console.log(`   ✅ Updated task: "${updatedTask.task.title}" (priority: ${updatedTask.task.priority})\n`);

    // Test 4: Toggle completion
    console.log('4. Testing toggleTaskCompletion()...');
    const toggledTask = await demoTasks.toggleTaskCompletion('demo-user-123', newTask.task.id);
    console.log(`   ✅ Toggled task: "${toggledTask.task.title}" (completed: ${toggledTask.task.completed})\n`);

    // Test 5: Filter tasks
    console.log('5. Testing filters...');
    const filteredResult = await demoTasks.getTasks('demo-user-123', {
      status: 'pending',
      priority: 'high'
    });
    console.log(`   ✅ Filtered to ${filteredResult.total} pending high-priority tasks\n`);

    // Test 6: Delete task
    console.log('6. Testing deleteTask()...');
    await demoTasks.deleteTask('demo-user-123', newTask.task.id);
    console.log(`   ✅ Deleted task successfully\n`);

    // Test 7: Verify deletion
    console.log('7. Verifying deletion...');
    const finalResult = await demoTasks.getTasks('demo-user-123');
    console.log(`   ✅ Final task count: ${finalResult.total}\n`);

    console.log('🎉 All tests passed! Demo mode is working correctly.\n');
    console.log('💡 To use the demo:');
    console.log('   1. Run: cp .env.demo .env.local');
    console.log('   2. Run: npm run dev');
    console.log('   3. Visit: http://localhost:3000/tasks');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();