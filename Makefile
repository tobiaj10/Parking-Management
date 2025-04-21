# Parking Garage Management System Makefile
# Cross-platform compatibility
ifeq ($(OS),Windows_NT)
    RM = del /Q
    MKDIR = mkdir
    PYTHON = python
else
    RM = rm -f
    MKDIR = mkdir -p
    PYTHON = python3
endif

.PHONY: help dev-ts dev-py install install-ts install-py clean test-py all

help:
	@echo "Parking Garage Management System"
	@echo ""
	@echo "Available commands:"
	@echo "  make dev-ts      - Start TypeScript/Node.js backend"
	@echo "  make dev-py      - Start Python/FastAPI backend"
	@echo "  make dev         - Start both backends"
	@echo "  make install     - Install all dependencies"
	@echo "  make install-ts  - Install TypeScript/Node.js dependencies"
	@echo "  make install-py  - Install Python dependencies"
	@echo "  make test-py     - Run Python tests"
	@echo "  make clean       - Clean temporary files"
	@echo "  make all         - Install dependencies and start both backends"

dev-ts:
	@echo "Starting TypeScript/Node.js backend..."
	npm run dev

dev-py:
	@echo "Starting Python/FastAPI backend..."
	cd python_server && $(PYTHON) run.py

dev: dev-py dev-ts
	@echo "Both backends started"

install-ts:
	@echo "Installing TypeScript/Node.js dependencies..."
	npm install

install-py:
	@echo "Installing Python dependencies..."
	pip install -r python_server/requirements.txt

install: install-ts install-py
	@echo "All dependencies installed"

test-py:
	@echo "Running Python tests..."
	cd python_server && API_PORT=5001 $(PYTHON) test.py

clean:
	@echo "Cleaning temporary files..."
	$(RM) -rf node_modules
	$(RM) -rf __pycache__
	$(RM) -rf python_server/__pycache__
	@echo "Cleaned up"

all: install dev
	@echo "Project ready"