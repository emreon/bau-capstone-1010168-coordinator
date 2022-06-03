# Bahcesehir University Capstone Project 1010168 Coordinator

🎱 Raspberry Pi 3 Model B Rev 1.2  
🎱 Camera Module v1  
🎱 NodeJS Version: **16.x**  
🎱 Python Version: **3.x**

📚 [Raspberry Pi Hardware Documentation](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)  
📚 [Raspberry Pi Camera Documentation](https://www.raspberrypi.com/documentation/accessories/camera.html)

---

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

# Connect to the Raspberry Pi ... 🚀
# 🔒 Default Password: raspberry
ssh pi@raspberrypi.local

# Change Password
# ...

# Enable Public Key Authentication for SSH
# ...

# Configure the Raspberry Pi
sudo raspi-config
# ⚙️ Enable Camera:      Interface Options > Camera > Yes > Ok
# ⚙️ Expand Filesystem:  Advanced Options > Expand Filesystem > Ok
# ⚙️ Save Config:        Finish > Yes (Reboot)

# --------------------------------
# 1. Shutdown
# 2. Attach the Camera Module
# 3. Reconnect ... 🚀
# ---------------------------------

# Update the OS
sudo apt update
sudo apt upgrade -y

# Install neofetch (optional)
sudo apt install neofetch -y

# Install nvm
curl -o - https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash

# --------------------------------
# Reconnect ... 🚀
# --------------------------------

# Install Node.js 16 (LTS) and npm
nvm install 16.14.0
nvm use 16.14.0
# node -v
# npm -v

# Install PM2
# https://pm2.keymetrics.io/docs/usage/application-declaration/
# ...

# Install git
sudo apt install git -y
# git --version

# 💾 Coordinator
mkdir capstone
cd capstone
git clone https://github.com/emreon/bau-capstone-1010168-coordinator.git coordinator

cd coordinator
npm ci --production=false
npm run start

# 💾 CV
# python3 --version
# ...
```
