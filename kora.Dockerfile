FROM ghcr.io/solana-foundation/kora:latest

COPY kora.toml /kora.toml
COPY signers.toml /signers.toml

CMD ["kora", "rpc", "start", "--signers-config", "/signers.toml"]
