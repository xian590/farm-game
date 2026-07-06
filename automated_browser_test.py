import subprocess, os, json, time, sys, urllib.request, http.server, socketserver, threading

WS = r"C:\Users\Administrator\Documents\kimi\workspace"
WB_URL = "http://127.0.0.1:10086/command"
REPORT_PATH = os.path.join(WS, "browser_test_report.txt")

def log(msg):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(REPORT_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def wb_command(data):
    try:
        req = urllib.request.Request(WB_URL, data=json.dumps(data).encode("utf-8"),
                                     headers={"Content-Type": "application/json"}, method="POST")
        resp = urllib.request.urlopen(req, timeout=20)
        return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return {"ok": False, "error": str(e)}

def start_server():
    os.chdir(WS)
    try:
        httpd = socketserver.TCPServer(("127.0.0.1", 8765), http.server.SimpleHTTPRequestHandler)
        t = threading.Thread(target=httpd.serve_forever)
        t.daemon = True
        t.start()
        log("HTTP server started on 127.0.0.1:8765")
        return True
    except Exception as e:
        log(f"Server start error: {e}")
        return False

def check_syntax():
    with open(os.path.join(WS, "index-manifestation.html"), "r", encoding="utf-8") as f:
        content = f.read()
    parts = content.split("<script>")
    if len(parts) >= 3:
        block2 = parts[2].split("</script>")[0]
        with open(os.path.join(WS, "block2_check.js"), "w", encoding="utf-8") as f:
            f.write(block2)
        result = subprocess.run(["node", "-c", os.path.join(WS, "block2_check.js")],
                                capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            log(f"SYNTAX FAIL: {result.stderr[:500]}")
            return False
        log("Block 2 syntax: PASS")
    return True

def run_browser_test():
    log("=" * 50)
    log("Browser test started")

    # 1. Syntax check
    if not check_syntax():
        log("ABORT: Syntax error in Block 2")
        return False

    # 2. Start server
    if not start_server():
        log("ABORT: Server failed")
        return False
    time.sleep(2)

    # 3. Navigate
    nav = wb_command({"action": "navigate", "args": {"url": "http://127.0.0.1:8765/index-manifestation.html", "newTab": True, "group_title": "AutoTest"}, "session": "autotest"})
    log(f"Navigate: {json.dumps(nav, ensure_ascii=False)[:200]}")
    if not nav.get("ok"):
        log("ABORT: Navigate failed")
        return False
    time.sleep(6)

    # 4. Check init
    js = "(()=>{try{return{initType:typeof init,__initDone:typeof __initDone,sk:document.getElementById('skeleton-screen')?.className||'null'};}catch(e){return{err:e.message};}})()"
    eval_r = wb_command({"action": "evaluate", "args": {"code": js}, "session": "autotest"})
    log(f"Init check: {json.dumps(eval_r, ensure_ascii=False)[:300]}")

    val = eval_r.get("data", {}).get("value", {})
    if val.get("initType") != "function":
        log("FAIL: init() not defined")
        return False
    if val.get("__initDone") != "boolean":
        log("FAIL: init() not executed")
        return False
    if val.get("sk") != "null":
        log("FAIL: skeleton screen still visible")
        return False
    log("Init check: PASS")

    # 5. Screenshot
    ss = wb_command({"action": "screenshot", "args": {"path": os.path.join(WS, "autotest_screenshot.png")}, "session": "autotest"})
    log(f"Screenshot: {json.dumps(ss, ensure_ascii=False)[:200]}")

    # 6. Test goHome
    js2 = "(()=>{try{goHome();return{done:true};}catch(e){return{err:e.message};}})()"
    home_r = wb_command({"action": "evaluate", "args": {"code": js2}, "session": "autotest"})
    log(f"goHome: {json.dumps(home_r, ensure_ascii=False)[:200]}")
    time.sleep(2)

    js3 = "(()=>{try{var p=document.querySelector('.page.active');return{pageId:p?.id||'none'};}catch(e){return{err:e.message};}})()"
    page_r = wb_command({"action": "evaluate", "args": {"code": js3}, "session": "autotest"})
    page_val = page_r.get("data", {}).get("value", {})
    if page_val.get("pageId") != "page-island":
        log(f"FAIL: goHome did not switch to page-island, got {page_val.get('pageId')}")
        return False
    log("Page switch: PASS")

    # 7. Screenshot home
    ss2 = wb_command({"action": "screenshot", "args": {"path": os.path.join(WS, "autotest_home.png")}, "session": "autotest"})
    log(f"Home screenshot: {json.dumps(ss2, ensure_ascii=False)[:200]}")

    # 8. Close session
    wb_command({"action": "close_session", "session": "autotest"})

    log("ALL TESTS PASSED")
    log("=" * 50)
    return True

if __name__ == "__main__":
    try:
        success = run_browser_test()
        sys.exit(0 if success else 1)
    except Exception as e:
        log(f"CRASH: {e}")
        sys.exit(1)
