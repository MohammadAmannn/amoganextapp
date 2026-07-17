================================================================================
CHAT LOGIC & TROUBLESHOOTING GUIDE: RLS POLICIES, PROFILE & CONTACT RELATIONSHIPS
================================================================================

This guide summarizes key database relationships, Row-Level Security (RLS) behaviors,
common API errors, and the exact steps to troubleshoot and test them using Postman.

--------------------------------------------------------------------------------
1. DATABASE RELATIONSHIP SCHEMA
--------------------------------------------------------------------------------
- **profiles table**: Stores registered users' profile info (id, name, email).
- **contacts table**: Represents a private, directional list of contacts:
  * `owner_id` (UUID): The user who owns/added this contact.
  * `contact_user_id` (UUID): The user being added as a contact.
  * `user_uuid` (UUID): Set to the owner_id to assist RLS queries.

--------------------------------------------------------------------------------
2. TROUBLESHOOTING LOGS
--------------------------------------------------------------------------------

### PROBLEM 1: "new row violates row-level security policy for table 'contacts'"
--------------------------------------------------------------------------------
- **Cause A**: Mismatch between the authenticated user's ID (embedded in the JWT access token) and the `owner_id` inside the JSON payload.
  * RLS check constraint: 
    ```sql
    WITH CHECK (auth.uid() = owner_id)
    ```
  * If the token belongs to User A, but you put User B's ID as `owner_id`, it fails.
- **Cause B**: Mismatched `user_uuid` vs. authenticated user.
- **Cause C**: Trying to add yourself as a contact (setting `owner_id` and `contact_user_id` to the exact same value).

**SOLUTION:**
Ensure that both `owner_id` and `user_uuid` match the authenticated user ID (from your token), and `contact_user_id` is the OTHER user's ID you wish to add.

**Correct Example Payload (where User A auth ID is 238d94d2-cfd3-4c47-9bbf-1c43f206d998):**
```json
{
  "owner_id": "238d94d2-cfd3-4c47-9bbf-1c43f206d998",
  "contact_user_id": "6866ec7b-3448-482f-a7c0-0c4683377014",
  "nickname": "Aman",
  "email": "aman@example.com",
  "user_uuid": "238d94d2-cfd3-4c47-9bbf-1c43f206d998"
}
```


### PROBLEM 2: "duplicate key value violates unique constraint 'unique_owner_contact'"
--------------------------------------------------------------------------------
- **Cause**: The database contains a unique constraint:
  ```sql
  CONSTRAINT unique_owner_contact UNIQUE (owner_id, contact_user_id)
  ```
  This prevents a user from adding the same contact user twice.

**SOLUTION:**
- Delete the existing contact first before re-inserting (using DELETE method in Postman):
  ```http
  DELETE /rest/v1/contacts?owner_id=eq.YOUR_ID&contact_user_id=eq.CONTACT_ID
  ```
- Or use a different `contact_user_id` to add a new contact.


### PROBLEM 3: How to Extract the Access Token (Bearer Token)
--------------------------------------------------------------------------------
**For Local Storage (Local Dev Environment):**
1. Sign in to your application at `http://localhost:3000`.
2. Open DevTools (**F12**) -> **Application** -> **Local Storage**.
3. Look for the key `sb-abxwugpdvhmuxoesmumq-auth-token` and copy the `access_token` string.

**For Vercel / Production (Cookie-based Sessions):**
Secure cookie-based sessions (like `@supabase/ssr`) don't store the token in LocalStorage. Instead, use these browser console methods:

- **Method 1: Console Extraction Script (Auto-Search Storage)**
  Paste this into your DevTools console to auto-find the key and copy the token:
  ```javascript
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('auth-token')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.access_token) {
          copy(data.access_token);
          console.log("SUCCESS: Access token copied to your clipboard!");
        }
      } catch(e) {}
    }
  }
  ```

- **Method 2: Network Tab Extraction**
  1. Open DevTools (**F12**) -> **Network** tab.
  2. Type `/rest` in the filter box.
  3. Refresh the page (**F5**) and click on any database request (e.g. `contacts`).
  4. Look under **Request Headers** for:
     ```http
     Authorization: Bearer <token_string_here>
     ```
  5. Copy the long token string.


### PROBLEM 4: "Could not find the table 'public.contacts\n' in the schema cache"
--------------------------------------------------------------------------------
- **Cause**: You have an accidental trailing newline (Enter key) or space at the end of the URL input bar in Postman. The server interprets `contacts\n` as the table name.

**SOLUTION:**
Click inside the Postman URL bar, move the cursor to the very end of the word `contacts`, and press **Backspace** to remove any trailing whitespace or invisible characters.


### PROBLEM 5: Opposite User RLS Error (Aman adding Mohammed Aman)
--------------------------------------------------------------------------------
- **Cause**: You modified the request body to swap IDs:
  * `owner_id`: Aman's ID
  * `contact_user_id`: Mohammed Aman's ID
  But you still sent Mohammed Aman's token in the `Authorization` header. Since `auth.uid()` (Mohammed Aman) != `owner_id` (Aman), the RLS policy block triggered.

**SOLUTION:**
1. Logout from the browser.
2. Login as **Aman**.
3. Extract Aman's access token from the Network tab.
4. Replace the Bearer token in your Postman Authorization header with Aman's token.
5. Send the request.
================================================================================
