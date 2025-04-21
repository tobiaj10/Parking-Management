import os
import sys
import subprocess
import signal
import time

def start_server():
    """Start the Flask server."""
    print("Starting Flask server...")
    return subprocess.Popen(['python', 'run.py'], cwd='python_server')

def main():
    # Start the server
    server_process = start_server()
    
    try:
        # Keep the main process running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nReceived keyboard interrupt. Shutting down...")
    finally:
        # Clean up
        if server_process:
            print("Stopping Flask server...")
            server_process.send_signal(signal.SIGTERM)
            server_process.wait()
        
        print("Server shutdown complete")

if __name__ == "__main__":
    main()