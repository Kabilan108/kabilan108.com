{
  description = "bun dev shell w chromium";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
      prek-custom = pkgs.stdenv.mkDerivation {
        pname = "prek";
        version = "0.3.5";
        src = pkgs.fetchurl {
          url = "https://github.com/j178/prek/releases/download/v0.3.5/prek-x86_64-unknown-linux-gnu.tar.gz";
          sha256 = "sha256-vuHD9VCvAEqk2kRBZIGU6GLaYpoCNh2yYPz1gx1Km9k=";
        };
        sourceRoot = ".";
        installPhase = ''
          mkdir -p $out/bin
          cp prek-x86_64-unknown-linux-gnu/prek $out/bin/
          chmod +x $out/bin/prek
        '';
      };
    in
    {
      devShell.${system} = pkgs.mkShell {
        buildInputs = with pkgs; [
          bun
          chromium
          prek-custom
        ];

        shellHook = ''
          export CHROMIUM_BINARY="${pkgs.chromium}/bin/chromium"
        '';
      };
    };
}
