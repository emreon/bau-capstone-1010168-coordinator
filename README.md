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

# Install Node.js 16 and npm
curl -sSL https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt-get install -y nodejs

# Install PM2
# https://pm2.keymetrics.io/docs/usage/application-declaration/
sudo npm i -g pm2
sudo pm2 startup

# Install git
sudo apt install git -y

# 💾 Coordinator
mkdir capstone
cd capstone
git clone https://github.com/emreon/bau-capstone-1010168-coordinator.git coordinator

cd coordinator
npm ci --production=false
# npm run start
pm2 start ecosystem.config.cjs
pm2 save

# 💾 CV
sudo apt install -y python-opencv
sudo apt install -y python3-pip

# pip3 install opencv-python --> IndexError: list index out of range
# https://stackoverflow.com/questions/47011935/indexerror-list-index-out-of-range-using-pip
pip3 install --no-binary --upgrade opencv-python
pip3 install --no-binary --upgrade numpy
pip3 install --no-binary --upgrade matplotlib

cd ~
https://github.com/emreon/bau-capstone-1010168-cv.git

# ...

```
