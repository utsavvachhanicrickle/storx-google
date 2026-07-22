<!-- http://127.0.0.1:10002/password-recovery?token=k176-OYHFTrGn5VoIhkOVpqo3sWT3H2Jbcv6t8jDwa4= -->



StorX Network Development Environment Setup Guide
Overview
This guide provides step-by-step instructions for setting up a complete StorX Network development environment, including the main satellite server, web UI, gateway node, and backup tools.
Prerequisites:

- Go 1.19+ installed
- Node.js 16+ and npm
- PostgreSQL 12+
- Redis Server
- Git

1.  Database Setup
<!-- just creates one db as name "storx" -->

Create PostgreSQL database
Go to psql terminal And Run:
CREATE DATABASE storx;
CREATE USER hemant WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE storx TO hemant;"

Optional: Make hemant a superuser (not recommended unless necessary):
ALTER USER hemant WITH SUPERUSER;

2.  Repository Cloning
    Create project directory
    mkdir storx && cd storx

Clone required repositories
git clone https://github.com/StorX2-0/storxweb.git
git clone https://github.com/StorXNetwork/StorXMonitor.git
git clone https://github.com/StorX2-0/gateway-mt.git
git clone https://github.com/princeparmar/Backup-Tools.git
git clone https://github.com/StorXNetwork/gateway-st.git

3.  Dependency Installation
Install Redis Server:
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
<!-- make sure redis is running before running the  -->

3.1 Install StorX Monitor Dependencies
Go to storxMonitor dir and run :
go install ./...

make install-sim WEB3_AUTH_PRIVATE_KEY=0e79e60e189c8a855fd11ae7040019193ad3aaac23ff991f81deae57f680efba

3.2 Install Gateway Dependencies
Go to gateway-mt dir and run:
go install ./...

3.3 Install Web UI Dependencies
Go to storxweb dir and run :
npm install
npm run build

3.4 Install backup-tools dependency:
Go to backup tools directory set .env and run :
 go run cmd/main.go
Make setup

4.  Network Setup
    Set up StorX network with PostgreSQL
    storj-sim network setup --postgres="postgres://hemant:5689@127.0.0.1:5432/storx?sslmode=disable" --host 127.0.0.1

        OR

        storxnetwork-sim network setup --postgres="postgres://dhaval:5450@127.0.0.1:5432/mystorx?sslmode=disable" --host 127.0.0.1

5.  Service Execution
    Start Satellite Network (Terminal 1)
    storj-sim network run --no-gateways

OR

    storxnetwork-sim network run --no-gateways --host 127.0.0.1

Whenever first time you run this command you will get error like
html/template path doesnt exists or like that for this error
Go to /home/sbl/.local/share/storj/local-network/satellite/0 this path and you will find config.yaml file in this file search “mail.template-path:” check if this path correct or not if not then add correct path

congif file (exmple)
