"""
Main entry point for the CLI Todo Application.

Provides the main application loop and signal handling for menu-driven interface.
"""

import signal
import sys

from .cli import MenuHandler
from .services import TaskManager
from . import ui
from .utils import validate_menu_choice


def signal_handler(signum, frame) -> None:
    """
    Handle Ctrl+C (SIGINT) gracefully.

    Args:
        signum: Signal number
        frame: Current stack frame
    """
    ui.display_message("\n👋 Thanks for using Todo App! Goodbye!", "info")
    sys.exit(0)


def main_loop() -> None:
    """
    Main application loop for menu-driven interface.

    Handles menu navigation and user operations.
    """
    # Initialize services
    task_manager = TaskManager()
    menu_handler = MenuHandler(task_manager)

    # Register signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)

    # Display welcome
    ui.display_header()
    ui.display_message("Welcome to Todo Application!", "info")
    ui.display_pause()

    # Main menu loop
    while True:
        try:
            # Display main menu
            ui.display_main_menu()

            # Get user choice
            user_choice = input("\nEnter your choice (1-7): ").strip()

            # Validate choice
            is_valid, error_msg = validate_menu_choice(user_choice)
            if not is_valid:
                ui.display_message(error_msg, "error")
                ui.display_pause()
                continue

            # Route to handler
            success, should_exit = menu_handler.route_menu_choice(user_choice)

            # Check if should exit
            if should_exit:
                ui.display_exit_message()
                break

            # Pause after successful operations (except list which shows its own pause)
            if success and user_choice != "2":
                ui.display_pause()

        except EOFError:
            # Handle Ctrl+D
            ui.display_message("\n👋 Thanks for using Todo App! Goodbye!", "info")
            break
        except KeyboardInterrupt:
            # Handle Ctrl+C
            ui.display_message("\n👋 Thanks for using Todo App! Goodbye!", "info")
            break
        except Exception as e:
            ui.display_message(f"Unexpected error: {str(e)}", "error")
            ui.display_pause()


def main() -> None:
    """Main entry point."""
    try:
        main_loop()
    except KeyboardInterrupt:
        ui.display_message("\n👋 Thanks for using Todo App! Goodbye!", "info")
        sys.exit(0)
    except Exception as e:
        ui.display_message(f"Fatal error: {str(e)}", "error")
        sys.exit(1)


if __name__ == "__main__":
    main()
