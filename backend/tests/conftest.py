from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
LAYER_PATH = PROJECT_ROOT / "lambda" / "layer" / "python"

if str(LAYER_PATH) not in sys.path:
    sys.path.insert(0, str(LAYER_PATH))


def load_lambda_module(function_name: str, module_name: str):
    module_path = PROJECT_ROOT / "lambda" / function_name / "app.py"
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load Lambda module: {module_path}")

    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(autouse=True)
def cloudvault_env(monkeypatch):
    monkeypatch.setenv("CLOUDVAULT_BUCKET", "test-cloudvault-bucket")
    monkeypatch.setenv("CLOUDVAULT_TABLE", "test-cloudvault-table")
    monkeypatch.setenv("ALLOWED_FILE_TYPES", "text/plain,image/png,application/pdf")
    monkeypatch.setenv("MAX_FILE_SIZE_BYTES", "1048576")
    monkeypatch.setenv("PRESIGNED_URL_TTL_SECONDS", "300")
    monkeypatch.setenv("LOG_LEVEL", "INFO")
    monkeypatch.setenv("S3_SSE_ALGORITHM", "AES256")
