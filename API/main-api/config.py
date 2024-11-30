from pydantic_settings import BaseSettings
from pydantic import Field
from keycloak import KeycloakOpenID, KeycloakAdmin, KeycloakOpenIDConnection

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


class Settings(BaseSettings):
    keycloak_server_url: str = Field(..., env="KEYCLOAK_SERVER_URL")
    keycloak_realm: str = Field(..., env="KEYCLOAK_REALM")
    keycloak_client_id: str = Field(..., env="KEYCLOAK_CLIENT_ID")
    keycloak_client_secret: str = Field(..., env="KEYCLOAK_CLIENT_SECRET")
    psql_db_name: str = Field(..., env="PSQL_DB_NAME")
    psql_hostname: str = Field(..., env="PSQL_HOSTNAME")
    psql_username: str = Field(..., env="PSQL_USERNAME")
    psql_password: str = Field(..., env="PSQL_PASSWORD")
    psql_port: str = Field("5432", env="PSQL_PORT")


    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

keycloak_openid = KeycloakOpenID(
    server_url=settings.keycloak_server_url,
    realm_name=settings.keycloak_realm,
    client_id=settings.keycloak_client_id,
    client_secret_key=settings.keycloak_client_secret,
)

keycloak_connection = KeycloakOpenIDConnection(
    server_url=settings.keycloak_server_url,
    username='admin',
    password='admin',
    realm_name=settings.keycloak_realm,
    client_id=settings.keycloak_client_id,
    client_secret_key=settings.keycloak_client_secret,
    verify=True
)

keycloak_admin = KeycloakAdmin(connection=keycloak_connection)

# POSTGRESQL connections:
# connect to the default database (in case the desired one does not exist)
conn = psycopg2.connect(
    dbname='postgres',
    host=settings.psql_hostname,
    # database=settings.psql_db_name,
    user=settings.psql_username,
    password=settings.psql_password,
    port=settings.psql_port
)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
dbcursor = conn.cursor()
# validate if the database exists
db_name = settings.psql_db_name
dbcursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
exists = dbcursor.fetchone()
# create the desired database
if not exists:
    dbcursor.execute(f"CREATE DATABASE {db_name}")
    print(f"Database '{db_name}' created successfully")
    # Close the current connection
else:
    print(f"Database '{db_name}' already exists")
# close the default connection and start a new one
conn.close()
conn = psycopg2.connect(
    dbname=settings.psql_db_name,
    host=settings.psql_hostname,
    user=settings.psql_username,
    password=settings.psql_password,
    port=settings.psql_port
)
# Create a new cursor
dbcursor = conn.cursor() # use this cursor

def get_openid_config():
    return keycloak_openid.well_known()