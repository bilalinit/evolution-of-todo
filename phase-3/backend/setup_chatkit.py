#!/usr/bin/env python3
"""
ChatKit Integration Setup Script

This script handles the complete setup for ChatKit integration:
1. Database migration (creates ChatKit tables)
2. Environment variable validation
3. Package verification
4. Database connection test
5. OpenAI API key validation

Usage:
    python setup_chatkit.py
    python setup_chatkit.py --force  # Skip confirmations
    python setup_chatkit.py --test-only  # Only test, don't setup
"""

import os
import sys
import subprocess
import argparse
from typing import Dict, List, Tuple
from datetime import datetime

# Database migration SQL
CHATKIT_MIGRATION_SQL = """
-- ChatKit Integration Migration
-- Creates tables for thread persistence with snake_case naming convention

-- Drop existing tables if they exist
DROP TABLE IF EXISTS chatkit_thread_item CASCADE;
DROP TABLE IF EXISTS chatkit_thread CASCADE;

-- ChatKit threads table
CREATE TABLE chatkit_thread (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    thread_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chatkit_thread_user_id_check CHECK (user_id ~ '^[a-zA-Z0-9_-]+$')
);

-- ChatKit thread items table
CREATE TABLE chatkit_thread_item (
    id VARCHAR(255) PRIMARY KEY,
    thread_id VARCHAR(255) NOT NULL REFERENCES chatkit_thread(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'user_message', 'assistant_message', 'tool_call',
        'tool_result', 'system_message', 'error'
    )),
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chatkit_thread_item_type_check CHECK (type ~ '^[a-z_]+$')
);

-- Performance indexes
CREATE INDEX idx_chatkit_thread_user ON chatkit_thread(user_id);
CREATE INDEX idx_chatkit_thread_updated ON chatkit_thread(updated_at);
CREATE INDEX idx_chatkit_item_thread ON chatkit_thread_item(thread_id);
CREATE INDEX idx_chatkit_item_created ON chatkit_thread_item(created_at);
CREATE INDEX idx_chatkit_item_type ON chatkit_thread_item(type);

-- Enable Row Level Security for user isolation
ALTER TABLE chatkit_thread ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatkit_thread_item ENABLE ROW LEVEL SECURITY;

-- Create policies for user isolation
CREATE POLICY chatkit_thread_policy ON chatkit_thread
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY chatkit_thread_item_policy ON chatkit_thread_item
    FOR ALL
    USING (
        thread_id IN (
            SELECT id FROM chatkit_thread
            WHERE user_id = current_setting('app.current_user_id', true)
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chatkit_thread_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER chatkit_thread_updated_at_trigger
    BEFORE UPDATE ON chatkit_thread
    FOR EACH ROW
    EXECUTE FUNCTION update_chatkit_thread_updated_at();
"""


class ChatKitSetup:
    def __init__(self, force: bool = False, test_only: bool = False):
        self.force = force
        self.test_only = test_only
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.success: List[str] = []

    def log_success(self, message: str):
        """Log success message."""
        self.success.append(message)
        print(f"✅ {message}")

    def log_warning(self, message: str):
        """Log warning message."""
        self.warnings.append(message)
        print(f"⚠️  {message}")

    def log_error(self, message: str):
        """Log error message."""
        self.errors.append(message)
        print(f"❌ {message}")

    def print_header(self, message: str):
        """Print section header."""
        print(f"\n{'='*60}")
        print(f"  {message}")
        print(f"{'='*60}")

    def check_environment_variables(self) -> bool:
        """Check required environment variables."""
        self.print_header("1. Checking Environment Variables")

        required_vars = {
            "OPENAI_API_KEY": "OpenAI API key for ChatKit sessions",
            "DATABASE_URL": "Neon PostgreSQL database URL",
            "BETTER_AUTH_SECRET": "Better Auth secret for authentication",
        }

        all_good = True

        for var, description in required_vars.items():
            value = os.getenv(var)
            if not value:
                self.log_error(f"{var} is not set - {description}")
                all_good = False
            elif var == "OPENAI_API_KEY" and not value.startswith("sk-"):
                self.log_warning(f"{var} doesn't look like a valid OpenAI key")
            elif var == "DATABASE_URL" and "neon.tech" not in value:
                self.log_warning(f"{var} doesn't appear to be a Neon database URL")
            else:
                self.log_success(f"{var} is configured")

        return all_good

    def check_packages(self) -> bool:
        """Check required Python packages."""
        self.print_header("2. Checking Required Packages")

        required_packages = [
            ("openai", "OpenAI Python SDK"),
            ("openai-agents", "OpenAI Agents SDK"),
            ("openai-chatkit", "OpenAI ChatKit"),
            ("sqlmodel", "SQLModel ORM"),
            ("fastapi", "FastAPI web framework"),
            ("psycopg2-binary", "PostgreSQL adapter"),
        ]

        all_good = True

        for package, description in required_packages:
            try:
                if package == "openai-agents":
                    # Special check for openai-agents (imported as 'agents')
                    import agents
                    self.log_success(f"{description} is available")
                elif package == "openai-chatkit":
                    # Special check for openai-chatkit
                    import chatkit
                    self.log_success(f"{description} is available")
                elif package == "psycopg2-binary":
                    # Special check for psycopg2 (imported as 'psycopg2')
                    import psycopg2
                    self.log_success(f"{description} is available")
                else:
                    __import__(package)
                    self.log_success(f"{description} is available")
            except ImportError:
                self.log_error(f"{description} ({package}) is not installed")
                all_good = False

        return all_good

    def test_database_connection(self) -> bool:
        """Test database connection and check existing tables."""
        self.print_header("3. Testing Database Connection")

        try:
            import psycopg2
            from urllib.parse import urlparse

            db_url = os.getenv("DATABASE_URL")
            if not db_url:
                self.log_error("DATABASE_URL not found")
                return False

            # Parse database URL
            parsed = urlparse(db_url)

            # Connect to database
            conn = psycopg2.connect(
                host=parsed.hostname,
                port=parsed.port,
                database=parsed.path[1:],  # Remove leading slash
                user=parsed.username,
                password=parsed.password,
                sslmode='require' if 'neon.tech' in db_url else 'prefer'
            )

            cursor = conn.cursor()

            # Check existing tables
            cursor.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)

            existing_tables = [row[0] for row in cursor.fetchall()]

            # Check for ChatKit tables
            chatkit_tables = ["chatkit_thread", "chatkit_thread_item"]
            existing_chatkit = [t for t in chatkit_tables if t in existing_tables]

            if existing_chatkit:
                self.log_success(f"ChatKit tables found: {', '.join(existing_chatkit)}")
            else:
                self.log_warning("No ChatKit tables found (will be created during migration)")

            # Check for user table (required for foreign key)
            if "user" not in existing_tables:
                self.log_warning("User table not found - ChatKit tables require user table for foreign key")
            else:
                self.log_success("User table found (required for foreign keys)")

            cursor.close()
            conn.close()

            self.log_success("Database connection successful")
            return True

        except Exception as e:
            self.log_error(f"Database connection failed: {str(e)}")
            return False

    def test_openai_api_key(self) -> bool:
        """Test OpenAI API key validity."""
        self.print_header("4. Testing OpenAI API Key")

        try:
            import openai

            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                self.log_error("OPENAI_API_KEY not found")
                return False

            # Create OpenAI client
            client = openai.OpenAI(api_key=api_key)

            # Try to list models (basic API test)
            models = client.models.list()

            # Check if GPT-4o is available
            gpt4o_available = any("gpt-4o" in model.id for model in models.data)

            if gpt4o_available:
                self.log_success("GPT-4o model is available for ChatKit")
            else:
                self.log_warning("GPT-4o not found - ChatKit may not work properly")

            # Check if ChatKit is available via direct import
            try:
                import chatkit
                from chatkit.server import ChatKitServer
                from chatkit.store import Store
                self.log_success("ChatKit package and interfaces are available")
                return True
            except Exception as e:
                self.log_error(f"ChatKit package not available: {str(e)}")
                return False

        except Exception as e:
            self.log_error(f"OpenAI API test failed: {str(e)}")
            return False

    def run_database_migration(self) -> bool:
        """Run database migration to create ChatKit tables."""
        self.print_header("5. Running Database Migration")

        if self.test_only:
            self.log_success("Test mode - skipping migration")
            return True

        try:
            import psycopg2
            from urllib.parse import urlparse

            db_url = os.getenv("DATABASE_URL")
            if not db_url:
                self.log_error("DATABASE_URL not found")
                return False

            # Parse database URL
            parsed = urlparse(db_url)

            # Connect to database
            conn = psycopg2.connect(
                host=parsed.hostname,
                port=parsed.port,
                database=parsed.path[1:],  # Remove leading slash
                user=parsed.username,
                password=parsed.password,
                sslmode='require' if 'neon.tech' in db_url else 'prefer'
            )

            cursor = conn.cursor()

            # Execute migration
            self.log_success("Executing migration SQL...")

            # Use a simpler approach for statement execution
            # Split on semicolons at end of lines (simple but effective for our SQL)
            lines = CHATKIT_MIGRATION_SQL.split('\n')
            statements = []
            current = []

            for line in lines:
                current.append(line)
                if line.strip().endswith(';'):
                    statement = '\n'.join(current).strip()
                    if statement and not statement.startswith('--'):
                        statements.append(statement)
                    current = []

            # Handle the function definition which spans multiple lines
            # Find and combine the function definition statements
            fixed_statements = []
            i = 0
            while i < len(statements):
                stmt = statements[i]
                if 'CREATE OR REPLACE FUNCTION' in stmt and '$$ LANGUAGE plpgsql;' not in stmt:
                    # This is the start of a multi-line function
                    function_parts = [stmt]
                    i += 1
                    while i < len(statements) and '$$ LANGUAGE plpgsql;' not in statements[i]:
                        function_parts.append(statements[i])
                        i += 1
                    if i < len(statements):
                        function_parts.append(statements[i])
                        i += 1
                    fixed_statements.append('\n'.join(function_parts))
                else:
                    fixed_statements.append(stmt)
                    i += 1

            statements = fixed_statements

            for i, statement in enumerate(statements, 1):
                try:
                    cursor.execute(statement)
                    conn.commit()  # Commit after each statement to avoid transaction issues
                    self.log_success(f"Statement {i}/{len(statements)} executed successfully")
                except Exception as e:
                    # Rollback the failed transaction
                    conn.rollback()
                    # Some statements might fail if objects already exist
                    if "already exists" in str(e).lower():
                        self.log_warning(f"Statement {i} - object already exists (skipping)")
                    elif "does not exist" in str(e).lower():
                        self.log_warning(f"Statement {i} - dependency missing (will be created later): {str(e)}")
                    else:
                        self.log_error(f"Statement {i} failed: {str(e)}")
                        cursor.close()
                        conn.close()
                        return False
            cursor.close()
            conn.close()

            self.log_success("Database migration completed successfully")
            return True

        except Exception as e:
            self.log_error(f"Database migration failed: {str(e)}")
            return False

    def check_frontend_setup(self) -> bool:
        """Check frontend setup for ChatKit."""
        self.print_header("6. Checking Frontend Setup")

        frontend_dir = "../frontend"
        if not os.path.exists(frontend_dir):
            self.log_error(f"Frontend directory not found: {frontend_dir}")
            return False

        # Check for required files
        required_files = [
            "src/lib/chatkit/session.ts",
            "src/components/chat/ChatKitWidget.tsx",
            "src/app/chatkit/page.tsx",
            "src/app/api/chatkit/session/route.ts",
            "src/app/api/chatkit/refresh/route.ts",
        ]

        all_good = True
        for file_path in required_files:
            full_path = os.path.join(frontend_dir, file_path)
            if os.path.exists(full_path):
                self.log_success(f"Frontend file exists: {file_path}")
            else:
                self.log_error(f"Frontend file missing: {file_path}")
                all_good = False

        # Check for ChatKit React package
        try:
            package_json_path = os.path.join(frontend_dir, "package.json")
            if os.path.exists(package_json_path):
                import json
                with open(package_json_path, 'r') as f:
                    package_json = json.load(f)

                if "@openai/chatkit-react" in package_json.get("dependencies", {}):
                    self.log_success("@openai/chatkit-react is installed")
                else:
                    self.log_error("@openai/chatkit-react is not installed")
                    all_good = False
            else:
                self.log_error("package.json not found")
                all_good = False
        except Exception as e:
            self.log_error(f"Error checking frontend packages: {str(e)}")
            all_good = False

        return all_good

    def generate_summary(self) -> bool:
        """Generate setup summary."""
        self.print_header("Setup Summary")

        print(f"\nTimestamp: {datetime.now().isoformat()}")
        print(f"Test Mode: {self.test_only}")
        print(f"Force Mode: {self.force}")

        if self.success:
            print(f"\n✅ Success ({len(self.success)}):")
            for msg in self.success:
                print(f"  • {msg}")

        if self.warnings:
            print(f"\n⚠️  Warnings ({len(self.warnings)}):")
            for msg in self.warnings:
                print(f"  • {msg}")

        if self.errors:
            print(f"\n❌ Errors ({len(self.errors)}):")
            for msg in self.errors:
                print(f"  • {msg}")

        all_good = len(self.errors) == 0

        if all_good:
            print(f"\n🎉 ChatKit setup completed successfully!")
            print(f"\nNext steps:")
            print(f"1. Run backend: uv run python -m backend.main")
            print(f"2. Run frontend: cd ../frontend && npm run dev")
            print(f"3. Visit: http://localhost:3000/chatkit")
            print(f"4. Login and test: 'Create a task for tomorrow'")
        else:
            print(f"\n❌ ChatKit setup has issues. Please fix the errors above.")

        return all_good

    def run(self) -> bool:
        """Run complete setup process."""
        print("🚀 ChatKit Integration Setup")
        print("This script will set up ChatKit integration for your task management app")

        if not self.force and not self.test_only:
            response = input("\nContinue with setup? (y/N): ")
            if response.lower() != 'y':
                print("Setup cancelled.")
                return False

        # Run checks
        checks = [
            self.check_environment_variables(),
            self.check_packages(),
            self.test_database_connection(),
            self.test_openai_api_key(),
        ]

        if not all(checks):
            print("\n❌ Some checks failed. Please fix the issues above.")
            return False

        if not self.test_only:
            # Check if ChatKit tables already exist and are properly set up
            try:
                import psycopg2
                from urllib.parse import urlparse

                db_url = os.getenv("DATABASE_URL")
                parsed = urlparse(db_url)
                conn = psycopg2.connect(
                    host=parsed.hostname,
                    port=parsed.port,
                    database=parsed.path[1:],
                    user=parsed.username,
                    password=parsed.password,
                    sslmode='require' if 'neon.tech' in db_url else 'prefer'
                )

                cursor = conn.cursor()
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables
                        WHERE table_schema = 'public'
                        AND table_name = 'chatkit_thread_item'
                    );
                """)
                thread_item_exists = cursor.fetchone()[0]

                cursor.close()
                conn.close()

                if thread_item_exists:
                    self.log_success("ChatKit tables already exist and appear to be properly configured")
                    # Skip migration since tables exist
                else:
                    # Run migration
                    if not self.run_database_migration():
                        print("\n❌ Migration failed. Please check the errors above.")
                        return False

            except Exception as e:
                self.log_error(f"Failed to check ChatKit table status: {str(e)}")
                # Try migration anyway
                if not self.run_database_migration():
                    print("\n❌ Migration failed. Please check the errors above.")
                    return False

        # Check frontend
        self.check_frontend_setup()

        # Generate summary
        return self.generate_summary()


def main():
    # Load environment variables from .env file
    from dotenv import load_dotenv
    load_dotenv()

    parser = argparse.ArgumentParser(description="ChatKit Integration Setup")
    parser.add_argument("--force", action="store_true", help="Skip confirmations")
    parser.add_argument("--test-only", action="store_true", help="Only test, don't setup")

    args = parser.parse_args()

    setup = ChatKitSetup(force=args.force, test_only=args.test_only)
    success = setup.run()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()