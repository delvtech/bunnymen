{ modulesPath, pkgs, ... }:

{
  imports = [ "${modulesPath}/virtualisation/amazon-image.nix" ];
  ec2.hvm = true;

  nix = {
    extraOptions = "experimental-features = nix-command flakes";
    settings = {
      substituters =
        [ "https://nix-community.cachix.org" "https://cache.nixos.org" ];
      trusted-public-keys = [
        "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
        "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
      ];
      trusted-users = [ "@wheel" ];
      allowed-users = [ "@wheel" ];
    };
  };

  environment.systemPackages = with pkgs; [
    vim
    htop
    curl
    docker
    docker-compose
  ];

  virtualisation.docker.enable = true;

  services.openssh = {
    enable = true;
    passwordAuthentication = false;
  };

  users.users."root".openssh.authorizedKeys.keys = [
    "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEFlro/QUDlDpaA1AQxdWIqBg9HSFJf9Cb7CPdsh0JN7"
  ];
  system.stateVersion = "22.11";

  services.webrtc-star.enable = true;

  networking.firewall.enable = true;
  networking.firewall.rejectPackets = true;
  networking.firewall.allowedTCPPorts = [
    80 # nginx
    443 # nginx
  ];

  # security.acme.acceptTerms = true;
  # security.acme.certs."bunnymen.delvelabs.xyz" = {
  #   webroot = "/var/lib/acme/acme-challenge/";
  #   email = "jonny@delvelabs.xyz";
  # };

  # users.users."nginx".extraGroups = [ "acme" ];
  # services.nginx = {
  #   enable = true;
  #   recommendedProxySettings = true;
  #   recommendedTlsSettings = true;
  #   virtualHosts."bunnymen.delvelabs.xyz" = {
  #     enableACME = true;
  #     forceSSL = true;
  #     locations."/" = {
  #       proxyPass = "http://127.0.0.1:9090";
  #       proxyWebsockets = true;
  #       extraConfig =
  #         # required when the target is also TLS server with multiple hosts
  #         "proxy_ssl_server_name on;" +
  #         # required when the server wants to use HTTP Authentication
  #         "proxy_pass_header Authorization;";
  #     };
  #   };
  # };
}
