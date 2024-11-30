
# this is to test access the API behind keycloak 
source variables.sh

# test wrong username and password
response=$(curl -X POST http://localhost:$APIPORT/login   \
    -H "Content-Type: application/x-www-form-urlencoded"   \
    -d "username=$USERNAME&password=aa-$PASSWORD")

#If you get a response like this, it means Keycloak is properly configured : {"sub":"e3c...
if echo "$response" | jq -e '.access_token' >/dev/null; then
  echo "ERROR: The response does contain access_token."
  exit 1 
else
  echo "OK: The response does not contains an access_token."
fi

# test the retrival of access token
response=$(curl -X POST http://localhost:$APIPORT/login   \
    -H "Content-Type: application/x-www-form-urlencoded"   \
    -d "username=$USERNAME&password=$PASSWORD")

access_token=$(echo $response | jq -r '.access_token')

if echo "$response" | jq -e '.access_token' >/dev/null; then
  echo "OK: The response contains an access_token."
else
  echo "ERROR: The response does not contain an access_token."
  echo "$response"
  exit 1 
fi

echo "Access Token: ${access_token:0:15}..."
#If you get a response like this you are all set:  {"access_token":"eyJh...


# access the protected content with the token
response=$(curl -X GET http://localhost:$APIPORT/protected \
    -H "Authorization: Bearer $access_token")

echo "Response protected content: ${response:0:15}..."

if echo "$response" | jq -e '.preferred_username' >/dev/null; then
  echo "OK: The response contains an preferred_username."
else
  echo "ERROR: The response does not contain an preferred_username."
  echo "$response"
  exit 1 
fi