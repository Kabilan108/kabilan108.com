{
  description = "node 22 + pnpm dev shell w chromium";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  outputs = { self, nixpkgs }: let
    system = "x86_64-linux";
    pkgs   = import nixpkgs { inherit system; };
  in {
    devShell.${system} = pkgs.mkShell {
      buildInputs = with pkgs; [
        nodejs_22
        pnpm
        chromium
      ];

      shellHook = ''
        export CHROMIUM_BINARY="${pkgs.chromium}/bin/chromium"
      '';
    };
  };
}
