{
  description = "bunnymen";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    deploy-rs.url = "github:serokell/deploy-rs";
  };
  outputs = inputs@{ self, nixpkgs, flake-utils, deploy-rs, ... }:
    (flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        inherit (pkgs) lib mkShell buildNpmPackage;

        webrtc-star = (pkgs.callPackage ./nix/webrtc-star
          { })."@libp2p/webrtc-star-signalling-server";

        selfPkgs = self.packages.${system};

      in {
        packages = {
          inherit webrtc-star;

          webrtc-star-docker = pkgs.dockerTools.buildImage {
            name = "webrtc-star-docker";
            config = { Cmd = [ "${selfPkgs.webrtc-star}/bin/webrtc-star" ]; };
          };
        };

        apps.webrtc-star = {
          type = "app";
          program = "${selfPkgs.webrtc-star}/bin/webrtc-star";
        };

        devShell = mkShell {
          buildInputs = with pkgs; [
            nodejs
            node2nix
            yarn
            docker
            deploy-rs.defaultPackage.${system}
          ];
        };

      })) // (let
        system = "x86_64-linux";
        pkgs = import nixpkgs { inherit system; };
        inherit (pkgs) lib;
        inherit (lib) nixosSystem;
        inherit (deploy-rs.lib.${system}.activate) nixos;
      in {
        inherit deploy-rs;
        nixosModules = {
          webrtc-star = import ./nix/webrtc-star/module.nix {
            inherit pkgs lib;
            webrtc-star = self.packages.${system}.webrtc-star;
          };
        };

        nixosConfigurations = {
          webrtc-star = nixosSystem {
            inherit system;
            modules = [
              (import ./nix/webrtc-star/configuration.nix)
              self.nixosModules.webrtc-star
            ];
          };
        };

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
