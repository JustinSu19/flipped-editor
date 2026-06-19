import json
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
VERSION_URL = f"{URL}/flipped-editor-version.json"
EXPECTED_APP = "flipped-editor"
EXPECTED_VERSION = "v2-structuraloptimize"


def fetch_text(url: str, timeout: float = 1.2) -> str | None:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            if 200 <= response.status < 500:
                return response.read().decode("utf-8", errors="replace")
    except Exception:
        return None
    return None


def is_server_ready() -> bool:
    return fetch_text(URL) is not None


def is_expected_flipped_editor() -> bool:
    raw = fetch_text(VERSION_URL)
    if not raw:
        return False
    try:
        marker = json.loads(raw)
    except json.JSONDecodeError:
        return False
    return marker.get("app") == EXPECTED_APP and marker.get("version") == EXPECTED_VERSION


def npm_command() -> str:
    return "npm.cmd" if os.name == "nt" else "npm"


def wait_before_exit() -> None:
    if os.name == "nt":
        input("\nPress Enter to close this window...")


def main() -> int:
    project_dir = Path(__file__).resolve().parent
    os.chdir(project_dir)

    if is_server_ready():
        if is_expected_flipped_editor():
            print(f"Flipped Editor is already running: {URL}")
            print(f"Version: {EXPECTED_VERSION}")
            webbrowser.open(URL)
            return 0

        print(f"Port {PORT} is already in use, but it does not look like this Flipped Editor version.")
        print("Please close the old dev-server / PowerShell window first, then run this file again.")
        print(f"Expected marker: {VERSION_URL}")
        wait_before_exit()
        return 1

    print("Starting Flipped Editor...")
    print(f"Project: {project_dir}")
    print(f"Version: {EXPECTED_VERSION}")
    print(f"URL: {URL}")
    print()

    process = subprocess.Popen(
        [npm_command(), "run", "dev", "--", "--host", HOST, "--port", str(PORT), "--strictPort"],
        cwd=project_dir,
        shell=False,
    )

    for _ in range(40):
        if process.poll() is not None:
            print("The dev server stopped before it was ready.")
            wait_before_exit()
            return process.returncode or 1
        if is_expected_flipped_editor():
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
