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
        export NPM_CONFIG_PREFIX="$HOME/.npm-global"
        export PATH="$HOME/.npm-global/bin:$PATH"
        if [ ! -f "$HOME/.npm-global/bin/claude" ]; then
          npm install -g @anthropic-ai/claude-code
        fi
        if [ ! -f "$HOME/.npm-global/bin/ccusage" ]; then
          npm install -g ccusage
        fi
      '';
    };
  };
}
