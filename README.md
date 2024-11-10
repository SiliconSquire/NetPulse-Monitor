# NetPulse Monitor

A GNOME Shell extension that provides real-time network connectivity monitoring with a clean, color-coded interface.

## Description
NetPulse Monitor is a lightweight GNOME Shell extension that continuously monitors your network connection by pinging Google's DNS server (8.8.8.8). It displays ping times directly in your system tray with intuitive color coding and tracks connection drops and statistics.

## Features
- 🔄 Real-time ping monitoring (updates every second)
- 🎨 Color-coded status indicators:
  - Green: Excellent connection (≤50ms)
  - Orange: Moderate latency (51-100ms)
  - Red: High latency (>100ms)
- 📊 Connection statistics:
  - Public IP address display
  - Failed ping counter
  - Longest connection drop tracker
- ⚡ Minimal resource usage
- 🖥️ Clean system tray integration

## Installation
1. Clone this repository or download the files
2. Copy the files to `~/.local/share/gnome-shell/extensions/netpulse-monitor@yourdomain.com`
3. Log out and log back in, or restart GNOME Shell (Alt+F2, type 'r', press Enter)
4. Enable the extension using GNOME Extensions

## Requirements
- GNOME Shell 3.36 or later
- `curl` command-line tool (for IP address checking)
- `ping` command-line tool

## Usage
The extension will automatically start monitoring once enabled. Click the panel icon to view:
- Your current public IP address
- Number of failed pings
- Duration of longest connection drop

## License
MIT License

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
