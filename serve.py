#!/usr/bin/env python3
"""Local development server for the site.

Serves the repository folder (wherever the script is started from) and tells
the browser not to keep any file in its cache, so that after a change the
browser never mixes old and new JavaScript modules.

Usage:
    python3 serve.py              # http://localhost:8000/
    python3 serve.py 8080         # another port
    python3 serve.py 8000 0.0.0.0 # reachable from a phone on the same network

When the port is taken (e.g. by the server of another site of Bubu), the next
free one is used and printed.
"""

import errno
import functools
import http.server
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    """Static files with caching turned off."""

    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.js': 'text/javascript',
        '.webp': 'image/webp',
    }

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    host = sys.argv[2] if len(sys.argv) > 2 else '127.0.0.1'
    handler = functools.partial(NoCacheHandler, directory=str(ROOT))
    with open_server(host, port, handler) as server:
        port = server.server_address[1]
        print(f'Scrisori pentru Bubu: http://localhost:{port}/  (Ctrl+C to stop)', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print()


def open_server(host, port, handler, tries=20):
    """A server on the port, or on the next free one when it is taken."""
    for candidate in range(port, port + tries):
        try:
            return http.server.ThreadingHTTPServer((host, candidate), handler)
        except OSError as error:
            if error.errno != errno.EADDRINUSE:
                raise
            print(f'Port {candidate} is taken, trying {candidate + 1}...', flush=True)
    sys.exit(f'No free port between {port} and {port + tries - 1}.')


if __name__ == '__main__':
    main()
