#!/usr/bin/env python3
"""Fetch stats from all companies and update dashboard"""
import requests
import json
from datetime import datetime

# Load credentials
with open('/data/data/com.termux/files/home/.31harbor_creds') as f:
    creds_31h = dict(line.strip().split('=', 1) for line in f if '=' in line)

with open('/data/data/com.termux/files/home/.pfp_creds') as f:
    creds_pfp = dict(line.strip().split('=', 1) for line in f if '=' in line)

print("=" * 70)
print("AGENCY DASHBOARD - MULTI-COMPANY STATS")
print("=" * 70)

companies = {
    "31 Harbor": {
        "key": creds_31h.get('RESEND_API_KEY', ''),
        "domain_id": "0b0b6d4b-de1d-4119-9ed6-f67fae6434f4",
        "domain": "31harbor.com",
        "email": "david@31harbor.com"
    },
    "Party Favor Photo": {
        "key": creds_pfp.get('RESEND_PFP_API_KEY', ''),
        "domain_id": "37d6693a-ee73-42f3-88b8-cd7051db343d",
        "domain": "partyfavorphoto.com",
        "email": "bookings@partyfavorphoto.com"
    }
}

dashboard_data = {
    "updated": datetime.now().isoformat(),
    "companies": {}
}

for name, config in companies.items():
    print(f"\n{name} ({config['domain']}):")
    print("-" * 50)
    
    # Get domain status
    resp = requests.get(
        f"https://api.resend.com/domains/{config['domain_id']}",
        headers={"Authorization": f"Bearer {config['key']}"}
    )
    domain_data = resp.json()
    
    verified_count = sum(1 for r in domain_data.get('records', []) if r.get('status') == 'verified')
    total_records = len(domain_data.get('records', []))
    
    print(f"  DNS Verified: {verified_count}/{total_records} records")
    
    # Get recent emails
    resp = requests.get(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {config['key']}"}
    )
    emails = resp.json().get('data', [])
    
    today = datetime.now().strftime('%Y-%m-%d')
    today_count = sum(1 for e in emails if e.get('created_at', '').startswith(today))
    
    print(f"  Emails Today: {today_count}")
    print(f"  Recent: {len(emails)} total")
    
    # Get webhooks
    resp = requests.get(
        "https://api.resend.com/webhooks",
        headers={"Authorization": f"Bearer {config['key']}"}
    )
    webhooks = resp.json().get('data', [])
    
    print(f"  Webhooks: {len(webhooks)} configured")
    
    dashboard_data["companies"][name] = {
        "domain": config['domain'],
        "email": config['email'],
        "dns_verified": verified_count == total_records,
        "emails_today": today_count,
        "emails_total": len(emails),
        "webhooks": len(webhooks),
        "recent_emails": emails[:5]
    }

# Save to dashboard data file
with open('/data/data/com.termux/files/home/31harbor-agency-dashboard/data.json', 'w') as f:
    json.dump(dashboard_data, f, indent=2)

print("\n" + "=" * 70)
print("DASHBOARD DATA UPDATED")
print("=" * 70)
print(f"\nSaved to: /data/data/com.termux/files/home/31harbor-agency-dashboard/data.json")
print(f"Updated: {dashboard_data['updated']}")

print("\nSummary:")
for name, data in dashboard_data['companies'].items():
    status = "✓" if data['dns_verified'] else "⏳"
    print(f"  {status} {name}: {data['emails_today']} emails today, {data['webhooks']} webhooks")
