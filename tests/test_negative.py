import re
from playwright.sync_api import Page, expect

def test_negative_invalid_login(page: Page):
    """
    Attempts to login with a non-existent user and asserts that an error message (like "No active account found with the given credentials") appears.
    """
    page.goto("http://localhost:5173/login")
    page.get_by_placeholder("Username").fill("invaliduser_xyz999")
    page.get_by_placeholder("Password").fill("WrongPassword123!")
    page.get_by_role("button", name="Log In").click()
    
    # SimpleJWT defaults to this error message, or generic "Login failed"
    # We will look for an alert/error box. In Login.jsx it's rendered as text inside a red div.
    error_box = page.locator(".bg-red-100.text-red-700")
    expect(error_box).to_be_visible()
    
    error_text = error_box.inner_text().lower()
    assert "no active account found" in error_text or "not found" in error_text, f"Unexpected error message: {error_text}"

def test_broken_heart_resilience(page: Page):
    """
    Test how the UI handles a complete backend failure (Broken Heart Test).
    We will intercept the network request and fulfill it with a 500 error.
    Then, verify the UI displays a proper error message instead of crashing.
    """
    # 1. First we need an authenticated context or we will intercept the login request OR the notes request.
    # Since we don't really want to login, let's just intercept the login API.
    # Actually wait - Notes dashboard renders notes fetching. Let's intercept the login API first to simulate login success, then go to Notes page and intercept the notes fetch API with a 500.
    
    page.goto("http://localhost:5173/login")
    
    # Mock the login API to return a fake token
    page.route("**/api/auth/login/", lambda route: route.fulfill(
        status=200,
        json={"access": "fake_access_token", "refresh": "fake_refresh_token"}
    ))
    
    # Mock the notes API to return 500 Internal Server Error
    page.route("**/api/notes/", lambda route: route.fulfill(
        status=500,
        body="Internal Server Error"
    ))
    
    page.get_by_placeholder("Username").fill("mockuser")
    page.get_by_placeholder("Password").fill("mockpass")
    page.get_by_role("button", name="Log In").click()
    
    # Wait for the notes page
    expect(page).to_have_url(re.compile(".*\/notes"))
    
    # The Notes component should catch the 500 error from fetchNotes() and display "Failed to fetch notes"
    error_message = page.get_by_text("Failed to fetch notes")
    expect(error_message).to_be_visible()
