# Host Web-Bolt on Your Own Domain (.com.np)

## What You Need

1. **Domain** - yourdomain.com.np (you have this ✓)
2. **Server/Hosting** - To run your website
3. **DNS Configuration** - Point domain to server

---

## Step-by-Step Process

### Step 1: Choose Hosting Option

You have 3 choices:

#### Option A: VPS (Virtual Private Server) - RECOMMENDED
- Cost: $5-15/month
- Control: Full
- Difficulty: Medium
- Best for: Growing business

#### Option B: Shared Hosting
- Cost: $3-10/month
- Control: Limited
- Difficulty: Easy
- Best for: Simple setup

#### Option C: Cloud Hosting (AWS, Google Cloud)
- Cost: $5-50+/month
- Control: Full
- Difficulty: Hard
- Best for: Scalability

**I recommend Option A (VPS) for you.**

---

## OPTION A: VPS Setup (Step-by-Step)

### Step 1: Buy a VPS

**Popular providers (all work in Nepal):**

1. **DigitalOcean** (Recommended)
   - Go to https://digitalocean.com
   - Sign up
   - Create account

2. **Linode**
   - Go to https://linode.com
   - Sign up

3. **Vultr**
   - Go to https://vultr.com
   - Sign up

**I'll use DigitalOcean as example:**

### Step 2: Create a Droplet (Server)

1. Log in to DigitalOcean
2. Click "Create" → "Droplets"
3. Choose settings:
   - **Image:** Ubuntu 22.04 LTS
   - **Size:** Basic ($5/month) - enough for small business
   - **Region:** Choose closest (Singapore or India)
   - **Authentication:** Password (easier) or SSH key
4. Click "Create Droplet"
5. Wait 2-3 minutes
6. You'll get an IP address like: `123.45.67.89`

### Step 3: Connect to Your Server

Open terminal/command prompt on your computer:

```bash
ssh root@123.45.67.89
```

Enter the password from DigitalOcean email.

You're now inside your server! ✓

### Step 4: Update Server

```bash
apt update
apt upgrade -y
```

### Step 5: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
node --version
npm --version
```

### Step 6: Install Git

```bash
apt install -y git
```

### Step 7: Clone Your Project

```bash
cd /home
git clone https://github.com/yourusername/Web-Bolt.git
cd Web-Bolt
```

Replace `yourusername` with your actual GitHub username.

### Step 8: Install Dependencies

```bash
npm install
```

### Step 9: Build Your Project

```bash
npm run build
```

This creates a `dist/` folder with your production website.

### Step 10: Install Nginx (Web Server)

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### Step 11: Configure Nginx

```bash
nano /etc/nginx/sites-available/default
```

Delete everything and paste this:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    root /home/Web-Bolt/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Save: Press `Ctrl+X` → `Y` → `Enter`

### Step 12: Restart Nginx

```bash
nginx -t
systemctl restart nginx
```

### Step 13: Point Your Domain to Server

**Go to your domain registrar** (where you bought yourdomain.com.np)

Common registrars in Nepal:
- Mercantile Communications
- Sparrow SMS
- Websoftech
- Or any international registrar

**Find DNS Settings** and add this:

**A Record:**
- Name: `@` (or leave blank)
- Type: `A`
- Value: `123.45.67.89` (your server IP)

**Also add (for www):**
- Name: `www`
- Type: `CNAME`
- Value: `yourdomain.com.np`

Save changes.

### Step 14: Wait for DNS Update

DNS takes 5-30 minutes to update. Check:

```bash
nslookup yourdomain.com.np
```

When it shows your IP, you're ready!

### Step 15: Test Your Site

Open browser and go to:
```
http://yourdomain.com.np
```

You should see your website! 🎉

### Step 16: Add HTTPS (SSL Certificate)

```bash
apt install -y certbot python3-certbot-nginx
certbot certonly --nginx -d yourdomain.com.np -d www.yourdomain.com.np
```

Update Nginx config:

```bash
nano /etc/nginx/sites-available/default
```

Replace with:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name yourdomain.com.np www.yourdomain.com.np;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;

    server_name yourdomain.com.np www.yourdomain.com.np;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com.np/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com.np/privkey.pem;

    root /home/Web-Bolt/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Restart:

```bash
systemctl restart nginx
```

Test: `https://yourdomain.com.np` ✓

---

## OPTION B: Shared Hosting (Easier)

If you don't want to manage a server:

### Step 1: Buy Shared Hosting

Popular providers:
- **Bluehost** - $2.95/month
- **SiteGround** - $2.99/month
- **Hostinger** - $2.99/month
- **Local Nepal providers** - Search "Nepal web hosting"

### Step 2: Build Your Project

```bash
npm run build
```

### Step 3: Upload Files

1. Get FTP/SFTP credentials from hosting provider
2. Use FileZilla or similar FTP client
3. Connect to server
4. Upload all files from `dist/` folder to `public_html/`

### Step 4: Create .htaccess

Create file named `.htaccess` in `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Step 5: Point Domain

1. Go to your domain registrar
2. Update DNS to point to hosting provider
3. Wait 24 hours
4. Visit yourdomain.com.np ✓

---

## Updating Your Website

### After Making Changes Locally:

```bash
# On your computer
git add .
git commit -m "Update features"
git push origin main
```

### Deploy to Server:

```bash
# SSH into server
ssh root@123.45.67.89

# Go to project
cd /home/Web-Bolt

# Pull latest changes
git pull origin main

# Rebuild
npm install
npm run build

# Restart Nginx
systemctl restart nginx
```

Done! Your changes are live. ✓

---

## Troubleshooting

### Website shows "Cannot GET /"

**Problem:** Nginx config is wrong

**Solution:**
```bash
nano /etc/nginx/sites-available/default
# Make sure it has: try_files $uri $uri/ /index.html;
systemctl restart nginx
```

### Domain not working

**Problem:** DNS not updated yet

**Solution:**
```bash
# Check DNS
nslookup yourdomain.com.np

# If not showing your IP, wait 24 hours
```

### HTTPS not working

**Problem:** SSL certificate issue

**Solution:**
```bash
# Check certificate
certbot certificates

# Renew if needed
certbot renew --force-renewal
systemctl restart nginx
```

### Website loads but styling is broken

**Problem:** CSS/JS files not loading

**Solution:**
```bash
# Check browser console (F12)
# Look for 404 errors
# Make sure dist/ folder has all files
ls -la /home/Web-Bolt/dist/
```

### Server running slow

**Problem:** Not enough resources

**Solution:**
```bash
# Check what's using resources
top

# If needed, upgrade to larger VPS
```

---

## Security Setup

### Change Root Password

```bash
passwd
```

### Disable Root SSH Login

```bash
nano /etc/ssh/sshd_config
# Find: PermitRootLogin yes
# Change to: PermitRootLogin no
systemctl restart ssh
```

### Setup Firewall

```bash
apt install -y ufw
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Auto-Renew SSL Certificate

```bash
# Already automatic with certbot
# Check status
systemctl status certbot.timer
```

---

## Monitoring Your Site

### Check Server Status

```bash
# SSH into server
ssh root@123.45.67.89

# Check if Nginx is running
systemctl status nginx

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

### View Logs

```bash
# Nginx error logs
tail -f /var/log/nginx/error.log

# Nginx access logs
tail -f /var/log/nginx/access.log
```

---

## Backup Your Data

### Automatic Backup (DigitalOcean)

1. Go to Droplet settings
2. Enable "Backups"
3. Automatic weekly backups

### Manual Backup

```bash
# On server
tar -czf backup.tar.gz /home/Web-Bolt

# Download to your computer
scp root@123.45.67.89:/root/backup.tar.gz ~/backup.tar.gz
```

---

## Cost Breakdown

| Item | Cost | Notes |
|------|------|-------|
| VPS (DigitalOcean) | $5/month | Cheapest option |
| Domain (.com.np) | ~Rs 1000-2000/year | Already have |
| SSL Certificate | FREE | Let's Encrypt |
| **Total** | **$5/month** | **Very affordable** |

---

## Quick Reference Commands

```bash
# Connect to server
ssh root@YOUR_IP

# Check if site is running
curl http://yourdomain.com.np

# Restart Nginx
systemctl restart nginx

# View Nginx status
systemctl status nginx

# Check logs
tail -f /var/log/nginx/error.log

# Update and rebuild
cd /home/Web-Bolt
git pull origin main
npm install
npm run build
systemctl restart nginx

# Check disk space
df -h

# Check memory
free -h
```

---

## Summary

1. **Buy VPS** (DigitalOcean) - $5/month
2. **SSH into server**
3. **Install Node.js, Git, Nginx**
4. **Clone your project**
5. **Build project** (`npm run build`)
6. **Configure Nginx**
7. **Point domain DNS to server IP**
8. **Add SSL certificate**
9. **Visit yourdomain.com.np** ✓

**Total time:** ~30 minutes

**You're live!** 🚀

---

## Need Help?

- **DigitalOcean Docs:** https://docs.digitalocean.com
- **Nginx Docs:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/docs/
- **Git Help:** https://git-scm.com/doc

