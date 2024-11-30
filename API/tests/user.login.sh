#! /bin/sh  

# This is a test to login a user after it has been created in keycloak

source variables.sh

response=$(curl -X POST "http://localhost:8080/realms/$REALM/protocol/openid-connect/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=$CLIENT_ID" \
     -d "grant_type=password" \
     -d "username=$USERNAME" \
     -d "password=$PASSWORD" \
     -d "scope=openid")

access_token=$(echo $response | jq -r '.access_token')
echo "Access Token: $access_token"
#If you get a response like this you are all set:  {"access_token":"eyJh...

#Extract your access_token and now try to retrieve your account personal info:
response=$(curl -X GET "http://localhost:8080/realms/$REALM/protocol/openid-connect/userinfo" \
     -H "Authorization: Bearer $access_token")

#If you get a response like this, it means Keycloak is properly configured : {"sub":"e3c...
if echo "$response" | jq -e '.sub' >/dev/null; then
  echo "OK: The response contains an access_token."
else
  echo "ERROR: The response does not contain an access_token."
fi