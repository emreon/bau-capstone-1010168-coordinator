# Bahcesehir University Capstone Project 1010168 Controller

🎱 NodeJS Version: **16.14.0 (LTS)**

```bash
    nvm install 16.14.0
    nvm use 16.14.0
```

## Raspberry Pi Setup

* Download and run the [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
* Write `RASPBERRY PI OS LITE (32-BIT)` image to the SD Card
* Include `wpa_supplicant.conf` in the `/boot` volume of the SD Card
* Create an empty `ssh` file in the `/boot` volume of the SD Card
* Power up the Raspberry Pi and connect via ssh

```bash
# Connect to the Raspberry Pi and update the OS
ssh pi@raspberrypi.local # Default Password: raspberry
sudo apt update
sudo apt upgrade -y

# Install neofetch (optional)
sudo apt install neofetch -y

# Install nvm, nodejs, npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash # Reconnect after this command
nvm install 16.14.0
# node -v
# npm -v

# Install git
sudo apt install git -y
# git --version

# Setup Coordinator directory
sudo mkdir /var/coordinator
sudo chown -R pi:pi /var/coordinator

# Install & Run Coordinator
cd /var/coordinator
git clone https://github.com/emreon/bau-capstone-1010168-coordinator.git
cd bau-capstone-1010168-coordinator
npm ci
npm run start

# Install CV Program
# python3 --version
# ...
```
