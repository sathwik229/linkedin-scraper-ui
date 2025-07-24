from cookies_loader import load_cookies

# Load cookies dynamically from GCS
cookies = load_cookies()

# Use these cookies in your LinkedIn session
for cookie in cookies:
    driver.add_cookie(cookie) 