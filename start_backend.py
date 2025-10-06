#!/usr/bin/env python3
"""
Startup script for the Idea2Index FastAPI backend.
This script can be run directly without module import issues.
"""
import sys
import os
import argparse
import logging

# Add the project root to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

def setup_logging(verbose: bool = False):
    """Configure logging based on verbose mode"""
    if verbose:
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout)
            ]
        )
        # Set uvicorn logger to debug level
        logging.getLogger("uvicorn").setLevel(logging.DEBUG)
        logging.getLogger("uvicorn.error").setLevel(logging.DEBUG)
        logging.getLogger("uvicorn.access").setLevel(logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Start the Idea2Index FastAPI backend server"
    )
    parser.add_argument(
        "-v", "--verbose", 
        action="store_true",
        help="Enable verbose mode (shows detailed error logs including 500 errors)"
    )
    return parser.parse_args()

# Now we can import and run the backend
if __name__ == "__main__":
    args = parse_arguments()
    
    # Setup logging based on verbose mode
    setup_logging(args.verbose)
    
    import uvicorn
    from backend.main import app
    from backend.core.config import settings
    
    print(f"Starting {settings.app_name} v{settings.app_version}")
    print(f"Server will be available at http://{settings.host}:{settings.port}")
    print("API documentation: http://localhost:8000/docs")
    if args.verbose:
        print("Verbose mode enabled - detailed error logs will be shown")
    print("Press Ctrl+C to stop the server")
    
    # Configure uvicorn log level based on verbose mode
    log_level = "debug" if args.verbose else "info"
    
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=log_level,
        access_log=args.verbose
    )
