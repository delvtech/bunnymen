{ config, pkgs, lib, webrtc-star, ... }:

with lib;

let cfg = config.services.webrtc-star;
in {
  options.services.webrtc-star = {
    enable = mkEnableOption "Enable webrtc-star service";

    package = mkOption {
      type = types.package;
      default = webrtc-star;
      defaultText = "pkgs.webrtc-star";
      description = "Set version of webrtc-star to use.";
    };
  };

  config = mkIf cfg.enable {
    environment.systemPackages = [ cfg.package ];
    services.dbus.packages = [ cfg.package ];

    systemd.services.webrtc-star = {
      description = "webrtc-star server daemon";

      wantedBy = [ "multi-user.target" ];
      after = [ "network.target" ]; # if networking is needed

      restartIfChanged = true; # set to false, if restarting is problematic

      serviceConfig = {
        DynamicUser = true;
        ExecStart = "${cfg.package}/bin/webrtc-star";
        Restart = "always";
      };
    };
  };

  meta.maintainers = with lib.maintainers; [ ];
}
