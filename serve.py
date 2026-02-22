#!/usr/bin/env python3
"""Small local static file server for development/testing."""

from __future__ import annotations

import argparse
import functools
import http.server
import socketserver
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve a directory locally for static-site testing."
    )
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host/interface to bind to (default: 127.0.0.1).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to listen on (default: 8000).",
    )
    parser.add_argument(
        "--dir",
        default=".",
        help="Directory to serve (default: current directory).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    directory = Path(args.dir).resolve()

    handler = functools.partial(
        http.server.SimpleHTTPRequestHandler, directory=str(directory)
    )

    with socketserver.TCPServer((args.host, args.port), handler) as httpd:
        print(f"Serving {directory} at http://{args.host}:{args.port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopping server.")


if __name__ == "__main__":
    main()
