# Bahcesehir University Capstone Project 1010168 Coordinator

🎱 NodeJS Version: **16.14.0 (LTS)**  
🎱 Python Version: **3+**

```bash
    nvm install 16.14.0
    nvm use 16.14.0
```

## Raspberry Pi Setup

-   Download and run the [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
-   Write `RASPBERRY PI OS LITE (32-BIT)` image to the SD Card
-   Include `wpa_supplicant.conf` in the `/boot` volume of the SD Card
-   Create an empty `ssh` file in the `/boot` volume of the SD Card
-   Power up the Raspberry Pi and connect via ssh

```bash
# Shutdown
# sudo shutdown -h now

# Reboot
# sudo shutdown -r now

# Disconnect
# logout

# Connect to the Raspberry Pi
ssh pi@raspberrypi.local # Default Password: raspberry

# Change Password
# ...

# Enable Public Key Authentication for SSH
# ...

# Configure the Raspberry Pi
sudo raspi-config
# Enable Camera:      Interface Options > Camera > Yes > Ok
# Expand Filesystem:  Advanced Options > Expand Filesystem > Ok
# Save Config:        Finish > Yes (Reboot)

# --------------------------------
# 1. Shutdown
# 2. Attach the Camera Module
# 3. Reconnect ...
# ---------------------------------

# Update the OS
sudo apt update
sudo apt upgrade -y

# Install neofetch (optional)
sudo apt install neofetch -y

# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash

# --------------------------------
# Reconnect ...
# --------------------------------

# Install nodejs 16 (LTS) and npm
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
git clone https://github.com/emreon/bau-capstone-1010168-coordinator.git /var/coordinator/bau-capstone-1010168-coordinator
cd /var/coordinator/bau-capstone-1010168-coordinator
npm ci --include=dev
npm run start

# Install CV Program
# python3 --version
# ...
```

## Raspberry Pi Deploy

```bash
ssh pi@raspberrypi.local

rm -rf /var/coordinator/bau-capstone-1010168-coordinator
git clone https://github.com/emreon/bau-capstone-1010168-coordinator.git /var/coordinator/bau-capstone-1010168-coordinator
cd /var/coordinator/bau-capstone-1010168-coordinator
npm ci --include=dev
npm run start
```
