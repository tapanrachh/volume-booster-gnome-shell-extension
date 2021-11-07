const { GObject, St, Gio, GLib } = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;
const Volume = imports.ui.status.volume;

var VolumeBooster = GObject.registerClass(
  {
    GTypeName: "VolumeBooster",
    Name: "VolumeBooster",
  },
  class VolumeBooster extends PanelMenu.Button {
    _init() {
      super._init(1, "VolumeBooster", false);
      this.control = Volume.getMixerControl();
      this.output = this.control.get_default_sink();
      this.BOOSTED = false;

      let box = new St.BoxLayout({ style_class: "panel-status-menu-box" });

      this.icon = new St.Icon({
        icon_name: "emblem-music-symbolic",
        style_class: "custom-icon",
      });
      box.add(this.icon);
      this.actor.add_child(box);
      this._buildMenu();
    }

    _destroy() {
      this.output = this.control.get_default_sink();
      this.output.volume = this.control.get_vol_max_norm();
      this.output.push_volume();
      this.destroy();
    }

    _buildMenu() {
      let that = this;

      that.customMenuItem = new PopupMenu.PopupSwitchMenuItem(
        _("Boost Volume (x2) "),
        this.BOOSTED,
        { reactive: true }
      );

      that.customMenuItem.connect("toggled", that._onToggle.bind(that));

      that.menu.addMenuItem(that.customMenuItem);
    }

    _onToggle() {
      this.output = this.control.get_default_sink();
      this.BOOSTED = this.customMenuItem.state;

      if (!this.BOOSTED) {
        this.output.volume = this.control.get_vol_max_norm();
        this.output.push_volume();
        this.icon.remove_style_class_name("boosted");
      } else {
        this.output.volume = this.control.get_vol_max_amplified() * 2;
        this.output.change_is_muted(false);
        this.output.push_volume();
        this.icon.add_style_class_name("boosted");
      }
    }
  }
);
