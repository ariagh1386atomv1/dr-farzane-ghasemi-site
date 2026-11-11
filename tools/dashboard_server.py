#!/usr/bin/env python3
"""
Dr. Farzane Ghasemi — Template Studio & Live Arena Chat Bridge Server.

Serves the static RTL Light-Blue Template Hub AND provides a thread-safe,
CORS-enabled REST + Server-Sent Events (SSE) two-way bridge (with live Agent
Presence & Typing indicators) between the browser Dashboard Chatbot and Arena.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
import os
from pathlib import Path
import queue
import re
import threading
import time
from urllib.parse import parse_qs, unquote, urlparse
import uuid

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CHAT_FILE = REPO_ROOT / ".chat" / "conversation.json"

MAX_BODY_BYTES = 64 * 1024
MAX_MESSAGE_CHARS = 4000
MAX_STORED_MESSAGES = 500
SSE_HEARTBEAT_SECONDS = 12.0

BLOCKED_TOP_DIRS = {
    ".git",
    ".chat",
    ".agents",
    ".claude",
    "agent",
    "darunik",
    "tools",
    "tests",
    "__pycache__",
    "node_modules",
}

BLOCKED_ROOT_FILES = {
    ".gitignore",
    "skills-lock.json",
    "darunik-complete-project.zip",
}

CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")

CUSTOM_MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".ttf": "font/ttf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".zip": "application/zip",
}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def clean_text(raw: object, max_len: int = MAX_MESSAGE_CHARS) -> str:
    if not isinstance(raw, str):
        return ""
    cleaned = CONTROL_CHARS_RE.sub("", raw).replace("\r\n", "\n").replace("\r", "\n").strip()
    return cleaned[:max_len]


class EventBroker:
    """Thread-safe fan-out broker for Server-Sent Events (SSE) clients."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._subscribers: set[queue.Queue[tuple[str, dict]]] = set()

    def subscribe(self) -> queue.Queue[tuple[str, dict]]:
        q: queue.Queue[tuple[str, dict]] = queue.Queue(maxsize=128)
        with self._lock:
            self._subscribers.add(q)
        return q

    def unsubscribe(self, q: queue.Queue[tuple[str, dict]]) -> None:
        with self._lock:
            self._subscribers.discard(q)

    def subscriber_count(self) -> int:
        with self._lock:
            return len(self._subscribers)

    def publish(self, event: str, payload: dict) -> None:
        with self._lock:
            targets = list(self._subscribers)
        dead: list[queue.Queue[tuple[str, dict]]] = []
        for q in targets:
            try:
                q.put_nowait((event, payload))
            except queue.Full:
                dead.append(q)
        if dead:
            with self._lock:
                for q in dead:
                    self._subscribers.discard(q)


class ChatStore:
    """Persistent, atomic JSON store for two-way Dashboard <-> Arena chat."""

    def __init__(self, storage_path: Path = DEFAULT_CHAT_FILE, broker: EventBroker | None = None) -> None:
        self.storage_path = Path(storage_path)
        self.broker = broker or EventBroker()
        self._lock = threading.RLock()
        self._mtime_ns: int = -1
        self._data: dict = {}
        self._agent_listening_until: float = 0.0
        self._agent_typing_until: float = 0.0
        self._arena_tab_clients: int = 0
        self._last_presence: tuple[bool, bool, bool] = (False, False, False)
        self._ensure_initialized()

    def _default_state(self) -> dict:
        now = utc_now_iso()
        welcome = {
            "id": "msg_welcome_0001",
            "seq": 1,
            "role": "agent",
            "author": "ایجنت اصلی چت آرنا",
            "text": (
                "سلام! 👋 این چت‌بات مستقیماً به فضای کاری من در آرنا متصل است.\n"
                "• وقتی وضعیت بالا «آنلاین و گوش‌به‌زنگ» است، هر پیامی اینجا بفرستید بدون نیاز به نوشتن چیزی در چت آرنا بلافاصله می‌بینم و همین‌جا پاسخ می‌دهم!\n"
                "• پاسخ‌ها و فایل‌های JSON جدید به‌صورت زنده (SSE) در همین پنجره ظاهر می‌شوند."
            ),
            "sectionId": None,
            "sectionTitle": None,
            "source": "arena-agent",
            "externalId": None,
            "status": "delivered",
            "action": None,
            "createdAt": now,
        }
        return {
            "version": 1,
            "nextSeq": 2,
            "updatedAt": now,
            "messages": [welcome],
        }

    def _ensure_initialized(self) -> None:
        with self._lock:
            self.storage_path.parent.mkdir(parents=True, exist_ok=True)
            if not self.storage_path.exists():
                self._data = self._default_state()
                self._write_locked()
            else:
                self._reload_if_changed_locked(force=True)

    def _reload_if_changed_locked(self, force: bool = False) -> None:
        try:
            st = self.storage_path.stat()
        except FileNotFoundError:
            self._data = self._default_state()
            self._write_locked()
            return

        if not force and st.st_mtime_ns == self._mtime_ns:
            return

        try:
            raw = json.loads(self.storage_path.read_text(encoding="utf-8"))
            if not isinstance(raw, dict) or not isinstance(raw.get("messages"), list):
                raise ValueError("Invalid conversation schema")
            self._data = raw
            self._mtime_ns = st.st_mtime_ns
        except Exception:
            self._data = self._default_state()
            self._write_locked()

    def _write_locked(self) -> None:
        self._data["updatedAt"] = utc_now_iso()
        if len(self._data["messages"]) > MAX_STORED_MESSAGES:
            self._data["messages"] = self._data["messages"][-MAX_STORED_MESSAGES:]
        tmp_path = self.storage_path.with_suffix(f".tmp.{os.getpid()}.{threading.get_ident()}")
        tmp_path.write_text(
            json.dumps(self._data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        os.replace(tmp_path, self.storage_path)
        try:
            self._mtime_ns = self.storage_path.stat().st_mtime_ns
        except OSError:
            pass

    def _unread_for_agent_locked(self) -> int:
        return sum(
            1
            for m in self._data["messages"]
            if m.get("role") == "user" and m.get("status") == "queued_for_arena"
        )

    def _latest_seq_locked(self) -> int:
        msgs = self._data.get("messages") or []
        return int(msgs[-1]["seq"]) if msgs else 0

    def is_agent_listening(self) -> bool:
        return time.monotonic() < self._agent_listening_until or self._arena_tab_clients > 0

    def is_agent_typing(self) -> bool:
        return time.monotonic() < self._agent_typing_until

    def is_arena_tab_connected(self) -> bool:
        return self._arena_tab_clients > 0

    def update_arena_tab_clients(self, delta: int) -> None:
        with self._lock:
            self._arena_tab_clients = max(0, self._arena_tab_clients + delta)
            cur = (
                self.is_agent_listening(),
                self.is_agent_typing(),
                self.is_arena_tab_connected(),
            )
            changed = cur != self._last_presence
            self._last_presence = cur
            unread = self._unread_for_agent_locked()
        if changed:
            self.broker.publish(
                "presence",
                {
                    "ok": True,
                    "agentListening": cur[0],
                    "agentTyping": cur[1],
                    "arenaTabConnected": cur[2],
                    "unreadForAgent": unread,
                },
            )

    def set_agent_heartbeat(self, ttl: float = 12.0, typing: bool | None = None) -> dict:
        now_m = time.monotonic()
        with self._lock:
            self._reload_if_changed_locked()
            if ttl > 0:
                self._agent_listening_until = max(self._agent_listening_until, now_m + min(ttl, 120.0))
            else:
                self._agent_listening_until = 0.0

            if typing is True:
                self._agent_typing_until = now_m + 90.0
            elif typing is False:
                self._agent_typing_until = 0.0

            cur = (
                self.is_agent_listening(),
                self.is_agent_typing(),
                self.is_arena_tab_connected(),
            )
            changed = cur != self._last_presence
            self._last_presence = cur
            unread = self._unread_for_agent_locked()

        snap = {
            "ok": True,
            "agentListening": cur[0],
            "agentTyping": cur[1],
            "arenaTabConnected": cur[2],
            "unreadForAgent": unread,
        }
        if changed:
            self.broker.publish("presence", snap)
        return snap

    def check_presence_expiry_and_notify(self) -> None:
        with self._lock:
            cur = (
                self.is_agent_listening(),
                self.is_agent_typing(),
                self.is_arena_tab_connected(),
            )
            if cur == self._last_presence:
                return
            self._last_presence = cur
            unread = self._unread_for_agent_locked()
        self.broker.publish(
            "presence",
            {
                "ok": True,
                "agentListening": cur[0],
                "agentTyping": cur[1],
                "arenaTabConnected": cur[2],
                "unreadForAgent": unread,
            },
        )

    def get_status(self) -> dict:
        with self._lock:
            self._reload_if_changed_locked()
            return {
                "ok": True,
                "mode": "live-bridge",
                "agentListening": self.is_agent_listening(),
                "agentTyping": self.is_agent_typing(),
                "arenaTabConnected": self.is_arena_tab_connected(),
                "totalMessages": len(self._data["messages"]),
                "unreadForAgent": self._unread_for_agent_locked(),
                "latestSeq": self._latest_seq_locked(),
                "sseClients": self.broker.subscriber_count(),
                "updatedAt": self._data.get("updatedAt"),
                "serverTime": utc_now_iso(),
            }

    def list_messages(self, after_seq: int = 0) -> dict:
        with self._lock:
            self._reload_if_changed_locked()
            filtered = [m for m in self._data["messages"] if int(m.get("seq", 0)) > after_seq]
            return {
                "ok": True,
                "messages": filtered,
                "agentListening": self.is_agent_listening(),
                "agentTyping": self.is_agent_typing(),
                "arenaTabConnected": self.is_arena_tab_connected(),
                "unreadForAgent": self._unread_for_agent_locked(),
                "latestSeq": self._latest_seq_locked(),
            }

    def get_agent_inbox(self, unread_only: bool = False) -> list[dict]:
        with self._lock:
            self._reload_if_changed_locked()
            items = [m for m in self._data["messages"] if m.get("role") == "user"]
            if unread_only:
                items = [m for m in items if m.get("status") == "queued_for_arena"]
            return items

    def _build_instant_helper(self, text: str, section_id: str | None) -> dict | None:
        low = text.lower()
        target_id = section_id or "01-header"
        if any(k in low for k in ["دانلود هدر", "فایل هدر", "download header", "json هدر"]):
            return {
                "text": "فایل استاندارد «۰۱ — هدر اختصاصی داروخانه آنلاین دکتر فرزانه قاسمی» آماده دانلود است:",
                "action": {
                    "type": "download",
                    "sectionId": target_id,
                    "label": "دانلود مستقیم هدر (.json)",
                },
            }
        if any(k in low for k in ["راهنمای نصب", "چطور نصب", "چجوری ایمپورت", "نصب در وودمارت", "ایمپورت هدر"]):
            return {
                "text": "برای نصب در وودمارت + المنتور پرو: از پیشخوان به «قالب‌ها ← قالب‌های ذخیره شده ← Import Templates» بروید، فایل JSON را آپلود کنید، روی منوها فهرست خودتان را ست کنید و شرط نمایش را روی Entire Site بگذارید.",
                "action": {
                    "type": "open-guide",
                    "sectionId": target_id,
                    "label": "باز کردن راهنمای گام‌به‌گام",
                },
            }
        if any(k in low for k in ["پیش نمایش", "پریویو", "نمای موبایل"]):
            return {
                "text": "می‌توانید پیش‌نمایش زنده دسکتاپ، تبلت و موبایل این بخش را در ابعاد کامل باز کنید:",
                "action": {
                    "type": "open-modal",
                    "sectionId": target_id,
                    "label": "باز کردن پیش‌نمایش تمام‌صفحه",
                },
            }
        return None

    def add_user_message(
        self,
        text: str,
        section_id: str | None = None,
        section_title: str | None = None,
        source: str = "dashboard",
        external_id: str | None = None,
    ) -> dict:
        with self._lock:
            self._reload_if_changed_locked()
            if external_id:
                for existing in self._data["messages"]:
                    if existing.get("externalId") == external_id:
                        return {
                            "ok": True,
                            "duplicate": True,
                            "message": existing,
                            "created": [],
                            "unreadForAgent": self._unread_for_agent_locked(),
                        }

            seq = int(self._data.get("nextSeq", 1))
            now = utc_now_iso()
            user_msg = {
                "id": f"msg_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}",
                "seq": seq,
                "role": "user",
                "author": "شما (از داشبورد)",
                "text": text,
                "sectionId": clean_text(section_id, 80) or None,
                "sectionTitle": clean_text(section_title, 160) or None,
                "source": clean_text(source, 60) or "dashboard",
                "externalId": clean_text(external_id, 80) or None,
                "arenaTriggered": False,
                "status": "queued_for_arena",
                "action": None,
                "createdAt": now,
            }
            self._data["messages"].append(user_msg)
            seq += 1

            created = [user_msg]
            helper_spec = self._build_instant_helper(text, user_msg["sectionId"])
            if helper_spec:
                helper_msg = {
                    "id": f"msg_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}",
                    "seq": seq,
                    "role": "assistant",
                    "author": "دستیار فوری استودیو",
                    "text": helper_spec["text"],
                    "sectionId": user_msg["sectionId"],
                    "sectionTitle": user_msg["sectionTitle"],
                    "source": "instant-helper",
                    "externalId": None,
                    "status": "delivered",
                    "action": helper_spec["action"],
                    "createdAt": now,
                }
                self._data["messages"].append(helper_msg)
                created.append(helper_msg)
                seq += 1

            self._data["nextSeq"] = seq
            self._write_locked()
            unread = self._unread_for_agent_locked()

        for msg in created:
            self.broker.publish("message", {"message": msg, "unreadForAgent": unread})
        self.broker.publish("arena_trigger", {"message": user_msg})

        return {
            "ok": True,
            "message": user_msg,
            "created": created,
            "unreadForAgent": unread,
        }

    def list_pending_triggers(self) -> list[dict]:
        with self._lock:
            self._reload_if_changed_locked()
            return [
                m
                for m in self._data["messages"]
                if m.get("role") == "user"
                and m.get("status") == "queued_for_arena"
                and not m.get("arenaTriggered")
            ]

    def claim_arena_trigger(self, message_id: str) -> dict:
        with self._lock:
            self._reload_if_changed_locked()
            for m in self._data["messages"]:
                if m.get("id") == message_id:
                    if m.get("arenaTriggered"):
                        return {"ok": True, "claimed": False, "alreadyTriggered": True}
                    m["arenaTriggered"] = True
                    self._write_locked()
                    return {"ok": True, "claimed": True, "alreadyTriggered": False, "message": m}
            return {"ok": False, "claimed": False, "error": "پیام یافت نشد."}

    def mark_read_by_arena(self, set_typing: bool = False) -> dict:
        with self._lock:
            self._reload_if_changed_locked()
            updated_ids: list[str] = []
            for m in self._data["messages"]:
                if m.get("role") == "user" and m.get("status") == "queued_for_arena":
                    m["status"] = "read_by_arena"
                    updated_ids.append(m["id"])
            if updated_ids:
                self._write_locked()

            if set_typing:
                now_m = time.monotonic()
                self._agent_listening_until = max(self._agent_listening_until, now_m + 90.0)
                self._agent_typing_until = now_m + 90.0
                self._last_presence = (True, True, self.is_arena_tab_connected())

            unread = self._unread_for_agent_locked()
            listening = self.is_agent_listening()
            typing = self.is_agent_typing()
            tab_conn = self.is_arena_tab_connected()

        if updated_ids:
            self.broker.publish(
                "status_update",
                {"messageIds": updated_ids, "status": "read_by_arena", "unreadForAgent": unread},
            )
        if set_typing:
            self.broker.publish(
                "presence",
                {
                    "ok": True,
                    "agentListening": listening,
                    "agentTyping": typing,
                    "arenaTabConnected": tab_conn,
                    "unreadForAgent": unread,
                },
            )
        return {"ok": True, "updatedIds": updated_ids, "unreadForAgent": unread}

    def add_agent_reply(
        self,
        text: str,
        section_id: str | None = None,
        section_title: str | None = None,
        action: dict | None = None,
    ) -> dict:
        with self._lock:
            self._reload_if_changed_locked()
            updated_ids: list[str] = []
            replied_sources: list[str] = []
            for m in self._data["messages"]:
                if m.get("role") == "user" and m.get("status") in {"queued_for_arena", "read_by_arena"}:
                    m["status"] = "replied"
                    updated_ids.append(m["id"])
                    if m.get("externalId"):
                        replied_sources.append(str(m["externalId"]))

            seq = int(self._data.get("nextSeq", 1))
            reply_msg = {
                "id": f"msg_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}",
                "seq": seq,
                "role": "agent",
                "author": "ایجنت اصلی چت آرنا",
                "text": text,
                "sectionId": clean_text(section_id, 80) or None,
                "sectionTitle": clean_text(section_title, 160) or None,
                "source": "arena-agent",
                "externalId": None,
                "status": "delivered",
                "action": action if isinstance(action, dict) else None,
                "createdAt": utc_now_iso(),
            }
            self._data["messages"].append(reply_msg)
            self._data["nextSeq"] = seq + 1
            self._write_locked()

            self._agent_typing_until = 0.0
            cur = (self.is_agent_listening(), False, self.is_arena_tab_connected())
            self._last_presence = cur
            unread = self._unread_for_agent_locked()

        self.broker.publish(
            "presence",
            {
                "ok": True,
                "agentListening": cur[0],
                "agentTyping": False,
                "arenaTabConnected": cur[2],
                "unreadForAgent": unread,
            },
        )
        if updated_ids:
            self.broker.publish(
                "status_update",
                {"messageIds": updated_ids, "status": "replied", "unreadForAgent": unread},
            )
        self.broker.publish("message", {"message": reply_msg, "unreadForAgent": unread})
        return {
            "ok": True,
            "message": reply_msg,
            "repliedToIds": updated_ids,
            "repliedExternalIds": replied_sources,
            "unreadForAgent": unread,
        }

    def clear_messages(self) -> dict:
        with self._lock:
            self._data = self._default_state()
            self._write_locked()
            snapshot = list(self._data["messages"])
        self.broker.publish("reset", {"messages": snapshot, "unreadForAgent": 0})
        return {"ok": True, "messages": snapshot, "unreadForAgent": 0}


class DashboardHTTPServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def __init__(
        self,
        server_address: tuple[str, int],
        repo_root: Path = REPO_ROOT,
        store: ChatStore | None = None,
    ) -> None:
        self.repo_root = Path(repo_root).resolve()
        self.store = store or ChatStore()
        super().__init__(server_address, DashboardRequestHandler)


class DashboardRequestHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    @property
    def app_server(self) -> DashboardHTTPServer:
        return self.server  # type: ignore[return-value]

    def log_message(self, fmt: str, *args: object) -> None:
        ts = datetime.now().strftime("%H:%M:%S")
        print(f"[{ts}] {self.address_string()} {fmt % args}", flush=True)

    def _send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, POST, DELETE, OPTIONS")
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Accept, Cache-Control, Last-Event-ID",
        )
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def _send_json(self, status: int, payload: dict) -> None:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _read_json_body(self) -> tuple[dict | None, tuple[int, str] | None]:
        length_header = self.headers.get("Content-Length")
        if not length_header:
            return {}, None
        try:
            length = int(length_header)
        except ValueError:
            return None, (HTTPStatus.BAD_REQUEST, "هدر Content-Length نامعتبر است.")
        if length < 0 or length > MAX_BODY_BYTES:
            return None, (HTTPStatus.REQUEST_ENTITY_TOO_LARGE, "حجم پیام بیش از حد مجاز است.")
        if length == 0:
            return {}, None
        raw = self.rfile.read(length)
        try:
            parsed = json.loads(raw.decode("utf-8"))
        except Exception:
            return None, (HTTPStatus.BAD_REQUEST, "ساختار JSON معتبر نیست.")
        if not isinstance(parsed, dict):
            return None, (HTTPStatus.BAD_REQUEST, "بدنه درخواست باید یک شیء JSON باشد.")
        return parsed, None

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self._send_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_HEAD(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            if parsed.path == "/api/chat/status":
                body = json.dumps(self.app_server.store.get_status(), ensure_ascii=False).encode("utf-8")
                self.send_response(HTTPStatus.OK)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                return
            self.send_response(HTTPStatus.NOT_FOUND)
            self._send_cors_headers()
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        self._serve_static(parsed.path, head_only=True)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path

        if route == "/api/chat/status":
            self._send_json(HTTPStatus.OK, self.app_server.store.get_status())
            return

        if route == "/api/chat/messages":
            qs = parse_qs(parsed.query)
            try:
                after_seq = max(0, int(qs.get("after_seq", ["0"])[0]))
            except ValueError:
                after_seq = 0
            self._send_json(HTTPStatus.OK, self.app_server.store.list_messages(after_seq=after_seq))
            return

        if route == "/api/chat/inbox":
            qs = parse_qs(parsed.query)
            unread_only = qs.get("unread", ["0"])[0] in {"1", "true", "yes"}
            items = self.app_server.store.get_agent_inbox(unread_only=unread_only)
            self._send_json(HTTPStatus.OK, {"ok": True, "count": len(items), "messages": items})
            return

        if route == "/api/chat/pending-triggers":
            items = self.app_server.store.list_pending_triggers()
            self._send_json(HTTPStatus.OK, {"ok": True, "count": len(items), "messages": items})
            return

        if route == "/api/chat/stream":
            qs = parse_qs(parsed.query)
            is_arena_tab = qs.get("role", [""])[0] == "arena-tab"
            self._handle_sse(is_arena_tab=is_arena_tab)
            return

        if route.startswith("/api/"):
            self._send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "مسیر API یافت نشد."})
            return

        self._serve_static(route, head_only=False)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path
        body, err = self._read_json_body()
        if err is not None:
            self._send_json(err[0], {"ok": False, "error": err[1]})
            return
        assert body is not None

        if route == "/api/chat/send":
            raw_text = body.get("text")
            if not isinstance(raw_text, str):
                self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "متن پیام الزامی است."})
                return
            stripped = CONTROL_CHARS_RE.sub("", raw_text).strip()
            if not stripped:
                self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "متن پیام نمی‌تواند خالی باشد."})
                return
            if len(stripped) > MAX_MESSAGE_CHARS:
                self._send_json(
                    HTTPStatus.BAD_REQUEST,
                    {"ok": False, "error": f"طول پیام حداکثر {MAX_MESSAGE_CHARS} کاراکتر است."},
                )
                return
            res = self.app_server.store.add_user_message(
                text=stripped,
                section_id=body.get("sectionId"),
                section_title=body.get("sectionTitle"),
                source=body.get("source") or "dashboard",
                external_id=body.get("externalId"),
            )
            self._send_json(HTTPStatus.CREATED, res)
            return

        if route == "/api/chat/agent-heartbeat":
            try:
                ttl = float(body.get("ttl", 12.0))
            except (TypeError, ValueError):
                ttl = 12.0
            typing_val = body.get("typing")
            typing_bool = bool(typing_val) if isinstance(typing_val, bool) else None
            res = self.app_server.store.set_agent_heartbeat(ttl=ttl, typing=typing_bool)
            self._send_json(HTTPStatus.OK, res)
            return

        if route == "/api/chat/agent-reply":
            raw_text = body.get("text")
            if not isinstance(raw_text, str) or not raw_text.strip():
                self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "متن پاسخ ایجنت الزامی است."})
                return
            res = self.app_server.store.add_agent_reply(
                text=clean_text(raw_text, 8000),
                section_id=body.get("sectionId"),
                section_title=body.get("sectionTitle"),
                action=body.get("action"),
            )
            self._send_json(HTTPStatus.CREATED, res)
            return

        if route == "/api/chat/claim-trigger":
            msg_id = str(body.get("messageId") or "").strip()
            if not msg_id:
                self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "شناسه پیام الزامی است."})
                return
            res = self.app_server.store.claim_arena_trigger(msg_id)
            self._send_json(HTTPStatus.OK if res.get("ok") else HTTPStatus.NOT_FOUND, res)
            return

        if route == "/api/chat/mark-read":
            res = self.app_server.store.mark_read_by_arena(set_typing=bool(body.get("typing")))
            self._send_json(HTTPStatus.OK, res)
            return

        if route == "/api/chat/clear":
            res = self.app_server.store.clear_messages()
            self._send_json(HTTPStatus.OK, res)
            return

        self._send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "مسیر API یافت نشد."})

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path in {"/api/chat/messages", "/api/chat/clear"}:
            res = self.app_server.store.clear_messages()
            self._send_json(HTTPStatus.OK, res)
            return
        self._send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "مسیر API یافت نشد."})

    def _handle_sse(self, is_arena_tab: bool = False) -> None:
        self.send_response(HTTPStatus.OK)
        self._send_cors_headers()
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-transform")
        self.send_header("Connection", "keep-alive")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()

        sub_q = self.app_server.store.broker.subscribe()
        if is_arena_tab:
            self.app_server.store.update_arena_tab_clients(+1)
        try:
            init_payload = json.dumps(self.app_server.store.get_status(), ensure_ascii=False)
            self.wfile.write(f"event: connected\ndata: {init_payload}\n\n".encode("utf-8"))
            self.wfile.flush()

            while True:
                try:
                    event_name, payload = sub_q.get(timeout=SSE_HEARTBEAT_SECONDS)
                    encoded = json.dumps(payload, ensure_ascii=False)
                    self.wfile.write(f"event: {event_name}\ndata: {encoded}\n\n".encode("utf-8"))
                    self.wfile.flush()
                except queue.Empty:
                    self.app_server.store.check_presence_expiry_and_notify()
                    self.wfile.write(b": heartbeat\n\n")
                    self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass
        finally:
            if is_arena_tab:
                self.app_server.store.update_arena_tab_clients(-1)
            self.app_server.store.broker.unsubscribe(sub_q)

    def _serve_static(self, raw_path: str, head_only: bool) -> None:
        decoded = unquote(raw_path or "/")
        rel = decoded.lstrip("/")
        if not rel or decoded.endswith("/"):
            rel = os.path.join(rel, "index.html")

        root = self.app_server.repo_root
        target = (root / rel).resolve()

        try:
            rel_parts = target.relative_to(root).parts
        except ValueError:
            self._send_json(HTTPStatus.FORBIDDEN, {"ok": False, "error": "دسترسی غیرمجاز."})
            return

        if not rel_parts:
            target = root / "index.html"
            rel_parts = ("index.html",)

        if rel_parts[0] in BLOCKED_TOP_DIRS or (
            len(rel_parts) == 1 and rel_parts[0] in BLOCKED_ROOT_FILES
        ):
            self._send_json(HTTPStatus.FORBIDDEN, {"ok": False, "error": "این مسیر عمومی نیست."})
            return

        if not target.is_file():
            self._send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "فایل یافت نشد."})
            return

        ext = target.suffix.lower()
        ctype = CUSTOM_MIME.get(ext) or mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        data = target.read_bytes()

        self.send_response(HTTPStatus.OK)
        self._send_cors_headers()
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        if not head_only:
            self.wfile.write(data)


def main() -> None:
    parser = argparse.ArgumentParser(description="Dashboard & Arena Chat Bridge HTTP Server")
    parser.add_argument("--host", default="0.0.0.0", help="Bind host (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8080, help="Bind port (default: 0.0.0.0)")
    parser.add_argument(
        "--chat-file",
        default=str(DEFAULT_CHAT_FILE),
        help="Path to persistent conversation.json",
    )
    args = parser.parse_args()

    store = ChatStore(storage_path=Path(args.chat_file))
    server = DashboardHTTPServer((args.host, args.port), repo_root=REPO_ROOT, store=store)
    print(
        f"Template Studio + Arena Chat Bridge listening on http://{args.host}:{args.port}",
        flush=True,
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
