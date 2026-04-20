import os
import pytest

@pytest.hookimpl(trylast=True)
def pytest_configure(config):
    # Ensure the directory exists because pytest-playwright may delete the --output folder
    # completely during its initial configuration cleanup if no tests failed previously.
    os.makedirs("playwright-report", exist_ok=True)
