# Raspberry Pi Update Guide

## Quick Update (Recommended)

1. **Open Terminal on your Raspberry Pi**
   ```bash
   # Navigate to your project directory (matrix user)
   cd /home/matrix/wind-tunnel-electron-react
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
   
   **Note:** If `npm start` doesn't work, use:
   ```bash
   npm run electron
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

## Permission Issues

### If you get "Permission denied" when accessing /home/matrix/:

**Option 1: Check if you're in the right directory**
```bash
# Check your current user
whoami

# Should show 'matrix'
```

**Option 2: Use your home directory shortcut**
```bash
# Navigate to your home directory
cd ~/wind-tunnel-electron-react

# Or explicitly
cd /home/matrix/wind-tunnel-electron-react
```

**Option 3: Find where your project actually is**
```bash
# Search for the project directory
find /home -name "wind-tunnel-electron-react" 2>/dev/null

# Or check if it's in your home directory
ls -la ~/wind-tunnel-electron-react
```

### If the project is in a different location:
```bash
# Use the path from find command
cd /path/to/your/wind-tunnel-electron-react
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

### If you get merge conflicts:
```bash
# Stash your local changes
git stash

# Pull the latest changes
git pull origin main

# If you want to reapply your changes later
git stash pop
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