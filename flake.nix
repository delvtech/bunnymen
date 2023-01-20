{
  description = "bunnymen";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    nix-filter.url = "github:numtide/nix-filter";
  };
  outputs = inputs@{ self, nixpkgs, flake-utils, nix-filter, ... }:
    flake-utils.lib.eachDefaultSystem (system:
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
            docker-client
            arion
          ];
        };

        nixosModules = {
          webrtc-star = import ./nix/webrtc-star/module.nix {
            inherit pkgs webrtc-star lib;
          };
        };
      });
}
