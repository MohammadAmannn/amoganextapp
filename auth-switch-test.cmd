@echo off
setlocal

echo.
echo === AUTH ACCOUNT SWITCH COOKIE TEST (curl.exe) ===
echo.

set BASE=http://localhost:3000
set PASS=[PASS]
set FAIL=[FAIL]
set ERRORS=0

:: ─── TEST 1: mobile-logout wipes all identity cookies ──────────────────────
echo --- TEST 1: mobile-logout Response Headers ---
curl.exe -si --max-redirs 0 --cookie "next-auth.session-token=old-jwt; auth_user_data=old_user_encoded; thisisjustarandomstring=old_token; sb-xxxx=supabase_old" %BASE%/api/auth/mobile-logout > "%TEMP%\logout_resp.txt" 2>&1
type "%TEMP%\logout_resp.txt"

echo.
findstr /i "location:" "%TEMP%\logout_resp.txt" | findstr /i "sign-in" >nul
if %errorlevel%==0 (
  echo   %PASS%  Redirects to /sign-in
) else (
  echo   %FAIL%  Did NOT redirect to /sign-in
  set /a ERRORS+=1
)

findstr /i "auth_user_data=" "%TEMP%\logout_resp.txt" | findstr "max-age=0" >nul
if %errorlevel%==0 (
  echo   %PASS%  auth_user_data expired
) else (
  echo   %FAIL%  auth_user_data NOT expired
  set /a ERRORS+=1
)

findstr /i "thisisjustarandomstring=" "%TEMP%\logout_resp.txt" | findstr "max-age=0" >nul
if %errorlevel%==0 (
  echo   %PASS%  thisisjustarandomstring expired
) else (
  echo   %FAIL%  thisisjustarandomstring NOT expired
  set /a ERRORS+=1
)

findstr /i "next-auth.session-token=" "%TEMP%\logout_resp.txt" | findstr "max-age=0" >nul
if %errorlevel%==0 (
  echo   %PASS%  next-auth.session-token expired
) else (
  echo   %FAIL%  next-auth.session-token NOT expired
  set /a ERRORS+=1
)

:: ─── TEST 2: mobile-login purges cookies before OAuth ──────────────────────
echo.
echo --- TEST 2: mobile-login Response Headers ---
curl.exe -si --max-redirs 0 --cookie "auth_user_data=old_user; thisisjustarandomstring=old_token" %BASE%/api/auth/mobile-login > "%TEMP%\login_resp.txt" 2>&1
type "%TEMP%\login_resp.txt"

echo.
findstr /i "location:" "%TEMP%\login_resp.txt" | findstr /i "accounts.google.com" >nul
if %errorlevel%==0 (
  echo   %PASS%  Redirects to Google OAuth
) else (
  echo   %FAIL%  Did NOT redirect to Google OAuth
  set /a ERRORS+=1
)

findstr /i "location:" "%TEMP%\login_resp.txt" | findstr /i "select_account" >nul
if %errorlevel%==0 (
  echo   %PASS%  prompt=select_account in OAuth URL
) else (
  echo   %FAIL%  prompt=select_account MISSING
  set /a ERRORS+=1
)

findstr /i "auth_user_data=" "%TEMP%\login_resp.txt" | findstr "max-age=0" >nul
if %errorlevel%==0 (
  echo   %PASS%  auth_user_data purged before OAuth
) else (
  echo   %FAIL%  auth_user_data NOT purged
  set /a ERRORS+=1
)

findstr /i "thisisjustarandomstring=" "%TEMP%\login_resp.txt" | findstr "max-age=0" >nul
if %errorlevel%==0 (
  echo   %PASS%  thisisjustarandomstring purged before OAuth
) else (
  echo   %FAIL%  thisisjustarandomstring NOT purged
  set /a ERRORS+=1
)

:: ─── SUMMARY ───────────────────────────────────────────────────────────────
echo.
echo === SUMMARY ===
if %ERRORS%==0 (
  echo   ALL TESTS PASSED - Account switching is correctly isolated!
) else (
  echo   %ERRORS% TEST(S) FAILED - Check output above.
)
echo.
endlocal
