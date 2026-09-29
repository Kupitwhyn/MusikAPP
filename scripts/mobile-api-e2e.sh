#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
TEMP_DIR="$(mktemp -d)"
COOKIE_FILE="$TEMP_DIR/cookies.txt"
EMAIL="e2e-mobile-$(date +%s)-$RANDOM@example.test"
PASSWORD="MobileE2E!123"

cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

request_status() {
  local output="$1"
  shift
  curl -sS -o "$output" -w "%{http_code}" "$@"
}

status="$(request_status "$TEMP_DIR/unauthorized.json" "$BASE_URL/api/v1/library")"
test "$status" = "401"

status="$(request_status "$TEMP_DIR/invalid-get.json" "$BASE_URL/api/v1/favorites?workId=not-an-integer")"
test "$status" = "401"

status="$(request_status "$TEMP_DIR/signup.json" \
  -c "$COOKIE_FILE" -b "$COOKIE_FILE" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Mobile E2E\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"role\":\"AUDIENCE\"}" \
  "$BASE_URL/api/auth/sign-up/email")"
test "$status" = "200"

status="$(request_status "$TEMP_DIR/session.json" \
  -c "$COOKIE_FILE" -b "$COOKIE_FILE" \
  "$BASE_URL/api/auth/get-session")"
test "$status" = "200"
jq -e '.user.role == "AUDIENCE"' "$TEMP_DIR/session.json" >/dev/null

status="$(request_status "$TEMP_DIR/mobile-session.json" \
  -b "$COOKIE_FILE" \
  "$BASE_URL/api/v1/session")"
test "$status" = "200"
jq -e '.data.user.role == "AUDIENCE"' "$TEMP_DIR/mobile-session.json" >/dev/null

status="$(request_status "$TEMP_DIR/invalid-payload.json" \
  -b "$COOKIE_FILE" \
  -H "Content-Type: application/json" \
  -d '{"workId":"1"}' \
  "$BASE_URL/api/v1/favorites")"
test "$status" = "400"

status="$(request_status "$TEMP_DIR/missing-work.json" \
  -b "$COOKIE_FILE" \
  -H "Content-Type: application/json" \
  -d '{"workId":999999999}' \
  "$BASE_URL/api/v1/favorites")"
test "$status" = "404"

status="$(request_status "$TEMP_DIR/invalid-authenticated-get.json" \
  -b "$COOKIE_FILE" \
  "$BASE_URL/api/v1/favorites?workId=not-an-integer")"
test "$status" = "400"

status="$(request_status "$TEMP_DIR/works.json" "$BASE_URL/api/v1/works")"
test "$status" = "200"
work_id="$(jq -r '.data[0].id // empty' "$TEMP_DIR/works.json")"
test -n "$work_id"

status="$(request_status "$TEMP_DIR/favorite-add.json" \
  -b "$COOKIE_FILE" \
  -H "Content-Type: application/json" \
  -d "{\"workId\":$work_id}" \
  "$BASE_URL/api/v1/favorites")"
test "$status" = "201"
jq -e '.data.favorited == true' "$TEMP_DIR/favorite-add.json" >/dev/null

status="$(request_status "$TEMP_DIR/library.json" -b "$COOKIE_FILE" "$BASE_URL/api/v1/library")"
test "$status" = "200"
jq -e --arg id "$work_id" 'any(.data[]; (.id|tostring) == $id)' "$TEMP_DIR/library.json" >/dev/null

status="$(request_status "$TEMP_DIR/favorite-status.json" -b "$COOKIE_FILE" \
  "$BASE_URL/api/v1/favorites?workId=$work_id")"
test "$status" = "200"
jq -e '.data.favorited == true' "$TEMP_DIR/favorite-status.json" >/dev/null

status="$(request_status "$TEMP_DIR/favorite-remove.json" \
  -b "$COOKIE_FILE" \
  -H "Content-Type: application/json" \
  -d "{\"workId\":$work_id}" \
  "$BASE_URL/api/v1/favorites")"
test "$status" = "200"
jq -e '.data.favorited == false' "$TEMP_DIR/favorite-remove.json" >/dev/null

status="$(request_status "$TEMP_DIR/signout.json" \
  -b "$COOKIE_FILE" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: $BASE_URL" \
  -d "{}" \
  "$BASE_URL/api/auth/sign-out")"
test "$status" = "200"

status="$(request_status "$TEMP_DIR/library-after.json" -b "$COOKIE_FILE" "$BASE_URL/api/v1/library")"
test "$status" = "401"

status="$(request_status "$TEMP_DIR/signin.json" \
  -c "$COOKIE_FILE" -b "$COOKIE_FILE" \
  -H "Content-Type: application/json" \
  -H "Origin: $BASE_URL" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  "$BASE_URL/api/auth/sign-in/email")"
test "$status" = "200"

status="$(request_status "$TEMP_DIR/session-after-signin.json" \
  -c "$COOKIE_FILE" -b "$COOKIE_FILE" \
  "$BASE_URL/api/auth/get-session")"
test "$status" = "200"
jq -e '.user.role == "AUDIENCE"' "$TEMP_DIR/session-after-signin.json" >/dev/null

echo "Mobile API E2E and edge cases passed"
