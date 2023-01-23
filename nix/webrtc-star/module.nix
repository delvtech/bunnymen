{ webrtcStarPkg }:

({ config, pkgs, lib, ... }:

  with lib;

  let cfg = config.services.webrtc-star;
  in {
    options.services.webrtc-star = {
      enable = mkEnableOption "Enable webrtc-star service";

      package = mkOption {
        type = types.package;
        default = webrtcStarPkg;
        defaultText = "pkgs.webrtc-star";
        description = "Set version of webrtc-star to use.";
      };

      port = mkOption {
        type = types.int;
        default = 9090;
        defaultText = "9090";
        description = "Local port server will run on";
      };

      nginx = mkOption {
        default = { };
        description = lib.mdDoc ''
          Configuration for nginx reverse proxy.
        '';

        type = types.submodule {
          options = {
            enable = mkOption {
              type = types.bool;
              default = true;
              description = lib.mdDoc ''
                Configure the nginx reverse proxy settings.
              '';
            };

            enableHttps = mkOption {
              type = types.bool;
              default = true;
              description = lib.mdDoc ''
                Enables ACME certification on host name
              '';
            };

            hostName = mkOption {
              type = types.str;
              description = lib.mdDoc ''
                The hostname used to setup the virtualhost configuration
              '';
            };
          };
        };
      };

    };

    config = mkIf cfg.enable (mkMerge [

      {
        environment.systemPackages = [ cfg.package ];
        services.dbus.packages = [ cfg.package ];

        systemd.services.webrtc-star = {
          description = "webrtc-star server daemon";
          wantedBy = [ "multi-user.target" ];
          after = [ "network.target" ]; # if networking is needed
          restartIfChanged = true; # set to false, if restarting is problematic
          serviceConfig = {
            DynamicUser = true;
            ExecStart =
              "${cfg.package}/bin/webrtc-star -p ${toString cfg.port}";
            Restart = "always";
          };
        };
      }

      (mkIf cfg.nginx.enable {
        services.nginx = {
          enable = true;
          recommendedProxySettings = true;
          virtualHosts."${cfg.nginx.hostName}" = {
            locations."/" = {
              proxyPass = "http://127.0.0.1:${toString cfg.port}";
              proxyWebsockets = true; # needed for upgrade
              extraConfig = ''
                proxy_ssl_server_name on;
                proxy_pass_header Authorization;
              '';
            };
          };
        };
      })

      (mkIf cfg.nginx.enableHttps {
        users.users."nginx".extraGroups = [ "acme" ];

        security.acme.acceptTerms = lib.mkDefault true;
        security.acme.certs."${cfg.nginx.hostName}" = {
          webroot = "/var/lib/acme/acme-challenge/";
          email = "admin@${cfg.nginx.hostName}";
        };

        services.nginx = {
          recommendedTlsSettings = true;
          virtualHosts."${cfg.nginx.hostName}" = {
            enableACME = lib.mkDefault true;
            forceSSL = lib.mkDefault true;
          };
        };
      })
    ]);
  })
