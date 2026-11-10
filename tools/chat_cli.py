#!/usr/bin/env python3
"""
CLI utility for the Arena.ai Agent to read & reply to Dashboard Chatbot messages
in real time (via the local HTTP/SSE server with direct ChatStore fallback).
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
import time
import urllib.error
import urllib.request

from dashboard_server import DEFAULT_CHAT_FILE, ChatStore


def request_api(
    base_url: str,
    method: str,
    path: str,
    payload: dict | None = None,
    timeout: float = 5.0,
) -> dict | None:
    url = f"{base_url.rstrip('/')}{path}"
    data = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json; charset=utf-8"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, ValueError):
        return None


def cmd_status(args: argparse.Namespace) -> int:
    res = request_api(args.server, "GET", "/api/chat/status")
    if res is None:
        store = ChatStore(storage_path=Path(args.chat_file))
        res = store.get_status()
        res["transport"] = "file-fallback"
    else:
        res["transport"] = "live-http-sse"
    print(json.dumps(res, ensure_ascii=False, indent=2))
    return 0


def cmd_inbox(args: argparse.Namespace) -> int:
    q = "?unread=1" if args.unread else ""
    res = request_api(args.server, "GET", f"/api/chat/inbox{q}")
    if res is None:
        store = ChatStore(storage_path=Path(args.chat_file))
        msgs = store.get_agent_inbox(unread_only=args.unread)
        res = {"ok": True, "count": len(msgs), "messages": msgs, "transport": "file-fallback"}
    else:
        res["transport"] = "live-http-sse"

    if args.mark_read and res.get("count", 0) > 0:
        mr = request_api(args.server, "POST", "/api/chat/mark-read", {})
        if mr is None:
            ChatStore(storage_path=Path(args.chat_file)).mark_read_by_arena()

    print(json.dumps(res, ensure_ascii=False, indent=2))
    return 0


def cmd_reply(args: argparse.Namespace) -> int:
    action = None
    if args.action_type:
        action = {
            "type": args.action_type,
            "sectionId": args.section_id or "01-header",
            "label": args.action_label or "اجرای عملیات",
        }
    payload = {
        "text": args.text,
        "sectionId": args.section_id,
        "sectionTitle": args.section_title,
        "action": action,
    }
    res = request_api(args.server, "POST", "/api/chat/agent-reply", payload)
    if res is None:
        store = ChatStore(storage_path=Path(args.chat_file))
        res = store.add_agent_reply(
            text=args.text,
            section_id=args.section_id,
            section_title=args.section_title,
            action=action,
        )
        res["transport"] = "file-fallback"
    else:
        res["transport"] = "live-http-sse"

    print(json.dumps(res, ensure_ascii=False, indent=2))
    return 0


def cmd_listen(args: argparse.Namespace) -> int:
    deadline = time.monotonic() + args.timeout
    while time.monotonic() < deadline:
        res = request_api(args.server, "GET", "/api/chat/inbox?unread=1")
        if res is None:
            msgs = ChatStore(storage_path=Path(args.chat_file)).get_agent_inbox(unread_only=True)
        else:
            msgs = res.get("messages", [])

        if msgs:
            request_api(args.server, "POST", "/api/chat/mark-read", {})
            print(json.dumps({"ok": True, "event": "new_user_messages", "messages": msgs}, ensure_ascii=False, indent=2))
            return 0
        time.sleep(0.25)

    print(json.dumps({"ok": True, "event": "timeout", "messages": []}, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Arena <-> Dashboard Chat CLI")
    parser.add_argument("--server", default="http://127.0.0.1:8080", help="Dashboard server base URL")
    parser.add_argument("--chat-file", default=str(DEFAULT_CHAT_FILE), help="Path to conversation.json")

    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("status", help="Show live bridge status")

    p_inbox = sub.add_parser("inbox", help="Read user messages sent from the Dashboard")
    p_inbox.add_argument("--unread", action="store_true", help="Show only unread (queued_for_arena) messages")
    p_inbox.add_argument("--mark-read", action="store_true", help="Mark unread messages as read_by_arena")

    p_reply = sub.add_parser("reply", help="Send a live reply back to the Dashboard Chatbot")
    p_reply.add_argument("text", help="Reply text in Persian")
    p_reply.add_argument("--section-id", default=None, help="Optional catalog section id")
    p_reply.add_argument("--section-title", default=None, help="Optional catalog section title")
    p_reply.add_argument("--action-type", choices=["download", "open-guide", "open-modal"], default=None)
    p_reply.add_argument("--action-label", default=None)

    p_listen = sub.add_parser("listen", help="Wait in real time for the next Dashboard user message")
    p_listen.add_argument("--timeout", type=float, default=45.0, help="Max wait seconds")

    args = parser.parse_args()
    if args.cmd == "status":
        return cmd_status(args)
    if args.cmd == "inbox":
        return cmd_inbox(args)
    if args.cmd == "reply":
        return cmd_reply(args)
    if args.cmd == "listen":
        return cmd_listen(args)
    return 1


if __name__ == "__main__":
    sys.exit(main())
