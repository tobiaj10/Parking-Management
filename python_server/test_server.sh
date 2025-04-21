#!/bin/bash

# Set the port to test
export API_PORT=5000  # For testing Node.js server
# export API_PORT=5001  # For testing Python server

# Run the test script
cd python_server
python test.py