import { getDB } from './sqlite';

export function seedData(): void {
  const database = getDB();

  // ─── Companies ─────────────────────────────────────────────────────────
  const companiesData = [
    ['harbor', '31 Harbor', 'Real Estate', '#0A84FF', '31harbor.com', 'sk-••••••••89ab', 1, 50, 1, new Date().toISOString()],
    ['party', 'Party Favor Photo', 'Events / Photo Booth', '#F5A623', 'partyfavorphoto.com', 'sk-••••••••cdef', 1, 45, 1, new Date().toISOString()],
    ['xmrt', 'XMRT DAO', 'Tech / Crypto', '#7B61FF', 'xmrt.io', 'sk-••••••••0123', 1, 60, 1, new Date().toISOString()],
  ];

  const insertCompany = database.prepare(
    `INSERT INTO companies (id, name, industry, color, domain, api_key_masked, active, lead_score_threshold, dns_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const c of companiesData) {
    insertCompany.run(c);
  }
  insertCompany.free();

  // ─── Lead Sharing Rules (all allowed by default) ───────────────────────
  const sharingRules = [
    ['harbor', 'party', 1, new Date().toISOString()],
    ['harbor', 'xmrt', 1, new Date().toISOString()],
    ['party', 'harbor', 1, new Date().toISOString()],
    ['party', 'xmrt', 1, new Date().toISOString()],
    ['xmrt', 'harbor', 1, new Date().toISOString()],
    ['xmrt', 'party', 1, new Date().toISOString()],
  ];

  const insertRule = database.prepare(
    `INSERT INTO lead_sharing_rules (from_company, to_company, allowed, created_at) VALUES (?, ?, ?, ?)`
  );
  for (const r of sharingRules) {
    insertRule.run(r);
  }
  insertRule.free();

  // ─── 50 Leads ──────────────────────────────────────────────────────────
  const leadsData = [
    // Harbor leads (17)
    ['Sarah Mitchell', 'sarah@email.com', '555-0101', 'Organic', 'waterfront property inquiry', 'harbor', 87, 'Routed', 'high', 'Strong buying intent detected: searched for waterfront properties', 'qualify', 850000, '2025-06-10T08:23:00Z', '2025-06-10T08:23:00Z'],
    ['James & Linda Chen', 'jlchen@events.com', '555-0102', 'Referral', 'luxury condo viewing', 'harbor', 92, 'Qualified', 'high', 'Referred by existing client, high-net-worth profile', 'qualify', 1200000, '2025-06-10T07:45:00Z', '2025-06-10T07:45:00Z'],
    ['Roberto Alvarado', 'ralvarado@email.com', '555-0103', 'Organic', 'general inquiry', 'harbor', 45, 'Low Match', 'low', 'Vague inquiry, no specific property type', 'scraping', 0, '2025-06-10T06:12:00Z', '2025-06-10T06:12:00Z'],
    ['Harbor View Properties', 'info@harborview.com', '555-0104', 'Referral', 'commercial leasing', 'harbor', 71, 'Quoted', 'high', 'Commercial lease inquiry for retail space', 'quote', 45000, '2025-06-09T14:30:00Z', '2025-06-09T14:30:00Z'],
    ['Marina Residences', 'sales@marinares.com', '555-0105', 'Organic', 'luxury condo viewing', 'harbor', 82, 'Qualified', 'high', 'Repeat visitor, viewed luxury condos multiple times', 'qualify', 950000, '2025-06-09T12:00:00Z', '2025-06-09T12:00:00Z'],
    ['Coastal Realty Group', 'info@coastalrealty.com', '555-0106', 'Paid', 'property management', 'harbor', 91, 'Contracted', 'high', 'Property management contract for 12 units', 'contract', 36000, '2025-06-09T09:15:00Z', '2025-06-09T09:15:00Z'],
    ['Sunset Bay Homes', 'sales@sunsetbay.com', '555-0107', 'Referral', 'new development presale', 'harbor', 85, 'Routed', 'high', 'Presale interest in Phase 2 development', 'qualify', 680000, '2025-06-08T16:45:00Z', '2025-06-08T16:45:00Z'],
    ['Vista Costa Rica', 'info@vistacr.com', '555-0108', 'Organic', 'vacation rental inquiry', 'harbor', 48, 'Low Match', 'medium', 'Vacation rental, not primary residence', 'scraping', 5000, '2025-06-08T11:20:00Z', '2025-06-08T11:20:00Z'],
    ['Peninsula Developments', 'contact@peninsuladev.com', '555-0109', 'Paid', 'land acquisition', 'harbor', 76, 'Qualified', 'medium', 'Commercial land purchase interest', 'qualify', 2500000, '2025-06-08T08:00:00Z', '2025-06-08T08:00:00Z'],
    ['Island Living Magazine', 'ads@islandliving.com', '555-0110', 'Referral', 'advertising partnership', 'harbor', 63, 'Pending', 'medium', 'Advertising partnership inquiry', 'scraping', 8000, '2025-06-07T15:30:00Z', '2025-06-07T15:30:00Z'],
    ['Bayside Investors LLC', 'info@baysideinv.com', '555-0111', 'Organic', 'investment property', 'harbor', 88, 'Routed', 'high', 'Multi-property investment portfolio inquiry', 'qualify', 5000000, '2025-06-07T10:00:00Z', '2025-06-07T10:00:00Z'],
    ['Oceanfront Villas', 'sales@oceanfrontvillas.com', '555-0112', 'Paid', 'luxury villa rental', 'harbor', 79, 'Qualified', 'high', 'Luxury villa rental for 6 months', 'qualify', 180000, '2025-06-07T07:45:00Z', '2025-06-07T07:45:00Z'],
    ['Harbor Yacht Club', 'commodore@hyclub.com', '555-0113', 'Referral', 'marina slip lease', 'harbor', 94, 'Contracted', 'high', 'Annual marina slip lease renewal', 'contract', 24000, '2025-06-06T14:00:00Z', '2025-06-06T14:00:00Z'],
    ['Green Build Architects', 'projects@greenbuild.com', '555-0114', 'Organic', 'eco-friendly development', 'harbor', 67, 'Pending', 'medium', 'Sustainable building partnership', 'scraping', 120000, '2025-06-06T09:30:00Z', '2025-06-06T09:30:00Z'],
    ['Tropical Escapes Inc', 'bookings@tropicalescapes.com', '555-0115', 'Paid', 'resort property management', 'harbor', 73, 'Qualified', 'medium', 'Resort property management RFP', 'qualify', 85000, '2025-06-05T16:00:00Z', '2025-06-05T16:00:00Z'],
    ['Pacific Rim Capital', 'deals@pacificrim.com', '555-0116', 'Referral', 'bulk property purchase', 'harbor', 96, 'Contracted', 'high', 'Bulk purchase of 8 residential units', 'contract', 4200000, '2025-06-05T11:00:00Z', '2025-06-05T11:00:00Z'],
    ['Seaside Community Bank', 'loans@seasidecb.com', '555-0117', 'Organic', 'mortgage partnership', 'harbor', 58, 'Pending', 'low', 'Mortgage referral partnership inquiry', 'scraping', 0, '2025-06-05T08:00:00Z', '2025-06-05T08:00:00Z'],

    // Party Favor leads (17)
    ["Emily's Wedding Planning", 'emily@ewp.com', '555-0201', 'Organic', 'wedding photo booth package', 'party', 78, 'Routed', 'high', 'Wedding with 200+ guests, package C interest', 'qualify', 3500, '2025-06-10T07:30:00Z', '2025-06-10T07:30:00Z'],
    ['Birthday Bash Events', 'hello@bbevents.com', '555-0202', 'Organic', 'kids party package', 'party', 56, 'Qualified', 'medium', 'Kids birthday party for 30 guests', 'qualify', 800, '2025-06-10T05:45:00Z', '2025-06-10T05:45:00Z'],
    ['SnapHappy Photobooth', 'book@snaphappy.com', '555-0203', 'Organic', 'graduation event', 'party', 68, 'Pending', 'medium', 'High school graduation party', 'scraping', 1200, '2025-06-09T13:00:00Z', '2025-06-09T13:00:00Z'],
    ['Wedding Planners R Us', 'wp@wprus.com', '555-0204', 'Referral', 'wedding photo booth package', 'party', 89, 'Quoted', 'high', 'Premium wedding package with custom backdrop', 'quote', 4800, '2025-06-09T10:30:00Z', '2025-06-09T10:30:00Z'],
    ['PhotoGenic Events', 'book@photogenic.com', '555-0205', 'Paid', 'photo booth rental', 'party', 85, 'Routed', 'high', 'Corporate event photo booth, 500+ attendees', 'qualify', 5500, '2025-06-09T07:00:00Z', '2025-06-09T07:00:00Z'],
    ['Dream Day Celebrations', 'hello@dreamday.com', '555-0206', 'Organic', 'corporate event package', 'party', 74, 'Qualified', 'high', 'Annual corporate gala photo booth', 'qualify', 4200, '2025-06-08T15:00:00Z', '2025-06-08T15:00:00Z'],
    ['Fiesta Moments Co', 'info@fiestamoments.com', '555-0207', 'Paid', 'quinceañera package', 'party', 81, 'Qualified', 'high', 'Quinceañera celebration for 100 guests', 'qualify', 2200, '2025-06-08T11:30:00Z', '2025-06-08T11:30:00Z'],
    ['Holiday Cheer Events', 'book@holidaycheer.com', '555-0208', 'Referral', 'holiday party photo booth', 'party', 62, 'Pending', 'medium', 'Office holiday party booking', 'scraping', 1500, '2025-06-07T17:00:00Z', '2025-06-07T17:00:00Z'],
    ['Capture The Joy', 'info@capturethejoy.com', '555-0209', 'Organic', 'anniversary celebration', 'party', 77, 'Routed', 'high', '50th anniversary party, custom props requested', 'qualify', 1800, '2025-06-07T12:00:00Z', '2025-06-07T12:00:00Z'],
    ['Event Masters Pro', 'contact@eventmasters.com', '555-0210', 'Paid', 'trade show booth', 'party', 93, 'Contracted', 'high', '3-day trade show with branded photo experience', 'contract', 8500, '2025-06-06T14:30:00Z', '2025-06-06T14:30:00Z'],
    ['Memories In Motion', 'book@memoriesinmotion.com', '555-0211', 'Referral', 'bar mitzvah package', 'party', 70, 'Qualified', 'medium', 'Bar mitzvah celebration, green screen requested', 'qualify', 3200, '2025-06-06T09:00:00Z', '2025-06-06T09:00:00Z'],
    ['Shutter Fun Co', 'hello@shutterfun.com', '555-0212', 'Organic', 'birthday party', 'party', 52, 'Low Match', 'low', 'Small birthday party, budget constraints', 'scraping', 400, '2025-06-05T16:30:00Z', '2025-06-05T16:30:00Z'],
    ['Grand Gala Planners', 'events@grandgala.com', '555-0213', 'Paid', 'charity gala photo booth', 'party', 86, 'Contracted', 'high', 'Annual charity gala with VIP guests', 'contract', 7200, '2025-06-05T10:00:00Z', '2025-06-05T10:00:00Z'],
    ['InstaBooth Rentals', 'rent@instabooth.com', '555-0214', 'Organic', 'festival booth', 'party', 43, 'Low Match', 'low', 'Outdoor festival, equipment risk concern', 'scraping', 600, '2025-06-04T15:00:00Z', '2025-06-04T15:00:00Z'],
    ['Luxe Celebrations', 'hello@luxecel.com', '555-0215', 'Referral', 'destination wedding', 'party', 90, 'Contracted', 'high', 'Destination wedding in Bali, full package', 'contract', 12500, '2025-06-04T09:00:00Z', '2025-06-04T09:00:00Z'],
    ['Pro Pix Events', 'book@propix.com', '555-0216', 'Paid', 'school event', 'party', 65, 'Pending', 'medium', 'High school prom photo booth', 'scraping', 2000, '2025-06-03T14:00:00Z', '2025-06-03T14:00:00Z'],
    ['Smile Station Inc', 'info@smilestation.com', '555-0217', 'Organic', 'grand opening event', 'party', 59, 'Pending', 'medium', 'Retail store grand opening', 'scraping', 900, '2025-06-03T08:00:00Z', '2025-06-03T08:00:00Z'],

    // XMRT DAO leads (16)
    ['CryptoVentures LLC', 'contact@cryptov.com', '555-0301', 'Referral', 'token partnership inquiry', 'xmrt', 64, 'Pending', 'medium', 'Token integration partnership discussion', 'scraping', 50000, '2025-06-10T06:30:00Z', '2025-06-10T06:30:00Z'],
    ['DeFi Labs', 'partners@defilabs.io', '555-0302', 'Paid', 'smart contract audit', 'xmrt', 95, 'Contracted', 'high', 'Full smart contract audit for lending protocol', 'contract', 125000, '2025-06-10T04:00:00Z', '2025-06-10T04:00:00Z'],
    ['Blockchain Summit Org', 'team@bcsummit.org', '555-0303', 'Paid', 'sponsorship inquiry', 'xmrt', 88, 'Routed', 'high', 'Tier-1 sponsorship for blockchain summit', 'qualify', 75000, '2025-06-09T15:00:00Z', '2025-06-09T15:00:00Z'],
    ['Web3 Collective', 'hello@web3coll.org', '555-0304', 'Organic', 'consulting inquiry', 'xmrt', 59, 'Low Match', 'medium', 'Vague consulting inquiry, unclear scope', 'scraping', 5000, '2025-06-09T11:00:00Z', '2025-06-09T11:00:00Z'],
    ['TokenForge Inc', 'dev@tokenforge.io', '555-0305', 'Referral', 'NFT marketplace dev', 'xmrt', 73, 'Qualified', 'high', 'NFT marketplace development project', 'qualify', 180000, '2025-06-09T06:00:00Z', '2025-06-09T06:00:00Z'],
    ['DAO Masters', 'info@daomasters.xyz', '555-0306', 'Paid', 'governance tooling', 'xmrt', 84, 'Qualified', 'high', 'DAO governance platform integration', 'qualify', 95000, '2025-06-08T17:00:00Z', '2025-06-08T17:00:00Z'],
    ['ChainSec Solutions', 'security@chainsec.io', '555-0307', 'Organic', 'security audit', 'xmrt', 97, 'Contracted', 'high', 'Multi-contract security audit engagement', 'contract', 220000, '2025-06-08T12:30:00Z', '2025-06-08T12:30:00Z'],
    ['MetaVerse Builders', 'contact@mvbuilders.com', '555-0308', 'Referral', 'metaverse integration', 'xmrt', 69, 'Pending', 'medium', 'Metaverse land integration project', 'scraping', 45000, '2025-06-07T14:00:00Z', '2025-06-07T14:00:00Z'],
    ['Yield Protocol', 'partners@yieldproto.io', '555-0309', 'Paid', 'liquidity partnership', 'xmrt', 80, 'Qualified', 'high', 'Liquidity mining partnership proposal', 'qualify', 80000, '2025-06-07T08:00:00Z', '2025-06-07T08:00:00Z'],
    ['BlockVentures Capital', 'deal@blockvc.com', '555-0310', 'Organic', 'investment inquiry', 'xmrt', 91, 'Contracted', 'high', 'Series A investment discussion', 'contract', 500000, '2025-06-06T16:00:00Z', '2025-06-06T16:00:00Z'],
    ['Crypto Academy', 'learn@cryptoacademy.com', '555-0311', 'Referral', 'education partnership', 'xmrt', 55, 'Low Match', 'low', 'Educational content partnership, low revenue', 'scraping', 3000, '2025-06-06T10:00:00Z', '2025-06-06T10:00:00Z'],
    ['NFT Gallery DAO', 'curator@nftgallery.io', '555-0312', 'Paid', 'NFT curation platform', 'xmrt', 78, 'Qualified', 'high', 'NFT curation and marketplace platform', 'qualify', 65000, '2025-06-05T15:30:00Z', '2025-06-05T15:30:00Z'],
    ['Staking Hub', 'info@stakinghub.io', '555-0313', 'Organic', 'staking integration', 'xmrt', 83, 'Routed', 'high', 'Cross-chain staking integration', 'qualify', 40000, '2025-06-05T09:00:00Z', '2025-06-05T09:00:00Z'],
    ['Layer2 Solutions', 'dev@layer2.io', '555-0314', 'Referral', 'L2 scaling solution', 'xmrt', 87, 'Quoted', 'high', 'Layer 2 scaling integration for mainnet', 'quote', 150000, '2025-06-04T14:00:00Z', '2025-06-04T14:00:00Z'],
    ['CryptoTax Pro', 'api@cryptotaxpro.com', '555-0315', 'Paid', 'tax API integration', 'xmrt', 66, 'Pending', 'medium', 'Tax reporting API integration', 'scraping', 18000, '2025-06-04T08:00:00Z', '2025-06-04T08:00:00Z'],
    ['Decentral Games', 'partners@dgames.io', '555-0316', 'Organic', 'gaming partnership', 'xmrt', 72, 'Qualified', 'medium', 'GameFi platform integration', 'qualify', 60000, '2025-06-03T13:00:00Z', '2025-06-03T13:00:00Z'],
  ];

  const insertLead = database.prepare(
    `INSERT INTO leads (name, email, phone, source, intent, company_routed, score, status, ai_confidence, ai_reasoning, pipeline_stage, value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const l of leadsData) {
    insertLead.run(l);
  }
  insertLead.free();

  // ─── Pipeline Stages ───────────────────────────────────────────────────
  const stagesData = [
    ['scraping', 'SCRAPING', 0, 0, 0, 48],
    ['qualify', 'QUALIFY', 1, 0, 1, 24],
    ['quote', 'QUOTE', 2, 1, 0, 72],
    ['contract', 'CONTRACT', 3, 1, 0, 168],
    ['paid', 'PAID', 4, 0, 1, 48],
    ['fulfilled', 'FULFILLED', 5, 0, 1, 0],
  ];

  const insertStage = database.prepare(
    `INSERT INTO pipeline_stages (id, name, order_index, requires_approval, auto_advance, timeout_hours) VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const s of stagesData) {
    insertStage.run(s);
  }
  insertStage.free();

  // ─── Campaigns ─────────────────────────────────────────────────────────
  const campaignsData = [
    ['Wedding Season Boost', 'party', 'Active', 5000, 4200, 16800, 4.0, 125000, 3400, 42, 'Instagram', '2025-05-01', '2025-08-31'],
    ['Harbor Waterfront', 'harbor', 'Active', 8000, 6800, 20400, 3.0, 98000, 2100, 28, 'Google Ads', '2025-04-15', '2025-07-15'],
    ['XMRT Token Launch', 'xmrt', 'Pending', 15000, 3500, 0, 0, 0, 0, 0, 'Twitter/X', '2025-07-01', '2025-09-30'],
    ['Spring Photo Special', 'party', 'Active', 3500, 2800, 11200, 4.0, 87000, 1900, 35, 'Facebook', '2025-03-01', '2025-06-30'],
    ['Luxury Condos Campaign', 'harbor', 'Active', 7000, 5500, 17600, 3.2, 76000, 1800, 22, 'Google Ads', '2025-05-01', '2025-08-15'],
    ['DeFi Integration Push', 'xmrt', 'Active', 6000, 4200, 12600, 3.0, 54000, 1500, 18, 'LinkedIn', '2025-04-01', '2025-07-31'],
    ['Beach House Rentals', 'harbor', 'Pending', 3000, 1800, 0, 0, 0, 0, 0, 'Airbnb Ads', '2025-07-01', '2025-09-15'],
    ['Holiday Event Booking', 'party', 'Draft', 4000, 0, 0, 0, 0, 0, 0, 'Instagram', '2025-10-01', '2025-12-31'],
  ];

  const insertCampaign = database.prepare(
    `INSERT INTO campaigns (name, company, status, budget, spend, revenue, roi, reach, clicks, conversions, platform, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const c of campaignsData) {
    insertCampaign.run(c);
  }
  insertCampaign.free();

  // ─── Activity Log ──────────────────────────────────────────────────────
  const activityData = [
    ['lead', 'harbor', 'New lead routed to 31 Harbor — Sarah M. interested in waterfront property', '{"lead_id": 1, "score": 87}', '2m ago'],
    ['content', 'party', 'AI generated 3 Instagram posts for Party Favor Photo', '{"platform": "Instagram", "posts": 3}', '5m ago'],
    ['pipeline', 'xmrt', 'Pipeline stage completed: Contract signed — XMRT DAO', '{"stage": "contract", "company": "xmrt"}', '8m ago'],
    ['system', 'harbor', 'Lead classifier retrained — accuracy 94.2%', '{"accuracy": 94.2}', '12m ago'],
    ['campaign', 'party', 'Campaign ROAS hit 4.1x — wedding season promo', '{"roas": 4.1, "campaign": "Wedding Season Boost"}', '18m ago'],
    ['approval', 'xmrt', 'Human approval needed: Quote $12,500 — XMRT DAO', '{"amount": 12500, "type": "quote"}', '24m ago'],
    ['automation', 'harbor', 'Automated follow-up sent — 31 Harbor lead #2847', '{"lead_id": 1}', '31m ago'],
    ['lead', 'party', 'New lead: James & Linda Chen — wedding photo booth inquiry', '{"lead_id": 2, "score": 92}', '38m ago'],
    ['analytics', 'xmrt', 'Weekly analytics report generated for XMRT DAO', '{"report_type": "weekly"}', '45m ago'],
    ['pipeline', 'harbor', 'Pipeline stage completed: Quote accepted — Harbor View', '{"stage": "quote", "company": "harbor"}', '52m ago'],
    ['campaign', 'party', 'Ad spend optimized: -12% CPC improvement', '{"change": -12, "metric": "CPC"}', '1h ago'],
    ['automation', 'xmrt', 'Smart contract deployed for DeFi Labs partnership', '{"contract": "DeFi Labs"}', '1h ago'],
    ['lead', 'harbor', 'Lead score updated: Marina Residences +8 points', '{"lead_id": 5, "change": 8}', '1h ago'],
    ['content', 'party', 'AI drafted email sequence for Birthday Bash Events', '{"lead_id": 12, "emails": 3}', '2h ago'],
    ['system', 'xmrt', 'Routing rule updated: crypto leads now score +15%', '{"change": "+15%", "category": "crypto"}', '2h ago'],
    ['approval', 'harbor', 'Low match alert: Roberto Alvarado — manual review suggested', '{"lead_id": 3, "score": 45}', '2h ago'],
    ['content', 'party', 'Content published: 2 Instagram Reels, 1 TikTok', '{"reels": 2, "tiktoks": 1}', '3h ago'],
    ['lead', 'xmrt', 'New lead: Blockchain Summit Org — sponsorship inquiry', '{"lead_id": 19, "score": 88}', '3h ago'],
    ['analytics', 'harbor', 'Revenue target 68% complete — ahead of schedule', '{"progress": 68}', '4h ago'],
    ['automation', 'party', 'Automated SMS campaign sent to 47 leads', '{"recipients": 47, "type": "SMS"}', '4h ago'],
  ];

  const insertActivity = database.prepare(
    `INSERT INTO activity_log (type, company, description, metadata, created_at) VALUES (?, ?, ?, ?, ?)`
  );
  for (const a of activityData) {
    insertActivity.run(a);
  }
  insertActivity.free();

  // ─── Users ─────────────────────────────────────────────────────────────
  const usersData = [
    ['Alex Chen', 'alex@suiteai.io', 'admin', 'all', 'active', '2025-06-10T14:00:00Z'],
    ['Sarah Johnson', 'sarah.j@suiteai.io', 'manager', 'harbor,party', 'active', '2025-06-10T13:30:00Z'],
    ['Marcus Rivera', 'marcus@suiteai.io', 'operator', 'xmrt', 'active', '2025-06-10T12:00:00Z'],
    ['Priya Patel', 'priya@suiteai.io', 'viewer', 'all', 'active', '2025-06-09T18:00:00Z'],
    ['Tom Bradley', 'tom@suiteai.io', 'manager', 'party', 'away', '2025-06-08T09:00:00Z'],
  ];

  const insertUser = database.prepare(
    `INSERT INTO users (name, email, role, companies, status, last_active) VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const u of usersData) {
    insertUser.run(u);
  }
  insertUser.free();
  // ─── Email Activity (Resend) ──────────────────────────────────────────
  const emailActivityData = [
    ['re_001_harbor', 'harbor', 'agent@31harbor.com', 'sarah@email.com', 'Welcome to 31 Harbor', 'delivered', 1, 1, '2025-06-10T14:30:00Z', '2025-06-10T14:30:00Z'],
    ['re_002_harbor', 'harbor', 'listings@31harbor.com', 'ralvarado@email.com', 'New Listings This Week', 'sent', 0, 0, '2025-06-10T12:00:00Z', '2025-06-10T12:00:00Z'],
    ['re_003_harbor', 'harbor', 'concierge@31harbor.com', 'info@harborview.com', 'Your Viewing Appointment', 'delivered', 1, 0, '2025-06-09T10:00:00Z', '2025-06-09T10:00:00Z'],
    ['re_004_party', 'party', 'bookings@partyfavorphoto.com', 'jlchen@events.com', 'Your Event is Confirmed!', 'delivered', 1, 1, '2025-06-10T15:00:00Z', '2025-06-10T15:00:00Z'],
    ['re_005_party', 'party', 'gallery@partyfavorphoto.com', 'emily@weddingplanning.com', 'Your Photo Gallery is Ready', 'delivered', 2, 1, '2025-06-09T09:00:00Z', '2025-06-09T09:00:00Z'],
    ['re_006_party', 'party', 'promo@partyfavorphoto.com', 'events@birthdaybash.com', 'Summer Special: 20% Off', 'sent', 0, 0, '2025-06-08T16:00:00Z', '2025-06-08T16:00:00Z'],
    ['re_007_xmrt', 'xmrt', 'security@xmrt.io', 'contact@cryptomining.com', 'Security Audit Results', 'delivered', 1, 1, '2025-06-10T11:00:00Z', '2025-06-10T11:00:00Z'],
    ['re_008_xmrt', 'xmrt', 'node@xmrt.io', 'admin@smartnodes.org', 'Node Sync Complete', 'delivered', 0, 1, '2025-06-09T08:00:00Z', '2025-06-09T08:00:00Z'],
    ['re_009_xmrt', 'xmrt', 'security@xmrt.io', 'alerts@chaindefender.com', 'Threat Alert: Block 48291', 'sent', 0, 0, '2025-06-08T14:00:00Z', '2025-06-08T14:00:00Z'],
  ];
  const insertEmail = database.prepare(
    `INSERT INTO email_activity (resend_id, company_id, email_from, email_to, subject, status, clicks, opens, sent_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const e of emailActivityData) { insertEmail.run(e); }
  insertEmail.free();

}
