import os
import sqlite3
import random
import string
import re
from playwright.sync_api import Page, expect

DB_PATH = os.path.join("backend", "db.sqlite3")

def test_api_and_database_sync(page: Page):
    """
    Test 1: Use UI to create a note and verify it gets correctly 
    inserted into the SQLite db.
    Test 2: Test the backend API directly using playwright.request.
    """
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    username = f"dbuser_{suffix}"
    email = f"db_{suffix}@example.com"
    password = "TestPassword!123"

    # --- SIGNUP & LOGIN ---
    page.goto("http://localhost:5173/signup")
    page.get_by_placeholder("Username").fill(username)
    page.get_by_placeholder("Email").fill(email)
    page.get_by_placeholder("Password").first.fill(password)
    page.get_by_placeholder("Confirm Password").fill(password)
    page.get_by_role("button", name="Sign Up").click()
    expect(page).to_have_url(re.compile(r".*\/login"))

    page.get_by_placeholder("Username").fill(username)
    page.get_by_placeholder("Password").fill(password)
    page.get_by_role("button", name="Log In").click()
    expect(page).to_have_url(re.compile(r".*\/notes"))

    # --- UI CREATION ---
    note_title = f"DB Validation Note {suffix}"
    note_content = "This content should appear in the SQLite backend."
    
    page.get_by_placeholder("Title").fill(note_title)
    page.get_by_placeholder("Content").fill(note_content)
    page.get_by_role("button", name="Add Note").click()
    
    # Wait for UI validation
    expect(page.get_by_text(note_title)).to_be_visible()

    # --- DATABASE VALIDATION ---
    # Connect to SQLite to verify
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("SELECT title, content FROM notes_note WHERE title=?", (note_title,))
    row = cur.fetchone()
    con.close()
    
    assert row is not None, "Note was not found in the SQLite database"
    assert row[0] == note_title, "Saved note title does not match"
    assert row[1] == note_content, "Saved note content does not match"

    # --- API TESTING ---
    # Now interact with the endpoints directly using Playwright API
    # 1. Login to get token
    login_response = page.request.post("http://127.0.0.1:8000/api/auth/login/", data={
        "username": username,
        "password": password
    })
    assert login_response.ok, f"Login API failed: {login_response.text()}"
    tokens = login_response.json()
    access_token = tokens.get("access")

    # 2. Get Notes using API
    get_notes_response = page.request.get("http://127.0.0.1:8000/api/notes/", headers={
        "Authorization": f"Bearer {access_token}"
    })
    
    assert get_notes_response.ok
    notes = get_notes_response.json()
    # Ensure our note is in the API response
    titles = [n.get("title") for n in notes]
    assert note_title in titles, "Note created via UI is not returned by the API"
