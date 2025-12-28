"""
Main entry point for the CLI Todo Application.

Provides the main application loop and signal handling.
"""

import signal
import sys

from .cli import CLIHandler
from .services import TaskManager


def print_header() -> None:
    """Print application header."""
    header = """
═══════════════════════════════════════════
         📋 TODO APPLICATION
═══════════════════════════════════════════

Type 'help' to see available commands.
Type 'exit' to quit.
"""
    print(header)


def signal_handler(signum, frame) -> None:
    """
    Handle Ctrl+C (SIGINT) gracefully.

    Args:
        signum: Signal number
        frame: Current stack frame
    """
    print("\n\n👋 Thanks for using Todo App! Goodbye!")
    sys.exit(0)


def main_loop() -> None:
    """
    Main application loop.

    Handles user input and command execution.
    """
    # Initialize services
    task_manager = TaskManager()
    cli_handler = CLIHandler(task_manager)

    # Register signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)

    # Print header
    print_header()

    # Main loop
    while True:
        try:
            # Get user input
            user_input = input("Enter command: ").strip()

            # Execute command
            success, message, should_exit = cli_handler.execute_command(user_input)

            # Display result
            if message:
                print(message)

            # Check if should exit
            if should_exit:
                print("\n👋 Thanks for using Todo App! Goodbye!")
                break

        except EOFError:
            # Handle Ctrl+D
            print("\n\n👋 Thanks for using Todo App! Goodbye!")
            break
        except KeyboardInterrupt:
            # Handle Ctrl+C
            print("\n\n👋 Thanks for using Todo App! Goodbye!")
            break
        except Exception as e:
            print(f"Unexpected error: {e}")


def main() -> None:
    """Main entry point."""
    try:
        main_loop()
    except KeyboardInterrupt:
        print("\n\n👋 Thanks for using Todo App! Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
