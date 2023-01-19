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

      in {
        packages = { inherit webrtc-star; };

        devShell = mkShell { buildInputs = with pkgs; [ nodejs node2nix ]; };
      });
}
