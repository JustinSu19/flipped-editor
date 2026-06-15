import os
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path


HOST = "127.0.0.1"
PORT = 5173
URL = f"http://{HOST}:{PORT}"


def is_server_ready() -> bool:
    try:
        with urllib.request.urlopen(URL, timeout=1.2) as response:
            return 200 <= response.status < 500
    except Exception:
        return False


def npm_command() -> str:
    return "npm.cmd" if os.name == "nt" else "npm"


def main() -> int:
    project_dir = Path(__file__).resolve().parent
    os.chdir(project_dir)

    if is_server_ready():
        print(f"Flipped Editor is already running: {URL}")
        webbrowser.open(URL)
        return 0

    print("Starting Flipped Editor...")
    print(f"Project: {project_dir}")
    print(f"URL: {URL}")
    print()

    process = subprocess.Popen(
        [npm_command(), "run", "dev", "--", "--host", HOST, "--port", str(PORT)],
        cwd=project_dir,
        shell=False,
    )

    for _ in range(40):
        if process.poll() is not None:
            print("The dev server stopped before it was ready.")
            return process.returncode or 1
        if is_server_ready():
            print("Flipped Editor is ready. Opening browser...")
            webbrowser.open(URL)
            break
        time.sleep(0.5)
    else:
        print("Server is still starting. Open this URL manually when ready:")
        print(URL)

    print()
    print("Keep this window open while using Flipped Editor.")
    print("Close this window or press Ctrl+C to stop the local server.")

    try:
        return process.wait()
    except KeyboardInterrupt:
        print("\nStopping Flipped Editor...")
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        return 0


if __name__ == "__main__":
    sys.exit(main())
