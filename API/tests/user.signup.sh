#!/bin/sh

# Test script for user signup, login, and verification

source variables.sh

# Generate a unique username for this test
UNIQUE_USERNAME="testuser_$(date +%s)"
TEST_EMAIL="${UNIQUE_USERNAME}@example.com"
TEST_PASSWORD="TestPassword123!"

echo "Testing signup for user: $UNIQUE_USERNAME"

# 1. Signup
signup_response=$(curl -s -X POST "http://localhost:$APIPORT/signup" \
     -H "Content-Type: application/json" \
     -d "{\"username\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "Signup Response: $signup_response"

# Check if signup was successful
if echo "$signup_response" | jq -e '.access_token' >/dev/null; then
  echo "OK: Signup successful. Access token received."
  signup_token=$(echo $signup_response | jq -r '.access_token')
else
  echo "ERROR: Signup failed."
  exit 1
fi

# 2. Login
login_response=$(curl -s -X POST "http://localhost:$APIPORT/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=$UNIQUE_USERNAME" \
     -d "password=$TEST_PASSWORD")

echo "Login Response: $login_response"

# Check if login was successful
if echo "$login_response" | jq -e '.access_token' >/dev/null; then
  echo "OK: Login successful. Access token received."
  login_token=$(echo $login_response | jq -r '.access_token')
else
  echo "ERROR: Login failed."
  exit 1
fi

# 3. Verify user info
userinfo_response=$(curl -s -X GET "http://localhost:$APIPORT/protected" \
     -H "Authorization: Bearer $login_token")

echo "User Info Response: $userinfo_response"

# Check if user info retrieval was successful
if echo "$userinfo_response" | jq -e '.username' >/dev/null; then
  echo "OK: User info retrieved successfully."
  retrieved_username=$(echo $userinfo_response | jq -r '.username')
  if [ "$retrieved_username" = "$UNIQUE_USERNAME" ]; then
    echo "OK: Username matches. Test passed."
  else
    echo "ERROR: Username mismatch. Expected $UNIQUE_USERNAME, got $retrieved_username"
    echo "$userinfo_response"
    exit 1
  fi
else
  echo "ERROR: Failed to retrieve user info."
  exit 1
fi

echo "All tests passed successfully!"