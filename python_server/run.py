from app import app
import os

if __name__ == '__main__':
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5001))  # Using 5001 to avoid conflict with existing server
    app.run(host=host, port=port, debug=True)