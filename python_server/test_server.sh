#!/bin/bash

# Check if an argument was provided
if [ "$1" == "python" ]; then
  # Test Python server
  export API_PORT=5001
  echo "Testing Python server on port 5001..."
else
  # Test Node.js server (default)
  export API_PORT=5000
  echo "Testing Node.js server on port 5000..."
fi

# Run the test script
cd python_server
python test.py