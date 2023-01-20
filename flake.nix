{
  description = "bunnymen";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    nix-filter.url = "github:numtide/nix-filter";
  };
  outputs = inputs@{ self, nixpkgs, flake-utils, nix-filter, ... }:
    let
      inherit (nixpkgs.lib) recursiveUpdate;
      inherit (flake-utils.lib) eachDefaultSystem defaultSystems;
    in eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        inherit (pkgs) mkShell buildNpmPackage;

        webrtc-star = (pkgs.callPackage ./nix/webrtc-star
          { })."@libp2p/webrtc-star-signalling-server";

        selfPkgs = self.packages.${system};

        libPath = with pkgs; lib.makeLibraryPath [ stdenv.cc.cc ];

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
      });
}
