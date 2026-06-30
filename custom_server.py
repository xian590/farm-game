import http.server
import socketserver
import mimetypes

# 确保 .html 文件的 MIME 类型正确
mimetypes.add_type('text/html', '.html')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/javascript', '.js')

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        ctype = super().guess_type(path)
        # 如果 guess_type 返回 octet-stream，强制使用 text/html
        if ctype == 'application/octet-stream' and path.endswith('.html'):
            return 'text/html'
        return ctype

PORT = 8081
with socketserver.TCPServer(("127.0.0.1", PORT), CustomHTTPRequestHandler) as httpd:
    print(f"Serving at http://127.0.0.1:{PORT}")
    httpd.serve_forever()
