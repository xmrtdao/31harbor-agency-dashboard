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
    ['CryptoVentures LLC', 'contact@cryptov.com', '555-0301', 'Organic', 'DAO governance tooling', 'xmrt', 85, 'Routed', 'high', 'Enterprise DAO tooling inquiry — 200+ members', 'qualify', 75000, '2025-06-10T09:00:00Z', '2025-06-10T09:00:00Z'],
    ['DeFi Labs', 'hello@defilabs.io', '555-0302', 'Referral', 'smart contract audit', 'xmrt', 92, 'Qualified', 'high', 'Referred by existing partner — urgent timeline', 'qualify', 45000, '2025-06-10T06:30:00Z', '2025-06-10T06:30:00Z'],
    ['BlockBuilders Inc', 'admin@blockbuilders.io', '555-0303', 'Organic', 'API integration', 'xmrt', 67, 'Pending', 'medium', 'Multi-chain API integration request', 'scraping', 28000, '2025-06-09T15:00:00Z', '2025-06-09T15:00:00Z'],
    ['TokenForge', 'support@tokenforge.dev', '555-0304', 'Paid', 'token launch platform', 'xmrt', 78, 'Quoted', 'high', 'Token launchpad integration — custom requirements', 'quote', 120000, '2025-06-09T11:00:00Z', '2025-06-09T11:00:00Z'],
    ['ChainGuardians', 'team@chainguardians.io', '555-0305', 'Referral', 'security audit', 'xmrt', 88, 'Contracted', 'high', 'Comprehensive security audit — 3 month engagement', 'contract', 95000, '2025-06-09T08:00:00Z', '2025-06-09T08:00:00Z'],
    ['Web3 Creators', 'hello@web3creators.co', '555-0306', 'Organic', 'education platform', 'xmrt', 54, 'Low Match', 'medium', 'Online course platform — budget TBD', 'scraping', 15000, '2025-06-08T17:00:00Z', '2025-06-08T17:00:00Z'],
    ['MetaLaunch DAO', 'launch@metalaunch.dao', '555-0307', 'Paid', 'launchpad partnership', 'xmrt', 81, 'Routed', 'high', 'Cross-DAO launchpad partnership proposal', 'qualify', 200000, '2025-06-08T13:00:00Z', '2025-06-08T13:00:00Z'],
    ['NFT Collective', 'creators@nftcollective.io', '555-0308', 'Organic', 'marketplace integration', 'xmrt', 73, 'Pending', 'medium', 'NFT marketplace integration — 10k collection', 'scraping', 55000, '2025-06-08T07:00:00Z', '2025-06-08T07:00:00Z'],
    ['Staking Solutions', 'info@stakingsol.io', '555-0309', 'Referral', 'staking protocol', 'xmrt', 90, 'Qualified', 'high', 'Liquid staking protocol — $50M TVL target', 'qualify', 180000, '2025-06-07T16:00:00Z', '2025-06-07T16:00:00Z'],
    ['DAO Governance Institute', 'research@daogov.io', '555-0310', 'Paid', 'governance research', 'xmrt', 62, 'Pending', 'medium', 'Governance framework research project', 'scraping', 35000, '2025-06-07T11:00:00Z', '2025-06-07T11:00:00Z'],
    ['CryptoTax Pro', 'support@cryptotax.pro', '555-0311', 'Organic', 'tax integration', 'xmrt', 76, 'Routed', 'high', 'DeFi tax reporting integration — API access needed', 'qualify', 42000, '2025-06-06T15:00:00Z', '2025-06-06T15:00:00Z'],
    ['Bridge Protocol', 'dev@bridgeproto.io', '555-0312', 'Referral', 'bridge integration', 'xmrt', 83, 'Qualified', 'high', 'Cross-chain bridge — ETH/SOL integration', 'qualify', 135000, '2025-06-06T10:00:00Z', '2025-06-06T10:00:00Z'],
    ['ZeroKnowledge Labs', 'hello@zklabs.io', '555-0313', 'Paid', 'ZK proof system', 'xmrt', 95, 'Contracted', 'high', 'ZK-rollup implementation — 6 month project', 'contract', 320000, '2025-06-05T14:00:00Z', '2025-06-05T14:00:00Z'],
    ['GameFi Studios', 'team@gamefi.gg', '555-0314', 'Organic', 'gamefi platform', 'xmrt', 69, 'Pending', 'medium', 'GameFi platform — tokenomics consultation', 'scraping', 68000, '2025-06-05T08:00:00Z', '2025-06-05T08:00:00Z'],
    ['Solana Ventures', 'deals@solventures.io', '555-0315', 'Referral', 'ecosystem grant', 'xmrt', 87, 'Contracted', 'high', 'Ecosystem grant — DeFi infrastructure', 'contract', 250000, '2025-06-04T12:00:00Z', '2025-06-04T12:00:00Z'],
    ['Oracle Network', 'dev@oraclenet.io', '555-0316', 'Paid', 'oracle integration', 'xmrt', 79, 'Pending', 'medium', 'Price oracle integration — 50+ trading pairs', 'scraping', 89000, '2025-06-03T10:00:00Z', '2025-06-03T10:00:00Z'],
  ];

  const insertLead = database.prepare(
    `INSERT INTO leads (name, email, phone, source, intent, company_routed, score, status, ai_confidence, ai_reasoning, pipeline_stage, value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const l of leadsData) {
    insertLead.run(l);
  }
  insertLead.free();

  // ─── Campaigns ─────────────────────────────────────────────────────────
  const campaignsData = [
    ['Wedding Season Boost', 'party', 'active', 15000, 4200, 18500, 3.4, 45000, 3200, 145, 'meta', '2025-05-01', '2025-08-31'],
    ['Luxury Condo Launch', 'harbor', 'active', 25000, 8900, 42000, 4.7, 28000, 1800, 92, 'google', '2025-04-15', '2025-07-15'],
    ['DAO Governance Push', 'xmrt', 'active', 8000, 2100, 9500, 4.5, 12000, 890, 67, 'twitter', '2025-05-15', '2025-06-30'],
    ['Photo Booth Retargeting', 'party', 'active', 5000, 1500, 6200, 4.1, 18000, 2100, 178, 'meta', '2025-06-01', '2025-06-30'],
    ['Waterfront SEO', 'harbor', 'active', 3000, 800, 4500, 5.6, 8000, 340, 28, 'google', '2025-03-01', '2025-09-01'],
    ['DeFi Integration', 'xmrt', 'paused', 12000, 5400, 18000, 3.3, 9000, 670, 45, 'twitter', '2025-05-01', '2025-06-15'],
    ['Holiday Special', 'party', 'draft', 8000, 0, 0, 0, 0, 0, 0, 'meta', '2025-11-01', '2026-01-15'],
    ['Commercial Leads', 'harbor', 'active', 6000, 1200, 8500, 7.1, 6000, 180, 15, 'linkedin', '2025-06-01', '2025-08-31'],
    ['ZK Summit', 'xmrt', 'active', 5000, 1800, 7200, 4.0, 5500, 420, 34, 'twitter', '2025-06-01', '2025-07-15'],
    ['Bridal Fair Follow-up', 'party', 'completed', 4000, 3800, 11200, 2.9, 22000, 1800, 156, 'meta', '2025-04-01', '2025-05-31'],
  ];

  const insertCampaign = database.prepare(
    `INSERT INTO campaigns (name, company, status, budget, spend, revenue, roi, reach, clicks, conversions, platform, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const c of campaignsData) {
    insertCampaign.run(c);
  }
  insertCampaign.free();

  // ─── Pipeline Stages ───────────────────────────────────────────────────
  const pipelineStagesData = [
    ['scraping', 'Scraping', 1, 0, 0, 24],
    ['qualify', 'Qualify', 2, 0, 1, 48],
    ['quote', 'Quote', 3, 1, 0, 72],
    ['contract', 'Contract', 4, 1, 0, 168],
    ['paid', 'Paid', 5, 0, 1, 24],
  ];

  const insertStage = database.prepare(
    `INSERT INTO pipeline_stages (id, name, order_index, requires_approval, auto_advance, timeout_hours) VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const s of pipelineStagesData) {
    insertStage.run(s);
  }
  insertStage.free();

  // ─── Activity Log ──────────────────────────────────────────────────────
  const activityData = [
    ['lead', 'harbor', 'New lead: Sarah Mitchell scored 87 — waterfront property inquiry', '{\"lead_id\": 1, \"score\": 87}', '2m ago'],
    ['lead', 'party', 'Lead routed: Emily\\'s Wedding Planning to Party Favor Photo', '{\"lead_id\": 18, \"target\": \"party\"}', '5m ago'],
    ['automation', 'xmrt', 'AMA agent created draft proposal for CryptoVentures LLC', '{\"lead_id\": 34, \"agent\": \"AMA\"}', '8m ago'],
    ['pipeline', 'harbor', 'Pipeline stage advanced: James & Linda Chen → Qualify', '{\"lead_id\": 2, \"stage\": \"qualify\"}', '12m ago'],
    ['analytics', 'party', 'Campaign ROAS hit 4.1x — Wedding Season Boost', '{\"campaign\": \"Wedding Season Boost\", \"roas\": 4.1}', '15m ago'],
    ['lead', 'xmrt', 'DeFi Labs lead score updated: 88 (+6)', '{\"lead_id\": 35, \"score\": 88}', '18m ago'],
    ['system', 'harbor', 'DNS verification completed for 31harbor.com', '{\"domain\": \"31harbor.com\"}', '22m ago'],
    ['content', 'party', 'AI generated 3 Instagram Reels for Birthday Bash Events', '{\"lead_id\": 19, \"reels\": 3}', '25m ago'],
    ['approval', 'xmrt', 'Governance proposal #47 requires approval — $200K allocation', '{\"proposal\": 47, \"amount\": 200000}', '28m ago'],
    ['lead', 'party', 'New lead: Grand Gala Planners — charity event scored 86', '{\"lead_id\": 30, \"score\": 86}', '30m ago'],
    ['pipeline', 'xmrt', 'Smart contract deployment stage completed for ZeroKnowledge Labs', '{\"lead_id\": 48, \"stage\": \"contract\"}', '35m ago'],
    ['analytics', 'harbor', 'Luxury Condo Launch campaign reach exceeded 25K impressions', '{\"campaign\": \"Luxury Condo Launch\", \"reach\": 25000}', '38m ago'],
    ['automation', 'party', 'Follow-up email sequence sent to 12 pending leads', '{\"recipients\": 12, \"type\": \"follow_up\"}', '42m ago'],
    ['lead', 'xmrt', 'Bridge Protocol inquiry — cross-chain integration scored 83', '{\"lead_id\": 45, \"score\": 83}', '45m ago'],
    ['system', 'party', 'Lead classifier accuracy: 94.2% — model v2.4.1 active', '{\"accuracy\": 94.2, \"version\": \"2.4.1\"}', '48m ago'],
    ['content', 'harbor', 'Property listing video generated for Marina Residences', '{\"lead_id\": 5, \"type\": \"video\"}', '50m ago'],
    ['lead', 'harbor', 'New lead: Pacific Rim Capital — bulk purchase inquiry scored 96', '{\"lead_id\": 16, \"score\": 96}', '52m ago'],
    ['pipeline', 'party', 'Quote approved: Wedding Planners R Us — $4,800 package', '{\"lead_id\": 21, \"value\": 4800}', '55m ago'],
    ['analytics', 'xmrt', 'Weekly report: XMRT DAO pipeline value up 18%', '{\"change\": 18, \"metric\": \"pipeline_value\"}', '1h ago'],
    ['automation', 'harbor', 'Auto-routing rule triggered: 3 leads → 31 Harbor', '{\"count\": 3, \"target\": \"harbor\"}', '1h ago'],
    ['lead', 'party', 'SnapHappy Photobooth — graduation event scored 68', '{\"lead_id\": 20, \"score\": 68}', '1h ago'],
    ['system', 'xmrt', 'New integration connected: Solana RPC node', '{\"integration\": \"solana_rpc\"}', '1h ago'],
    ['approval', 'harbor', 'Quote approval required: Peninsula Developments — $2.5M', '{\"lead_id\": 9, \"value\": 2500000}', '1h ago'],
    ['content', 'xmrt', 'AMA agent published thread: ZK-rollup benefits for enterprise', '{\"agent\": \"AMA\", \"platform\": \"twitter\"}', '1h ago'],
    ['lead', 'xmrt', 'New lead: MetaLaunch DAO — partnership inquiry scored 81', '{\"lead_id\": 40, \"score\": 81}', '1h ago'],
    ['pipeline', 'harbor', 'Contract signed: Coastal Realty Group — property management', '{\"lead_id\": 6, \"value\": 36000}', '2h ago'],
    ['analytics', 'party', 'Photo Booth Retargeting campaign CTR: 11.7%', '{\"campaign\": \"Photo Booth Retargeting\", \"ctr\": 11.7}', '2h ago'],
    ['automation', 'xmrt', 'Governance vote completed: Proposal #46 passed (87%)', '{\"proposal\": 46, \"result\": \"passed\"}', '2h ago'],
    ['lead', 'harbor', 'Bayside Investors LLC — multi-property portfolio scored 88', '{\"lead_id\": 11, \"score\": 88}', '2h ago'],
    ['system', 'party', 'Webhook configured: partyfavorphoto.com → SuiteAI', '{\"domain\": \"partyfavorphoto.com\"}', '2h ago'],
    ['content', 'harbor', 'Blog post drafted: Top 10 Waterfront Investment Tips', '{\"type\": \"blog\", \"topic\": \"waterfront_investment\"}', '3h ago'],
    ['lead', 'xmrt', 'CryptoTax Pro integration request — scored 76', '{\"lead_id\": 44, \"score\": 76}', '3h ago'],
    ['pipeline', 'party', 'Lead qualification: Fiesta Moments Co — quinceañera package', '{\"lead_id\": 24, \"stage\": \"qualify\"}', '3h ago'],
    ['analytics', 'xmrt', 'DAO Governance Push: 1,200 new community members', '{\"campaign\": \"DAO Governance Push\", \"members\": 1200}', '3h ago'],
    ['automation', 'harbor', 'Email nurture sequence triggered: 5 new subscribers', '{\"count\": 5, \"type\": \"nurture\"}', '3h ago'],
    ['lead', 'party', 'New lead: Pro Pix Events — school event scored 65', '{\"lead_id\": 33, \"score\": 65}', '4h ago'],
    ['system', 'xmrt', 'Blockchain index sync completed: 99.8% uptime', '{\"uptime\": 99.8}', '4h ago'],
    ['approval', 'party', 'Custom backdrop approval needed: Wedding Planners R Us', '{\"lead_id\": 21, \"type\": \"custom_backdrop\"}', '4h ago'],
    ['content', 'xmrt', 'AMA agent created comparison guide: XMRT vs competitors', '{\"agent\": \"AMA\", \"type\": \"comparison\"}', '4h ago'],
  ];

  const insertActivity = database.prepare(
    `INSERT INTO activity_log (type, company, description, metadata, created_at) VALUES (?, ?, ?, ?, ?)`
  );
  for (const a of activityData) {
    insertActivity.run(a);
  }
  insertActivity.free();

  // ─── Email Activity (Resend integration seed data) ─────────────────────
  const emailActivityData = [
    ['re_001_harbor', 'harbor', 'leads@31harbor.com', 'sarah@email.com', 'Welcome to 31 Harbor \u2014 Your Waterfront Property Inquiry', 'delivered', 1, 2, '2025-06-10T14:23:00Z', '2025-06-10T14:23:00Z'],
    ['re_002_harbor', 'harbor', 'listings@31harbor.com', 'jlchen@events.com', 'New Luxury Listings \u2014 Marina Residences', 'opened', 0, 3, '2025-06-10T11:45:00Z', '2025-06-10T11:45:00Z'],
    ['re_003_harbor', 'harbor', 'agent@31harbor.com', 'ralvarado@email.com', 'Follow-up: Property Viewing Scheduled', 'sent', 0, 0, '2025-06-09T16:30:00Z', '2025-06-09T16:30:00Z'],
    ['re_004_harbor', 'harbor', 'listings@31harbor.com', 'sales@marinares.com', 'Commercial Lease Proposal \u2014 Harbor View Retail', 'clicked', 2, 1, '2025-06-09T09:15:00Z', '2025-06-09T09:15:00Z'],
    ['re_005_harbor', 'harbor', 'leads@31harbor.com', 'info@baysideinv.com', 'Investment Portfolio Opportunities', 'delivered', 0, 1, '2025-06-08T13:00:00Z', '2025-06-08T13:00:00Z'],
    ['re_006_party', 'party', 'bookings@partyfavorphoto.com', 'emily@ewp.com', 'Your Wedding Photo Booth Quote \u2014 Package C', 'opened', 1, 4, '2025-06-10T15:30:00Z', '2025-06-10T15:30:00Z'],
    ['re_007_party', 'party', 'events@partyfavorphoto.com', 'hello@bbevents.com', 'Kids Party Package Availability Confirmed', 'delivered', 0, 1, '2025-06-10T08:00:00Z', '2025-06-10T08:00:00Z'],
    ['re_008_party', 'party', 'bookings@partyfavorphoto.com', 'wp@wprus.com', 'Premium Wedding Package \u2014 Custom Backdrop Details', 'clicked', 1, 2, '2025-06-09T14:20:00Z', '2025-06-09T14:20:00Z'],
    ['re_009_party', 'party', 'events@partyfavorphoto.com', 'book@photogenic.com', 'Corporate Event Booth \u2014 500+ Attendees', 'sent', 0, 0, '2025-06-08T10:45:00Z', '2025-06-08T10:45:00Z'],
    ['re_010_party', 'party', 'bookings@partyfavorphoto.com', 'events@grandgala.com', 'Charity Gala Photo Booth Confirmation', 'delivered', 0, 1, '2025-06-07T18:00:00Z', '2025-06-07T18:00:00Z'],
    ['re_011_xmrt', 'xmrt', 'contact@xmrt.io', 'contact@cryptov.com', 'XMRT DAO \u2014 Developer Grant Application Update', 'opened', 1, 3, '2025-06-10T12:00:00Z', '2025-06-10T12:00:00Z'],
    ['re_012_xmrt', 'xmrt', 'dev@xmrt.io', 'admin@blockbuilders.io', 'API Access Credentials \u2014 XMRT Protocol v2.1', 'delivered', 0, 1, '2025-06-10T07:15:00Z', '2025-06-10T07:15:00Z'],
    ['re_013_xmrt', 'xmrt', 'contact@xmrt.io', 'dao@governance.sol', 'Governance Proposal #47 \u2014 Voting Reminder', 'clicked', 2, 2, '2025-06-09T11:30:00Z', '2025-06-09T11:30:00Z'],
    ['re_014_xmrt', 'xmrt', 'marketing@xmrt.io', 'partners@defitrading.io', 'Partnership Deck \u2014 XMRT DAO Ecosystem', 'sent', 0, 0, '2025-06-08T16:45:00Z', '2025-06-08T16:45:00Z'],
    ['re_015_xmrt', 'xmrt', 'dev@xmrt.io', 'deploy@smartcontracts.dev', 'Smart Contract Audit Report \u2014 Complete', 'delivered', 1, 1, '2025-06-07T09:00:00Z', '2025-06-07T09:00:00Z'],
  ];

  const insertEmail = database.prepare(
    `INSERT INTO email_activity (resend_id, company_id, email_from, email_to, subject, status, clicks, opens, sent_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const e of emailActivityData) {
    insertEmail.run(e);
  }
  insertEmail.free();

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
}
