import re
import random
import string
import pytest
from playwright.sync_api import Page, expect

def test_user_journey(page: Page):
    """
    E2E Test Scenario covering:
    1. User Signup (to ensure clean state)
    2. User Login
    3. Creating a Note
    4. Deleting a Note
    """
    
    # Generate random user data for test isolation
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    username = f"testuser_{suffix}"
    email = f"test_{suffix}@example.com"
    password = "TestPassword!123"

    # --- 1. SIGNUP ---
    page.goto("http://localhost:5173/signup")
    page.get_by_placeholder("Username").fill(username)
    page.get_by_placeholder("Email").fill(email)
    
    # For signup, there are two password fields ("Password" and "Confirm Password")
    page.get_by_placeholder("Password").first.fill(password)
    page.get_by_placeholder("Confirm Password").fill(password)
    
    page.get_by_role("button", name="Sign Up").click()

    # Wait for navigation to login page
    expect(page).to_have_url(re.compile(".*\/login"))

    # --- 2. LOGIN ---
    page.get_by_placeholder("Username").fill(username)
    page.get_by_placeholder("Password").fill(password)
    page.get_by_role("button", name="Log In").click()

    # Wait for navigation to notes dashboard
    expect(page).to_have_url(re.compile(".*\/notes"))
    expect(page.get_by_role("heading", name="My Notes")).to_be_visible()

    # --- 3. CREATE A NOTE ---
    note_title = f"My Test Note {suffix}"
    note_content = "This is a test note created by Playwright E2E automation."
    
    page.get_by_placeholder("Title").fill(note_title)
    page.get_by_placeholder("Content").fill(note_content)
    page.get_by_role("button", name="Add Note").click()

    # Verify the created note is visible on the page
    expect(page.get_by_role("heading", name=note_title)).to_be_visible()
    expect(page.get_by_text(note_content)).to_be_visible()

    # --- 4. DELETE A NOTE ---
    # Find the specific note card that contains our dynamic title and click its Delete button
    note_card = page.locator("div.bg-white.rounded-lg.shadow-md.p-6").filter(has_text=note_title)
    note_card.get_by_role("button", name="Delete").click()

    # Verify the note is removed from the dashboard
    expect(page.get_by_role("heading", name=note_title)).to_be_hidden()
    expect(page.get_by_text(note_content)).to_be_hidden()
