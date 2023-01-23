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
    };
  };

  environment.systemPackages = with pkgs; [ vim htop curl ];

  services.webrtc-star = {
    enable = true;
    nginx.hostName = "bunnymen-nix.delvelabs.xyz";
  };

  services.openssh = {
    enable = true;
    passwordAuthentication = false;
  };

  users.users."root".openssh.authorizedKeys.keys = [
    "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEFlro/QUDlDpaA1AQxdWIqBg9HSFJf9Cb7CPdsh0JN7"
  ];

  system.stateVersion = "22.11";

  networking.firewall.enable = true;
  networking.firewall.rejectPackets = true;
  networking.firewall.allowedTCPPorts = [ 80 443 ];
}
