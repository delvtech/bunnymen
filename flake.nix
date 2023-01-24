{
  description = "bunnymen";

  inputs = {
    stable.url = "github:NixOS/nixpkgs/nixos-22.11";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    deploy-rs.url = "github:serokell/deploy-rs";
  };
  outputs = inputs@{ self, stable, nixpkgs, flake-utils, deploy-rs, ... }:
    (flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        inherit (pkgs) lib mkShell buildNpmPackage;

        selfPkgs = self.packages.${system};
      in {
        packages = {
          webrtc-star = (pkgs.callPackage ./nix/webrtc-star
            { })."@libp2p/webrtc-star-signalling-server";
        };

        devShells.default = mkShell {
          buildInputs = with pkgs; [
            nodejs
            node2nix
            yarn
            docker
            docker-compose
            deploy-rs.defaultPackage.${system}
          ];
        };

      })) // (let
        system = "x86_64-linux";
        pkgs = import stable { inherit system; };
        inherit (stable) lib;
        inherit (deploy-rs.lib.${system}.activate) nixos;
      in {
        inherit deploy-rs;
        nixosModules = {
          webrtc-star = (import ./nix/webrtc-star/module.nix {
            webrtcStarPkg = self.packages.${system}.webrtc-star;
          });
        };

        nixosConfigurations = {
          webrtc-star = lib.nixosSystem {
            inherit system;
            modules = [
              (import ./nix/webrtc-star/configuration.nix)
              self.nixosModules.webrtc-star
            ];
          };
        };

        # ssh root access needed to deploy
        deploy = {
          autoRollback = true;
          remoteBuild = true;
          fastConnection = false;
          nodes = {
            webrtc-star = {
              hostname = "ec2-54-171-121-200.eu-west-1.compute.amazonaws.com";
              user = "root";
              sshUser = "root";
              profiles.system.path = deploy-rs.lib.x86_64-linux.activate.nixos
                self.nixosConfigurations.webrtc-star;
            };
          };
        };
      });
}
