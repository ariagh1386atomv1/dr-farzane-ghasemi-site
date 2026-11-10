#!/usr/bin/env python3
"""
Comprehensive Backend, Security, Concurrency, SSE & CLI Integration Test Suite
for the Template Studio & Live Arena Chat Bridge.
"""

from __future__ import annotations

import http.client
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.request

REPO_ROOT = Path(__file__).resolve().parent.parent
TOOLS_DIR = REPO_ROOT / "tools"
sys.path.insert(0, str(TOOLS_DIR))

from dashboard_server import ChatStore, DashboardHTTPServer  # noqa: E402


class ChatBridgeBackendTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.chat_file = Path(self._tmp.name) / "conversation.json"
        self.store = ChatStore(storage_path=self.chat_file)
        self.server = DashboardHTTPServer(("127.0.0.1", 0), repo_root=REPO_ROOT, store=self.store)
        self.port = self.server.server_address[1]
        self.base_url = f"http://127.0.0.1:{self.port}"
        self._thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self._thread.start()

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.server_close()
        self._thread.join(timeout=3)
        self._tmp.cleanup()

    def _req(
        self,
        method: str,
        path: str,
        payload: dict | bytes | None = None,
        headers: dict | None = None,
    ) -> tuple[int, dict, bytes]:
        req_headers = dict(headers or {})
        body_bytes = None
        if isinstance(payload, dict):
            body_bytes = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            req_headers.setdefault("Content-Type", "application/json; charset=utf-8")
        elif isinstance(payload, bytes):
            body_bytes = payload

        req = urllib.request.Request(
            f"{self.base_url}{path}",
            data=body_bytes,
            headers=req_headers,
            method=method,
        )
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                return resp.status, dict(resp.headers.items()), resp.read()
        except urllib.error.HTTPError as err:
            return err.code, dict(err.headers.items()), err.read()

    def test_01_static_assets_and_head_requests(self) -> None:
        status, hdrs, body = self._req("GET", "/")
        self.assertEqual(status, 200)
        self.assertIn("text/html", hdrs.get("Content-Type", ""))
        self.assertIn("chat-panel", body.decode("utf-8"))

        h_status, h_hdrs, h_body = self._req("HEAD", "/")
        self.assertEqual(h_status, 200)
        self.assertEqual(len(h_body), 0)
        self.assertEqual(int(h_hdrs["Content-Length"]), len(body))

        for asset_path, expected_mime in [
            ("/assets/styles.css", "text/css"),
            ("/assets/catalog.js", "application/javascript"),
            ("/assets/app.js", "application/javascript"),
            ("/assets/chat-widget.js", "application/javascript"),
            ("/assets/fonts/Dana-Bold.ttf", "font/ttf"),
            ("/elementor-templates/01-header-dr-farzane-ghasemi.json", "application/json"),
        ]:
            st, ah, ab = self._req("GET", asset_path)
            self.assertEqual(st, 200, f"Failed serving {asset_path}")
            self.assertIn(expected_mime, ah.get("Content-Type", ""))
            self.assertGreater(len(ab), 100)

    def test_02_security_blocked_paths_and_cors(self) -> None:
        for secret_path in [
            "/.git/HEAD",
            "/.chat/conversation.json",
            "/.agents/skills/find-skills/SKILL.md",
            "/tools/dashboard_server.py",
            "/.gitignore",
            "/../../etc/passwd",
        ]:
            st, _, _ = self._req("GET", secret_path)
            self.assertIn(st, (403, 404), f"Path {secret_path} must not be exposed (got {st})")

        opt_st, opt_hdrs, _ = self._req("OPTIONS", "/api/chat/send")
        self.assertEqual(opt_st, 204)
        self.assertEqual(opt_hdrs.get("Access-Control-Allow-Origin"), "*")
        self.assertEqual(opt_hdrs.get("Access-Control-Allow-Private-Network"), "true")

    def test_03_validation_and_limits(self) -> None:
        # Empty message
        st, _, raw = self._req("POST", "/api/chat/send", {"text": "   \n\t  "})
        self.assertEqual(st, 400)
        self.assertFalse(json.loads(raw)["ok"])

        # Too long (> 4000 chars)
        st, _, _ = self._req("POST", "/api/chat/send", {"text": "الف" * 4005})
        self.assertEqual(st, 400)

        # Malformed JSON
        st, _, _ = self._req(
            "POST",
            "/api/chat/send",
            b"{broken-json",
            {"Content-Type": "application/json"},
        )
        self.assertEqual(st, 400)

        # Oversized body (> 64KB)
        st, _, _ = self._req(
            "POST",
            "/api/chat/send",
            b'{"text":"' + (b"x" * 70000) + b'"}',
            {"Content-Type": "application/json"},
        )
        self.assertEqual(st, 413)

    def test_04_two_way_lifecycle_helper_and_persistence(self) -> None:
        # Initial welcome
        st, _, raw = self._req("GET", "/api/chat/messages")
        self.assertEqual(st, 200)
        init_data = json.loads(raw)
        self.assertEqual(len(init_data["messages"]), 1)
        self.assertEqual(init_data["messages"][0]["role"], "agent")
        self.assertEqual(init_data["unreadForAgent"], 0)

        # User sends message with section context + instant helper keyword
        st, _, raw = self._req(
            "POST",
            "/api/chat/send",
            {
                "text": "لطفاً فایل دانلود هدر را بده و رنگ دکمه را هم بررسی کن\x00",
                "sectionId": "01-header",
                "sectionTitle": "هدر اصلی داروخانه آنلاین",
                "source": "arena-preview",
            },
        )
        self.assertEqual(st, 201)
        sent = json.loads(raw)
        self.assertEqual(sent["unreadForAgent"], 1)
        self.assertNotIn("\x00", sent["message"]["text"])
        # Created both user msg + instant download helper while keeping unreadForAgent == 1
        self.assertEqual(len(sent["created"]), 2)
        self.assertEqual(sent["created"][1]["role"], "assistant")
        self.assertEqual(sent["created"][1]["action"]["type"], "download")

        # Mark read by Arena Agent
        st, _, raw = self._req("POST", "/api/chat/mark-read", {})
        self.assertEqual(st, 200)
        mr = json.loads(raw)
        self.assertEqual(mr["unreadForAgent"], 0)
        self.assertIn(sent["message"]["id"], mr["updatedIds"])

        # Agent sends verified reply
        st, _, raw = self._req(
            "POST",
            "/api/chat/agent-reply",
            {
                "text": "بررسی شد! نسخه جدید هدر آماده است.",
                "sectionId": "01-header",
                "sectionTitle": "هدر اصلی داروخانه آنلاین",
            },
        )
        self.assertEqual(st, 201)
        rep = json.loads(raw)
        self.assertEqual(rep["message"]["role"], "agent")
        self.assertIn(sent["message"]["id"], rep["repliedToIds"])

        # Verify persistence across fresh ChatStore reload
        reloaded = ChatStore(storage_path=self.chat_file)
        hist = reloaded.list_messages()
        self.assertEqual(len(hist["messages"]), 4)
        user_reloaded = [m for m in hist["messages"] if m["role"] == "user"][0]
        self.assertEqual(user_reloaded["status"], "replied")

        # Clear conversation
        st, _, raw = self._req("DELETE", "/api/chat/messages")
        self.assertEqual(st, 200)
        cleared = json.loads(raw)
        self.assertEqual(len(cleared["messages"]), 1)

    def test_05_realtime_sse_event_stream(self) -> None:
        received_events: list[tuple[str, dict]] = []
        ready_evt = threading.Event()
        stop_evt = threading.Event()

        def sse_reader() -> None:
            conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
            conn.request("GET", "/api/chat/stream")
            resp = conn.getresponse()
            self.assertEqual(resp.status, 200)
            cur_event = "message"
            while not stop_evt.is_set():
                line = resp.fp.readline().decode("utf-8")
                if not line:
                    break
                line = line.rstrip("\r\n")
                if line.startswith("event:"):
                    cur_event = line.split(":", 1)[1].strip()
                elif line.startswith("data:"):
                    payload = json.loads(line.split(":", 1)[1].strip())
                    received_events.append((cur_event, payload))
                    if cur_event == "connected":
                        ready_evt.set()
            conn.close()

        t = threading.Thread(target=sse_reader, daemon=True)
        t.start()
        self.assertTrue(ready_evt.wait(timeout=3.0), "SSE did not emit connected event")

        self._req("POST", "/api/chat/send", {"text": "پیام تستی استریم زنده"})
        self._req("POST", "/api/chat/agent-reply", {"text": "پاسخ زنده ایجنت از طریق SSE"})

        deadline = time.monotonic() + 3.0
        while time.monotonic() < deadline and len(received_events) < 4:
            time.sleep(0.05)

        stop_evt.set()
        event_names = [e[0] for e in received_events]
        self.assertIn("connected", event_names)
        self.assertIn("message", event_names)
        self.assertIn("status_update", event_names)

    def test_06_concurrent_stress_integrity(self) -> None:
        total_threads = 12
        errors: list[Exception] = []

        def worker(idx: int) -> None:
            try:
                st, _, _ = self._req(
                    "POST",
                    "/api/chat/send",
                    {"text": f"پیام همزمان شماره {idx}"},
                )
                if st != 201:
                    raise RuntimeError(f"Unexpected status {st}")
            except Exception as exc:
                errors.append(exc)

        threads = [threading.Thread(target=worker, args=(i,)) for i in range(total_threads)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=5)

        self.assertEqual(errors, [])
        hist = self.store.list_messages()["messages"]
        seqs = [m["seq"] for m in hist]
        self.assertEqual(seqs, sorted(set(seqs)), "Sequence numbers must be strictly unique & ordered")
        user_msgs = [m for m in hist if m["role"] == "user"]
        self.assertEqual(len(user_msgs), total_threads)

    def test_07_chat_cli_end_to_end_including_listen(self) -> None:
        cli_script = str(TOOLS_DIR / "chat_cli.py")

        def run_cli(*cli_args: str) -> dict:
            proc = subprocess.run(
                [
                    sys.executable,
                    cli_script,
                    "--server",
                    self.base_url,
                    "--chat-file",
                    str(self.chat_file),
                    *cli_args,
                ],
                capture_output=True,
                text=True,
                check=True,
                timeout=8,
            )
            return json.loads(proc.stdout)

        st_out = run_cli("status")
        self.assertTrue(st_out["ok"])
        self.assertEqual(st_out["transport"], "live-http-sse")

        # Test `listen` waking up when user sends a message 350ms later
        def delayed_user_send() -> None:
            time.sleep(0.35)
            self._req("POST", "/api/chat/send", {"text": "سلام از داخل داشبورد برای تست listen!"})

        sender = threading.Thread(target=delayed_user_send, daemon=True)
        sender.start()
        listen_out = run_cli("listen", "--timeout", "4")
        sender.join(timeout=2)

        self.assertEqual(listen_out["event"], "new_user_messages")
        self.assertEqual(len(listen_out["messages"]), 1)
        self.assertIn("تست listen", listen_out["messages"][0]["text"])

        # Reply via CLI
        rep_out = run_cli(
            "reply",
            "پاسخ مستقیم CLI به چت‌بات داشبورد!",
            "--section-id",
            "01-header",
            "--action-type",
            "download",
            "--action-label",
            "دانلود هدر",
        )
        self.assertTrue(rep_out["ok"])
        self.assertEqual(rep_out["unreadForAgent"], 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
