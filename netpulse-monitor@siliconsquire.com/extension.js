const { St, GLib, Clutter, GObject } = imports.gi;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

let NetworkMonitor = GObject.registerClass(
  class NetworkMonitor extends PanelMenu.Button {
    _init() {
      super._init(0.0, "Network Monitor");

      this.stats = {
        dropStartTime: null,
        longestDrop: 0,
        lastSuccess: Date.now(),
        failCount: 0,
      };

      // Panel button
      this.buttonText = new St.Label({
        text: "...",
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.add_child(this.buttonText);

      // Menu items
      this.ipItem = new PopupMenu.PopupMenuItem("Public IP: Checking...");
      this.failedItem = new PopupMenu.PopupMenuItem("Failed Pings: 0");
      this.dropItem = new PopupMenu.PopupMenuItem("Longest Drop: 0s");

      this.menu.addMenuItem(this.ipItem);
      this.menu.addMenuItem(this.failedItem);
      this.menu.addMenuItem(this.dropItem);

      // Update IP when menu opens
      this.menu.connect("open-state-changed", (menu, open) => {
        if (open) {
          this._updatePublicIP();
        }
      });

      // Start monitoring
      this._timeout = null;
      this._startMonitoring();
    }

    _updatePublicIP() {
      this.ipItem.label.text = "Public IP: Checking...";
      try {
        let [success, stdout, stderr] = GLib.spawn_command_line_sync(
          "curl -s -m 5 ifconfig.me"
        );

        if (success && stdout) {
          let ip = stdout.toString().trim();
          if (ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
            this.ipItem.label.text = `Public IP: ${ip}`;
            return;
          }
        }
        this.ipItem.label.text = "Public IP: Connection Failed";
      } catch (e) {
        this.ipItem.label.text = "Public IP: Connection Failed";
      }
    }

    _checkPing() {
      try {
        let [success, stdout, stderr] = GLib.spawn_command_line_sync(
          "ping -c 1 -W 1 8.8.8.8"
        );

        if (success && stdout.toString().includes("time=")) {
          let now = Date.now();

          // If we were in a drop state, calculate duration
          if (this.stats.dropStartTime) {
            let dropDuration = (now - this.stats.dropStartTime) / 1000;
            if (dropDuration > this.stats.longestDrop) {
              this.stats.longestDrop = dropDuration;
              this.dropItem.label.text = `Longest Drop: ${dropDuration.toFixed(
                1
              )}s`;
            }
            this.stats.dropStartTime = null;
          }

          this.stats.lastSuccess = now;
          let match = stdout.toString().match(/time=([\d.]+)/);
          this.buttonText.set_text(`${match[1]}ms`);
          this._updateColor(parseFloat(match[1]));
        } else {
          // Ping failed
          this.stats.failCount++;
          this.buttonText.set_text("fail");
          this.buttonText.set_style("color: rgb(255, 84, 84)");
          this.failedItem.label.text = `Failed Pings: ${this.stats.failCount}`;

          // Start tracking drop if we haven't already
          if (!this.stats.dropStartTime) {
            this.stats.dropStartTime = this.stats.lastSuccess;
          }
        }
      } catch (e) {
        // System error
        this.stats.failCount++;
        this.buttonText.set_text("err");
        this.buttonText.set_style("color: rgb(255, 84, 84)");
        this.failedItem.label.text = `Failed Pings: ${this.stats.failCount}`;

        if (!this.stats.dropStartTime) {
          this.stats.dropStartTime = this.stats.lastSuccess;
        }
      }

      return true;
    }

    _updateColor(ping) {
      if (ping <= 50) {
        this.buttonText.set_style("color: rgb(87, 227, 137)");
      } else if (ping <= 100) {
        this.buttonText.set_style("color: rgb(255, 167, 89)");
      } else {
        this.buttonText.set_style("color: rgb(255, 84, 84)");
      }
    }

    _startMonitoring() {
      this._timeout = Mainloop.timeout_add_seconds(
        1,
        this._checkPing.bind(this)
      );
    }

    destroy() {
      if (this._timeout) {
        Mainloop.source_remove(this._timeout);
        this._timeout = null;
      }
      super.destroy();
    }
  }
);

let networkMonitor;

function init() {
  // Nothing needed here
}

function enable() {
  networkMonitor = new NetworkMonitor();
  Main.panel.addToStatusArea("network-monitor", networkMonitor, 0, "right");
}

function disable() {
  if (networkMonitor) {
    networkMonitor.destroy();
    networkMonitor = null;
  }
}
