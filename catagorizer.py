"""
CWE → OWASP Top 10 (2021) sınıflandırma mapping tablosu.
Her vulnerability'i OWASP kategorisine atar.
"""

# OWASP Top 10 2021 - CWE Mapping
OWASP_TOP_10 = {
    "A01:2021 - Broken Access Control": {
        "cwes": ["CWE-22", "CWE-23", "CWE-35", "CWE-59", "CWE-200", "CWE-201",
                 "CWE-219", "CWE-264", "CWE-275", "CWE-276", "CWE-284", "CWE-285",
                 "CWE-352", "CWE-359", "CWE-377", "CWE-402", "CWE-425", "CWE-441",
                 "CWE-497", "CWE-538", "CWE-540", "CWE-548", "CWE-552", "CWE-566",
                 "CWE-601", "CWE-639", "CWE-651", "CWE-668", "CWE-706", "CWE-862",
                 "CWE-863", "CWE-913", "CWE-922", "CWE-1275"],
        "color": "#e74c3c",
        "icon": "🔓",
    },
    "A02:2021 - Cryptographic Failures": {
        "cwes": ["CWE-261", "CWE-296", "CWE-310", "CWE-319", "CWE-321", "CWE-322",
                 "CWE-323", "CWE-324", "CWE-325", "CWE-326", "CWE-327", "CWE-328",
                 "CWE-329", "CWE-330", "CWE-331", "CWE-335", "CWE-336", "CWE-337",
                 "CWE-338", "CWE-340", "CWE-347", "CWE-523", "CWE-720", "CWE-757",
                 "CWE-759", "CWE-760", "CWE-780", "CWE-818", "CWE-916"],
        "color": "#e67e22",
        "icon": "🔐",
    },
    "A03:2021 - Injection": {
        "cwes": ["CWE-20", "CWE-74", "CWE-75", "CWE-77", "CWE-78", "CWE-79",
                 "CWE-80", "CWE-83", "CWE-87", "CWE-88", "CWE-89", "CWE-90",
                 "CWE-91", "CWE-93", "CWE-94", "CWE-95", "CWE-96", "CWE-97",
                 "CWE-98", "CWE-99", "CWE-100", "CWE-113", "CWE-116", "CWE-138",
                 "CWE-184", "CWE-470", "CWE-471", "CWE-564", "CWE-610", "CWE-643",
                 "CWE-644", "CWE-652", "CWE-917"],
        "color": "#9b59b6",
        "icon": "💉",
    },
    "A04:2021 - Insecure Design": {
        "cwes": ["CWE-73", "CWE-183", "CWE-209", "CWE-213", "CWE-235", "CWE-256",
                 "CWE-257", "CWE-266", "CWE-269", "CWE-280", "CWE-311", "CWE-312",
                 "CWE-313", "CWE-316", "CWE-419", "CWE-430", "CWE-434", "CWE-444",
                 "CWE-451", "CWE-472", "CWE-501", "CWE-522", "CWE-525", "CWE-539",
                 "CWE-579", "CWE-598", "CWE-602", "CWE-642", "CWE-646", "CWE-650",
                 "CWE-653", "CWE-656", "CWE-657", "CWE-799", "CWE-807", "CWE-840",
                 "CWE-841", "CWE-927", "CWE-1021", "CWE-1173"],
        "color": "#3498db",
        "icon": "📐",
    },
    "A05:2021 - Security Misconfiguration": {
        "cwes": ["CWE-2", "CWE-11", "CWE-13", "CWE-15", "CWE-16", "CWE-260",
                 "CWE-315", "CWE-520", "CWE-526", "CWE-537", "CWE-541", "CWE-547",
                 "CWE-611", "CWE-614", "CWE-756", "CWE-776", "CWE-942", "CWE-1004",
                 "CWE-1032", "CWE-1174"],
        "color": "#1abc9c",
        "icon": "⚙️",
    },
    "A06:2021 - Vulnerable Components": {
        "cwes": ["CWE-937", "CWE-1035", "CWE-1104"],
        "color": "#f39c12",
        "icon": "📦",
    },
    "A07:2021 - Auth Failures": {
        "cwes": ["CWE-255", "CWE-259", "CWE-287", "CWE-288", "CWE-290", "CWE-294",
                 "CWE-295", "CWE-297", "CWE-300", "CWE-302", "CWE-304", "CWE-306",
                 "CWE-307", "CWE-346", "CWE-384", "CWE-521", "CWE-613", "CWE-620",
                 "CWE-640", "CWE-798", "CWE-940", "CWE-1216"],
        "color": "#2ecc71",
        "icon": "🔑",
    },
    "A08:2021 - Data Integrity Failures": {
        "cwes": ["CWE-345", "CWE-353", "CWE-426", "CWE-494", "CWE-502", "CWE-565",
                 "CWE-784", "CWE-829", "CWE-830", "CWE-915"],
        "color": "#d35400",
        "icon": "🔄",
    },
    "A09:2021 - Logging Failures": {
        "cwes": ["CWE-117", "CWE-223", "CWE-532", "CWE-778"],
        "color": "#8e44ad",
        "icon": "📝",
    },
    "A10:2021 - SSRF": {
        "cwes": ["CWE-918"],
        "color": "#c0392b",
        "icon": "🌐",
    },
}

# Ters mapping: CWE → OWASP kategori
_CWE_TO_OWASP = {}
for category, info in OWASP_TOP_10.items():
    for cwe in info["cwes"]:
        _CWE_TO_OWASP[cwe] = category


def classify_vulnerability(cwe_list: list[str]) -> str:
    """Bir vulnerability'nin CWE listesine göre OWASP kategorisini belirle."""
    for cwe in cwe_list:
        if cwe in _CWE_TO_OWASP:
            return _CWE_TO_OWASP[cwe]
    # CWE eşleşmezse, dependency vulnerability'leri genellikle A06
    return "A06:2021 - Vulnerable Components"


def get_owasp_color(category: str) -> str:
    """OWASP kategorisinin rengini döndür."""
    return OWASP_TOP_10.get(category, {}).get("color", "#95a5a6")


def get_owasp_icon(category: str) -> str:
    """OWASP kategorisinin ikonunu döndür."""
    return OWASP_TOP_10.get(category, {}).get("icon", "❓")


def categorize_vulnerabilities(vulns: list[dict]) -> list[dict]:
    """Tüm vulnerability'lere OWASP kategorisi ata."""
    for vuln in vulns:
        cwe_list = vuln.get("cwe", [])
        vuln["owasp_category"] = classify_vulnerability(cwe_list)
        vuln["owasp_color"] = get_owasp_color(vuln["owasp_category"])
        vuln["owasp_icon"] = get_owasp_icon(vuln["owasp_category"])
    return vulns