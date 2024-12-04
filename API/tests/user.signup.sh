#!/bin/sh

# Test script for user signup, login, and verification

source variables.sh

# Generate a unique username for this test
UNIQUE_USERNAME="testuser_$(date +%s)"
TEST_EMAIL="${UNIQUE_USERNAME}@example.com"
TEST_PASSWORD="TestPassword123!"

API_HOST="http://localhost"

echo "Testing signup for user: $UNIQUE_USERNAME"

# 1. Signup
signup_response=$(curl -s -X POST "$API_HOST:$APIPORT/api/users/signup" \
     -H "Content-Type: application/json" \
     -d "{\"username\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "Signup Response: $signup_response"

# Check if signup was successful
if echo "$signup_response" | jq -e '.token' >/dev/null; then
  echo "OK: Signup successful. Access token received."
  signup_token=$(echo $signup_response | jq -r '.token')
else
  echo "ERROR: Signup failed."
  exit 1
fi

# 2. Login
# login_response=$(curl -s -X POST "$API_HOST:$APIPORT/api/users/login" \
#      -H "Content-Type: application/x-www-form-urlencoded" \
#      -d "username=$UNIQUE_USERNAME" \
#      -d "password=$TEST_PASSWORD")

# echo "Login Response: $login_response"

# # Check if login was successful
# if echo "$login_response" | jq -e '.access_token' >/dev/null; then
#   echo "OK: Login successful. Access token received."
#   login_token=$(echo $login_response | jq -r '.access_token')
# else
#   echo "ERROR: Login failed."
#   exit 1
# fi
# Firebase configuration
API_KEY="AIzaSyAcr0JlLKucSQfzEJmVRK8_0ETURHnrSb8"
FIREBASE_AUTH_URL="https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY"

# Login using Firebase
login_response=$(curl -s -X POST "$FIREBASE_AUTH_URL" \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"returnSecureToken\":true}")

echo "Login Response: $login_response"

# Check if login was successful
if echo "$login_response" | jq -e '.idToken' >/dev/null; then
  echo "OK: Login successful. ID token received."
  id_token=$(echo $login_response | jq -r '.idToken')
else
  echo "ERROR: Login failed."
  exit 1
fi


# 3. Verify user info
# Access protected content
protected_response=$(curl -s -X GET "$API_HOST:$APIPORT/api/users/protected" \
     -H "Authorization: Bearer $id_token")

echo "Protected Content Response: $protected_response"

# Check if protected content retrieval was successful
if echo "$protected_response" | jq -e '.message' >/dev/null; then
  echo "OK: Protected content retrieved successfully."
else
  echo "ERROR: Failed to retrieve protected content."
  exit 1
fi


echo "All tests passed successfully!"