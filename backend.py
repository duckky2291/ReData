"""
ReData of D - Standalone Backend & Local Web Server
Runs using Python 3 standard library with zero external dependencies.
"""

import http.server
import socketserver
import json
import os
import mimetypes

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

FILES_DATABASE = [
    {
        "id": "f-101",
        "name": "Backup_Database_Customer_2026.sql",
        "path": "/var/data/backups/sql/Backup_Database_Customer_2026.sql",
        "type": "database",
        "category": "database",
        "sizeBytes": 1548239000,
        "sizeFormatted": "1.44 GB",
        "updatedAt": "2026-09-26 03:15:20",
        "checksum": "a87f9b23c914d8726e95bf081a94"
    },
    {
        "id": "f-102",
        "name": "System_Restore_Image_v2.4.iso",
        "path": "/recovery/images/System_Restore_Image_v2.4.iso",
        "type": "archive",
        "category": "archive",
        "sizeBytes": 4294967296,
        "sizeFormatted": "4.00 GB",
        "updatedAt": "2026-09-25 21:40:02",
        "checksum": "6f3918a38b1d9c0245e8a731211e"
    },
    {
        "id": "f-103",
        "name": "ReData_Core_Config_Production.json",
        "path": "/etc/redata/configs/ReData_Core_Config_Production.json",
        "type": "document",
        "category": "document",
        "sizeBytes": 2457600,
        "sizeFormatted": "2.34 MB",
        "updatedAt": "2026-09-26 04:10:12",
        "checksum": "c2810fb4e7732a105829d10e5443"
    },
    {
        "id": "f-104",
        "name": "Full_Archive_Storage_Snapshot.zip",
        "path": "/snapshots/weekly/Full_Archive_Storage_Snapshot.zip",
        "type": "archive",
        "category": "archive",
        "sizeBytes": 912850000,
        "sizeFormatted": "870.5 MB",
        "updatedAt": "2026-09-24 18:00:55",
        "checksum": "8872ac94e1b439281a052ff37890"
    },
    {
        "id": "f-105",
        "name": "Financial_Ledger_Q3_Restore.xlsx",
        "path": "/finance/restores/Financial_Ledger_Q3_Restore.xlsx",
        "type": "document",
        "category": "document",
        "sizeBytes": 18450000,
        "sizeFormatted": "17.6 MB",
        "updatedAt": "2026-09-25 14:22:18",
        "checksum": "5311de729a43108c903ef88414cb"
    },
    {
        "id": "f-106",
        "name": "Audit_Server_Security_Logs.log",
        "path": "/var/log/security/Audit_Server_Security_Logs.log",
        "type": "document",
        "category": "document",
        "sizeBytes": 85200000,
        "sizeFormatted": "81.2 MB",
        "updatedAt": "2026-09-26 02:45:00",
        "checksum": "9d43ef1788220aa5420084318c66"
    },
    {
        "id": "f-107",
        "name": "Security_Camera_HQ_Snapshot.png",
        "path": "/media/cctv/restores/Security_Camera_HQ_Snapshot.png",
        "type": "image",
        "category": "image",
        "sizeBytes": 12850000,
        "sizeFormatted": "12.2 MB",
        "updatedAt": "2026-09-26 03:50:11",
        "checksum": "7d92ef1891b014ac9201f8430a91"
    },
    {
        "id": "f-108",
        "name": "Architecture_Cloud_Diagram_v3.svg",
        "path": "/designs/infra/Architecture_Cloud_Diagram_v3.svg",
        "type": "image",
        "category": "image",
        "sizeBytes": 1420000,
        "sizeFormatted": "1.35 MB",
        "updatedAt": "2026-09-25 19:12:40",
        "checksum": "4cb102fe94a821dc0928b17a63e2"
    },
    {
        "id": "f-109",
        "name": "Satellite_Geospatial_Scan_HD.raw",
        "path": "/geo/sat/raw/Satellite_Geospatial_Scan_HD.raw",
        "type": "image",
        "category": "image",
        "sizeBytes": 482000000,
        "sizeFormatted": "459.7 MB",
        "updatedAt": "2026-09-24 11:05:32",
        "checksum": "b3e028194cf92018aa402319ef42"
    },
    {
        "id": "f-110",
        "name": "User_Avatars_Profile_Collection.jpg",
        "path": "/assets/profiles/User_Avatars_Profile_Collection.jpg",
        "type": "image",
        "category": "image",
        "sizeBytes": 34600000,
        "sizeFormatted": "33.0 MB",
        "updatedAt": "2026-09-26 01:20:15",
        "checksum": "fa829104bce93018240ef8214ac3"
    }
]

class ReDataServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/files' or self.path == '/api/files/':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(FILES_DATABASE, ensure_ascii=False).encode('utf-8'))
            return

        super().do_GET()

    def do_POST(self):
        if self.path == '/api/save-file' or self.path == '/api/save-file/':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            try:
                body = json.loads(post_data)
            except Exception:
                body = {}

            file_id = body.get('fileId')
            phone = body.get('phone')
            keycode = body.get('keycode')

            print(f"[BACKEND LOG] Yêu cầu lưu file: ID={file_id}, SĐT={phone}, Keycode={keycode}")

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            response_data = {
                "success": True,
                "message": "File đã được trích xuất và sẵn sàng lưu về máy tính",
                "fileId": file_id,
                "checksum": "a87f9b23c914d8726e95bf081a94",
                "status": "COMPLETED"
            }
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

import sys
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

if __name__ == '__main__':
    # Allow socket address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), ReDataServerHandler) as httpd:
        print(f"==================================================")
        print(f"[SERVER] ReData of D Server is running at: http://localhost:{PORT}")
        print(f"[API] Files endpoint: http://localhost:{PORT}/api/files")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
