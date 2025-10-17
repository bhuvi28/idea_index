import os
import sys

_current_dir = os.path.dirname(__file__)
_project_root = os.path.abspath(os.path.join(_current_dir, ".."))
if _project_root not in sys.path:
    sys.path.append(_project_root)

from backend.main import app  # noqa: E402
