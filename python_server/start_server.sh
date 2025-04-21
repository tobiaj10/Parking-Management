#!/bin/bash

# Kill any existing python processes
pkill -f "python run.py" || true

# Wait for port to be free
sleep 1

# Start the Flask server
cd python_server
python run.py