import os
import pytest

@pytest.hookimpl(tryfirst=True)
def pytest_sessionfinish(session, exitstatus):
    # Ensure the directory exists because pytest-playwright deletes the --output folder
    # completely during its initial configuration cleanup.
    # By running this 'tryfirst' in sessionfinish, it fires right before pytest-html saves.
    os.makedirs("playwright-report", exist_ok=True)
