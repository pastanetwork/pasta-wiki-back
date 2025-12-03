#!/bin/bash

pg_local=false
pg_user="pasta-wiki-manager"
pg_password=""
pg_host="127.0.0.1"

generateBase64Key() {
    openssl rand -base64 32
}

case "$1" in
    config)
        case "$2" in
            reset)
                rm -f .env
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
        rm -R api
        rm -R express_utils
        rm -R client
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
        apt update && apt install unzip -y
        echo ""

        read -p "Install Postgres? (y/N): " install_postgres
        install_postgres=${install_postgres:-"N"}

        if [[ "$install_postgres" =~ ^[yY]$ ]]; then
            apt install postgresql -y
            pg_local=true

            read -p "Postgres username (default: pasta-wiki-manager): " create_pg_user
            create_pg_user=${create_pg_user:-"pasta-wiki-manager"}

            while [ -z "$create_pg_password" ]; do
                read -sp "Password for $create_pg_user: " create_pg_password
                echo ""
                if [ -z "$create_pg_password" ]; then
                    echo "Password cannot be empty!"
                fi
            done

            su - postgres -c "psql -c \"CREATE USER \\\"$create_pg_user\\\" WITH PASSWORD '$create_pg_password';\""
            su - postgres -c "createdb -O \"$create_pg_user\" pasta-wiki-manager"
            su - postgres -c "psql -d pasta-wiki-manager -f $(pwd)/postgres-init.sql"

            pg_host="127.0.0.1"
            pg_user="$create_pg_user"
            pg_password="$create_pg_password"

            export pg_local pg_host pg_user pg_password
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