# Webrtc-star NixOS Setup

1. Create an AWS NixOS image (easiest from the [NixOS website](https://nixos.org/download.html#nixos-amazon), presumes you have an AWS account)

2. Login to the machine and jump into a shell with vim as some edits to the default configuration is needed

```bash
$ nix-shell -p vim --run "vim /etc/nixos/configuration.nix"
```

By default [flakes](https://nixos.wiki/wiki/Flakes) are not enabled so add these into the configuration

```nix
{
  # other config ...

  # Enables flakes and
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

  environment.systemPackages = with pkgs; [ vim curl ];

  networking.firewall.enable = true;
  networking.firewall.rejectPackets = true;
  networking.firewall.allowedTCPPorts = [ 80 443 ];

  system.stateVersion = "22.11";
}
```

Then run:

```bash
$ sudo nixos-rebuild
```

3. Create a `flake.nix` file in `/etc/nixos/`

Copy and paste the following:

```nix
{
  description = "";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.11";
    bunnymen.url = "github:element-fi/bunnymen";
  };

  outputs = inputs@{ nixpkgs, bunnymen, ... }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
      inherit (nixpkgs) lib;
    in {
      nixosConfigurations = {
        <HOST> = lib.nixosSystem {
          inherit system;
          modules = [
            (import ./configuration.nix)
            bunnymen.nixosModules.webrtc-star
          ];
        };
      };
    };
}
```

Rename the `<HOST>` to the machine name or whatever you feel

4. Enable the webrtc-star service

Add to your `configuration.nix`:

```nix
{
  # other config ...

  services.webrtc-star = {
    enable = true;
    nginx.hostName = "<yourdomain.com>";
  };
}
```

Change <yourdomain.com> to your domain and ensure it's DNS records point to the public URL of the machine. HTTPS should automatically work.

See `/nix/webrtc-star/configuration.nix` as an example for a full configuration

5. Validate that the signalling-server is working on the host machine

```
curl http://127.0.0.1:9090
```

You should get back raw html containing the signalling server address, e,g `/dns4/<yourdomain.com>/tcp/443/wss/p2p-webrtc-star`
