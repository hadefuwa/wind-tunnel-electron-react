# Raspberry Pi Update Guide

## Quick Update (Recommended)

1. **Open Terminal on your Raspberry Pi**
   ```bash
   # Navigate to your project directory
   cd /home/pi/wind-tunnel-electron-react
   ```

2. **Stop the current app** (if running)
   ```bash
   # Press Ctrl+C if the app is running in terminal
   # Or kill the process
   pkill -f "wind-tunnel-electron"
   ```

3. **Pull latest changes**
   ```bash
   git pull origin main
   ```

4. **Install dependencies** (if needed)
   ```bash
   npm install
   ```

5. **Build the app**
   ```bash
   npm run build
   ```

6. **Start the app**
   ```bash
   npm start
   ```

## Using the Update Script

1. **Make the script executable**
   ```bash
   chmod +x scripts/update-pi.sh
   ```

2. **Run the update script**
   ```bash
   ./scripts/update-pi.sh
   ```

## Troubleshooting

### If git pull fails:
```bash
# Check your git status
git status

# If you have local changes, stash them
git stash

# Then pull again
git pull origin main
```

### If npm install fails:
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

### If the app won't start:
```bash
# Check if port 3000 is in use
sudo lsof -i :3000

# Kill any processes using the port
sudo kill -9 <PID>
```

## What's New in This Update

✅ **Fixed touchscreen scrolling** - You can now scroll up and down on your Pi's touchscreen  
✅ **Better touch targets** - Buttons are easier to tap  
✅ **Smooth scrolling** - Improved scrolling performance  
✅ **Touch feedback** - Visual feedback when pressing buttons  

## Verify the Update

After updating, you should be able to:
- Scroll up and down on the dashboard
- Tap buttons more easily
- See smooth scrolling behavior
- Get visual feedback when pressing buttons

If you're still having issues, check the terminal output for any error messages. 