# SDPS Mobile
**Smart Drainage Protection System — Mobile App**
React Native (Expo SDK 52) · IT323 Application Development

---

## ▶ How to Run

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Start the app
```bash
npx expo start --clear
```

### Step 3 — Open on Android emulator
Press **`a`** in the terminal after Metro starts.

> Works on **Pixel emulators (any API level)** and physical Android devices via Expo Go.

---

## 📁 Project Structure

```
sdps-mobile/
├── App.js                        ← Navigation entry point
├── theme.js                      ← Colors, sensor data, helpers
├── app.json                      ← Expo config
├── package.json
├── babel.config.js
├── components/
│   ├── SensorCard.js             ← Reusable sensor card (full + compact)
│   ├── LevelBar.js               ← Water/waste level bar
│   ├── CooldownTimer.js          ← Live alert cooldown countdown
│   └── StatusBadge.js            ← Status pill (Critical/Warning/Normal)
└── screens/
    ├── LoginScreen.js
    ├── DashboardScreen.js
    ├── AlertsScreen.js
    └── SensorDataScreen.js
```

---

## 🐙 How to Upload to GitHub

### Step 1 — Create a GitHub account
Go to https://github.com and sign up if you don't have an account.

### Step 2 — Create a new repository
1. Click the **+** button (top right) → **New repository**
2. Name it: `sdps-mobile`
3. Set it to **Public** or **Private**
4. **Do NOT** check "Add a README" (we already have one)
5. Click **Create repository**

### Step 3 — Install Git (if not installed)
Download from https://git-scm.com/download/win and install with default settings.

### Step 4 — Open terminal in your project folder
In VS Code: open the terminal and make sure you're inside the `SDPS-mobile` folder:
```bash
cd C:\Users\Angelo\SDPS-Mobile\SDPS-mobile
```

### Step 5 — Initialize Git and push
Run these commands **one by one**:

```bash
git init
```
```bash
git add .
```
```bash
git commit -m "AppDev-L6: Mobile UI adaptation completed"
```
```bash
git branch -M main
```
```bash
git remote add origin https://github.com/YOUR_USERNAME/sdps-mobile.git
```
> ⚠️ Replace `YOUR_USERNAME` with your actual GitHub username

```bash
git push -u origin main
```

### Step 6 — Sign in to GitHub
A browser window or login prompt will appear — sign in with your GitHub account.

### Step 7 — Done!
Go to `https://github.com/YOUR_USERNAME/sdps-mobile` to see your uploaded repo.

---

## 🔄 How to Push Future Changes

Whenever you make changes and want to save them to GitHub:
```bash
git add .
git commit -m "your message here"
git push
```

---

## Commit Message for Submission
```
AppDev-L6: Mobile UI adaptation completed
```
