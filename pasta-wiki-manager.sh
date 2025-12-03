#!/bin/bash

CONFIG_TMP="/tmp/pwm_config.tmp"

pg_local=false
pg_user="pasta-wiki-manager"
pg_password=""
pg_host="127.0.0.1"

if [ -f "$CONFIG_TMP" ]; then
    source "$CONFIG_TMP"
fi

generateBase64Key() {
    openssl rand -base64 32
}

case "$1" in
    config)
        case "$2" in
            reset)
                rm -f .env
                rm -f "$CONFIG_TMP"
                touch .env
                echo "Config reset"
                ;;
            env)
                read -p "Express port (default 3001): " express_port
                read -p "Express public route (default /api/v1): " express_route
                read -p "Frontend url (default localhost:3000): " frontend_url

                if [ "$pg_local" = false ]; then
                    read -p "Postgres server address: " pgsql_db_server
                    read -p "Postgres port (default 5432): " pgsql_db_port
                    read -p "Postgres user: " pgsql_db_user
                    read -sp "Postgres password: " pgsql_db_password
                    echo ""
                    read -p "Postgres database name (default pasta-wiki-manager): " pgsql_db
                else
                    echo "Using local PostgreSQL configuration..."
                    pgsql_db_server="$pg_host"
                    pgsql_db_port="5432"
                    pgsql_db_user="$pg_user"
                    pgsql_db_password="$pg_password"
                    pgsql_db="pasta-wiki-manager"
                fi

                express_port=${express_port:-3001}
                express_route=${express_route:-"/api/v1"}
                frontend_url=${frontend_url:-"localhost:3000"}
                pgsql_db_server=${pgsql_db_server:-$pg_host}
                pgsql_db_port=${pgsql_db_port:-5432}
                pgsql_db_user=${pgsql_db_user:-$pg_user}
                pgsql_db_password=${pgsql_db_password:-$pg_password}
                pgsql_db=${pgsql_db:-"pasta-wiki-manager"}

                cat > .env <<EOF
#EXPRESS values
EXPRESS_PORT=$express_port
EXPRESS_PUBLIC_ROUTE=$express_route

#FRONTEND
FRONTEND_URL=$frontend_url

#POSTGRES VALUES
POSTGRES_USER=$pgsql_db_user
POSTGRES_PASSWORD=$pgsql_db_password
POSTGRES_HOST=$pgsql_db_server
POSTGRES_PORT=$pgsql_db_port
POSTGRES_DATABASE=$pgsql_db

#JWT SECRET KEY
JWT_SECRET=$(generateBase64Key)

# 2FA ENCRYPTION KEY
ENCRYPT_2FA=$(generateBase64Key)
EOF
                echo "Express config saved."
                
                rm -f "$CONFIG_TMP"
                ;;
            *)
                echo "Usage: $0 config {env|reset}"
                exit 1
                ;;
        esac
        ;;

    update)
        echo "Updating..."
        mv .env .env.bak
        find . -type f ! -name "*.bak" -delete
        rm -rf api express_utils client
        curl -L -o pwm_app.zip https://github.com/pastanetwork/pasta-wiki-back/archive/refs/heads/main.zip
        unzip pwm_app.zip -d ../
        rm pwm_app.zip
        mv .env.bak .env
        chmod +x pasta-wiki-manager.sh
        docker compose down
        docker container prune -f
        docker image prune -f
        docker build -t pasta-wiki-manager . # --no-cache
        echo "Updated successfully"
        ./pasta-wiki-manager.sh start
        ;;

    start)
        echo "Starting..."
        docker compose up --detach
        ;;

    stop)
        echo "Stopping..."
        docker compose down
        ;;

    install)
        echo "Installing dependencies"
        apt update
        apt-get install ca-certificates curl unzip
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
        chmod a+r /etc/apt/keyrings/docker.asc

        # Add the repository to Apt sources:
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
          $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
          tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update
        apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
        echo ""

        read -p "Install Postgres? (y/N): " install_postgres
        install_postgres=${install_postgres:-"N"}

        if [[ "$install_postgres" =~ ^[yY]$ ]]; then
            apt install postgresql -y
            pg_local=true

            PG_CONF_DIR=$(find /etc/postgresql -name "postgresql.conf" -type f 2>/dev/null | head -1 | xargs dirname)
            
            if [ -z "$PG_CONF_DIR" ]; then
                echo "Error: PostgreSQL config directory not found!"
                exit 1
            fi

            echo "Configuring PostgreSQL to accept Docker connections..."
            
            sed -i "s/^#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF_DIR/postgresql.conf"
            sed -i "s/^listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF_DIR/postgresql.conf"
            
            if ! grep -q "0.0.0.0/0" "$PG_CONF_DIR/pg_hba.conf"; then
                echo "# Allow all connections" >> "$PG_CONF_DIR/pg_hba.conf"
                echo "host    all    all    0.0.0.0/0    md5" >> "$PG_CONF_DIR/pg_hba.conf"
            fi

            systemctl restart postgresql

            read -p "Postgres username (default: pasta-wiki-manager): " create_pg_user
            create_pg_user=${create_pg_user:-"pasta-wiki-manager"}

            while [ -z "$create_pg_password" ]; do
                read -sp "Password for $create_pg_user: " create_pg_password
                echo ""
                if [ -z "$create_pg_password" ]; then
                    echo "Password cannot be empty!"
                fi
            done

            SQL_TMP=$(mktemp)
            escaped_password=$(echo "$create_pg_password" | sed "s/'/''/g")
            cat > "$SQL_TMP" <<EOSQL
CREATE USER "$create_pg_user" WITH PASSWORD '$escaped_password';
EOSQL
            chmod 644 "$SQL_TMP"
            su - postgres -c "psql -f $SQL_TMP"
            rm -f "$SQL_TMP"
            
            su - postgres -c "createdb -O \"$create_pg_user\" pasta-wiki-manager"
            
            if [ -f "$(pwd)/postgres-init.sql" ]; then
                PGPASSWORD="$create_pg_password" psql -h 127.0.0.1 -U "$create_pg_user" -d pasta-wiki-manager -f "$(pwd)/postgres-init.sql"
            fi
            
            echo "Verifying PostgreSQL connection..."
            if PGPASSWORD="$create_pg_password" psql -h 127.0.0.1 -U "$create_pg_user" -d pasta-wiki-manager -c "SELECT 1;" > /dev/null 2>&1; then
                echo "PostgreSQL connection successful!"
            else
                echo "Warning: Could not verify PostgreSQL connection."
                echo "Check your password and pg_hba.conf configuration."
            fi

            pg_host="host.docker.internal"
            pg_user="$create_pg_user"
            pg_password="$create_pg_password"

            cat > "$CONFIG_TMP" <<EOF
pg_local=true
pg_host="$pg_host"
pg_user="$pg_user"
pg_password="$pg_password"
EOF
        fi

        echo "Environment configuration"
        ./pasta-wiki-manager.sh config env

        echo "Installing Pasta Wiki Manager App..."
        docker build -t pasta-wiki-manager . # --no-cache
        ./pasta-wiki-manager.sh start
        ;;

    *)
        echo "Usage: $0 {start|stop|install|update|config}"
        exit 1
        ;;
esac