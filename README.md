Install service (as root):
```bash
apt update
apt upgrade -y
apt install curl unzip -y
mkdir /var/pasta-wiki-back-main
cd /var/pasta-wiki-back-main
curl -L -o pwm_app.zip https://github.com/pastanetwork/pasta-wiki-back/archive/refs/heads/main.zip
unzip pwm_app.zip -d ../
rm pwm_app.zip
chmod +x pasta-wiki-manager.sh
./pasta-wiki-manager.sh install
docker logs pasta_wiki_manager
```