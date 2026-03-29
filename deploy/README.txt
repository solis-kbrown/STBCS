============================================================
  STB Cybersecurity — OVH Cloud Deployment Package
  stbcybersecurity.com | (855) STB-1987
============================================================

This folder contains everything you need to deploy STBCS
on your OVH Cloud VM (or any Ubuntu 24.04 server).

FILES IN THIS PACKAGE
---------------------

  DEPLOYMENT_GUIDE.md
      The full step-by-step guide with explanations for
      every decision. Read this first if you want to
      understand what each piece does.

  deploy/setup.sh
      THE SERVER SETUP SCRIPT. Run this once on a fresh
      Ubuntu 24.04 server as root. It installs and configures
      everything: Node.js, PostgreSQL, Caddy, firewall,
      Fail2Ban, PM2, automated backups, security patches.

  deploy/go.sh
      THE BUILD & LAUNCH SCRIPT. Run this after setup.sh
      and after editing .env with your API keys. It installs
      npm packages, builds the app, creates all database
      tables, starts the app with PM2, and verifies it's
      running.

  deploy/update.sh
      THE UPDATE SCRIPT. Run this whenever you push new
      code. It pulls from GitHub, rebuilds, syncs the
      database, and restarts the app.

  deploy/README.txt
      This file.


QUICK START (4 STEPS)
---------------------

1. SSH into your OVH Cloud VM:

     ssh ubuntu@YOUR_SERVER_IP
     sudo -i

2. Upload this entire project to your server:

     scp -r /path/to/stb-cybersecurity ubuntu@YOUR_SERVER_IP:/opt/stb-cybersecurity

   Or clone from GitHub:

     git clone https://github.com/YOUR_USERNAME/stb-cybersecurity.git /opt/stb-cybersecurity

3. Run the setup script (as root):

     cd /opt/stb-cybersecurity
     chmod +x deploy/*.sh
     sudo ./deploy/setup.sh

4. Edit .env with your real API keys:

     nano /opt/stb-cybersecurity/.env

   Fill in: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY,
   STRIPE_WEBHOOK_SECRET, RESEND_API_KEY

5. Build and launch (as stbcs user):

     su - stbcs
     cd /opt/stb-cybersecurity
     ./deploy/go.sh


AFTER LAUNCH
------------

  - Point your DNS A records to the server IP
  - Update Stripe webhook URL to:
    https://stbcybersecurity.com/api/stripe/webhook
  - That's it. Caddy handles HTTPS automatically.


UPDATING LATER
--------------

     su - stbcs
     cd /opt/stb-cybersecurity
     ./deploy/update.sh


DAILY OPERATIONS
----------------

  Start:      pm2 start ecosystem.config.cjs
  Stop:       pm2 stop stbcs
  Restart:    pm2 restart stbcs
  Logs:       pm2 logs stbcs
  Status:     pm2 status
  Monitor:    pm2 monit
  Backup now: /opt/stb-cybersecurity/backup.sh

============================================================
