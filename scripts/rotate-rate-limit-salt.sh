#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  printf 'Missing %s\n' "$ENV_FILE" >&2
  exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
  printf 'openssl is required to rotate RATE_LIMIT_SALT\n' >&2
  exit 1
fi

new_salt="$(openssl rand -base64 32 | tr -d '\n')"
temporary_file="$(mktemp "$ENV_FILE.tmp.XXXXXX")"
trap 'rm -f "$temporary_file"' EXIT

found=0
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" == RATE_LIMIT_SALT=* ]]; then
    printf 'RATE_LIMIT_SALT=%s\n' "$new_salt" >> "$temporary_file"
    found=1
  else
    printf '%s\n' "$line" >> "$temporary_file"
  fi
done < "$ENV_FILE"

if [[ "$found" -eq 0 ]]; then
  printf 'RATE_LIMIT_SALT=%s\n' "$new_salt" >> "$temporary_file"
fi

mv "$temporary_file" "$ENV_FILE"
trap - EXIT
printf 'Rotated RATE_LIMIT_SALT in %s\n' "$ENV_FILE"
printf 'Update the deployment environment variable separately.\n'
