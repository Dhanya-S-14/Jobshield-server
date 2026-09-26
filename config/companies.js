/**
 * Verified Company Registry — official, real domains only.
 * Used by the detection engine as the deterministic source of truth for
 * company-identity verification (independent of the MongoDB seed status).
 *
 * Company is added here only when verified against the company's official
 * careers/domain presence. Verification level: 'enterprise-verified'.
 *
 * IMPORTANT POLICIES
 *  - A company in this registry only confirms COMPANY IDENTITY.
 *    A job claiming to be from a real company still needs its own checks
 *    (domain, email, posting quality). REAL COMPANY != REAL JOB.
 *  - Unlisted companies are "Unknown", never automatically a scam.
 *  - Fuzzy name matches must be strong (>= 0.85 similarity) before a company
 *    is treated as verified identity — weak matches stay "Unknown".
 */

const companies = [
  /* ------------------------------- IT Services ------------------------------- */
  { name: 'Tata Consultancy Services', shortName: 'TCS', aliases: ['tcs', 'tata consultancy', 'tata consultancies', 'tcs digital', 'tcs ltd'], domain: 'tcs.com', alternateDomains: ['tata.com', 'tcs-digital.com'], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'HCLTech', shortName: 'HCLTech', aliases: ['hcl tech', 'hcl technologies', 'hcl technology', 'hcl'], domain: 'hcltech.com', alternateDomains: ['hcl.com'], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'Infosys', shortName: 'Infosys', aliases: ['infosys limited', 'infosys ltd', 'infosys technologies'], domain: 'infosys.com', alternateDomains: [], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'Wipro', shortName: 'Wipro', aliases: ['wipro limited', 'wipro ltd', 'wipro technologies'], domain: 'wipro.com', alternateDomains: [], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'Accenture', shortName: 'Accenture', aliases: ['accenture plc', 'accenture ltd', 'accenture india'], domain: 'accenture.com', alternateDomains: [], industry: 'Consulting / IT Services', country: 'Global', companyType: 'MNC' },
  { name: 'Cognizant', shortName: 'Cognizant', aliases: ['cognizant technology solutions', 'cognizant technologies', 'cts'], domain: 'cognizant.com', alternateDomains: [], industry: 'IT Services', country: 'Global', companyType: 'MNC' },
  { name: 'Capgemini', shortName: 'Capgemini', aliases: ['capgemini group', 'capgemini india'], domain: 'capgemini.com', alternateDomains: [], industry: 'Consulting / IT Services', country: 'Global', companyType: 'MNC' },
  { name: 'IBM', shortName: 'IBM', aliases: ['international business machines', 'ibm corporation', 'ibm india'], domain: 'ibm.com', alternateDomains: [], industry: 'Technology', country: 'Global', companyType: 'MNC' },
  { name: 'Microsoft', shortName: 'Microsoft', aliases: ['microsoft corporation', 'msft', 'microsoft india'], domain: 'microsoft.com', alternateDomains: ['microsoft.net', 'microsoft.co.in'], industry: 'Technology', country: 'Global', companyType: 'MNC' },
  { name: 'Google', shortName: 'Google', aliases: ['google inc', 'alphabet', 'google india'], domain: 'google.com', alternateDomains: ['google.co.in', 'google.co.uk', 'google.de', 'googlecareers.com'], industry: 'Technology', country: 'Global', companyType: 'MNC' },
  { name: 'Amazon', shortName: 'Amazon', aliases: ['amazon.com', 'amazon.in', 'amazon career', 'aws', 'amazon web services'], domain: 'amazon.com', alternateDomains: ['amazon.in', 'amazon.co.uk', 'amazon.jobs', 'amazonaws.com'], industry: 'E-commerce / Cloud Computing', country: 'Global', companyType: 'MNC' },
  { name: 'Oracle', shortName: 'Oracle', aliases: ['oracle corporation', 'oracle india', 'oracle financial services'], domain: 'oracle.com', alternateDomains: [], industry: 'Enterprise Software', country: 'Global', companyType: 'MNC' },
  { name: 'Deloitte', shortName: 'Deloitte', aliases: ['deloitte touche tohmatsu', 'dtt', 'deloitte india'], domain: 'deloitte.com', alternateDomains: [], industry: 'Consulting / Professional Services', country: 'Global', companyType: 'MNC' },
  { name: 'EY', shortName: 'EY', aliases: ['ernst and young', 'ernst & young', 'ey global', 'ernst young'], domain: 'ey.com', alternateDomains: [], industry: 'Consulting / Professional Services', country: 'Global', companyType: 'MNC' },
  { name: 'KPMG', shortName: 'KPMG', aliases: ['kpmg international', 'kpmg india'], domain: 'kpmg.com', alternateDomains: [], industry: 'Consulting / Professional Services', country: 'Global', companyType: 'MNC' },
  { name: 'PwC', shortName: 'PwC', aliases: ['pricewaterhousecoopers', 'price water house coopers', 'pwc india'], domain: 'pwc.com', alternateDomains: [], industry: 'Consulting / Professional Services', country: 'Global', companyType: 'MNC' },
  { name: 'Tech Mahindra', shortName: 'Tech Mahindra', aliases: ['techmahindra', 'tech mahindra limited'], domain: 'techmahindra.com', alternateDomains: [], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'LTIMindtree', shortName: 'LTIMindtree', aliases: ['lti mindtree', 'lt imindtree', 'l&t infotech', 'larsen and toubro infotech'], domain: 'ltimindtree.com', alternateDomains: ['mindtree.com'], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'Mphasis', shortName: 'Mphasis', aliases: ['mphasis limited', 'mphasis ltd'], domain: 'mphasis.com', alternateDomains: [], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'DXC Technology', shortName: 'DXC', aliases: ['dxc', 'dxc technologies', 'csc'], domain: 'dxc.com', alternateDomains: [], industry: 'IT Services', country: 'Global', companyType: 'MNC' },
  { name: 'NTT DATA', shortName: 'NTT DATA', aliases: ['ntt data services', 'ntt'], domain: 'nttdata.com', alternateDomains: ['nttdata.co.in'], industry: 'IT Services', country: 'Japan', companyType: 'MNC' },
  { name: 'Fujitsu', shortName: 'Fujitsu', aliases: ['fujitsu limited', 'fujitsu india'], domain: 'fujitsu.com', alternateDomains: [], industry: 'IT Services', country: 'Japan', companyType: 'MNC' },
  { name: 'Hitachi', shortName: 'Hitachi', aliases: ['hitachi ltd', 'hitachi india'], domain: 'hitachi.com', alternateDomains: [], industry: 'Technology', country: 'Japan', companyType: 'MNC' },
  { name: 'Toshiba', shortName: 'Toshiba', aliases: ['toshiba corporation', 'toshiba india'], domain: 'global.toshiba', alternateDomains: ['toshiba.co.jp'], industry: 'Technology', country: 'Japan', companyType: 'MNC' },
  { name: 'Persistent Systems', shortName: 'Persistent', aliases: ['persistent', 'persistent systems ltd', 'pspl'], domain: 'persistent.com', alternateDomains: [], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'Cyient', shortName: 'Cyient', aliases: ['cyient limited', 'infotech enterprises'], domain: 'cyient.com', alternateDomains: [], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'Coforge', shortName: 'Coforge', aliases: ['coforge limited', 'niit technologies'], domain: 'coforge.com', alternateDomains: [], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'Happiest Minds', shortName: 'Happiest Minds', aliases: ['happiestminds', 'happiest minds technologies'], domain: 'happiestminds.com', alternateDomains: [], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'Sonata Software', shortName: 'Sonata', aliases: ['sonata', 'sonata software ltd'], domain: 'sonata-software.com', alternateDomains: [], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'Zensar Technologies', shortName: 'Zensar', aliases: ['zensar', 'zensar technologies'], domain: 'zensar.com', alternateDomains: [], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'Hexaware', shortName: 'Hexaware', aliases: ['hexaware technologies'], domain: 'hexaware.com', alternateDomains: [], industry: 'IT Services', country: 'India', companyType: 'MNC' },
  { name: 'KPIT', shortName: 'KPIT', aliases: ['kpit technologies'], domain: 'kpit.com', alternateDomains: [], industry: 'IT / Automotive Engineering', country: 'India', companyType: 'MNC' },
  { name: 'Tata Elxsi', shortName: 'Tata Elxsi', aliases: ['tata elxsi limited'], domain: 'tataelxsi.com', alternateDomains: [], industry: 'Product Engineering / IT', country: 'India', companyType: 'MNC' },
  { name: 'Tata Technologies', shortName: 'Tata Tech', aliases: ['tata technologies limited', 'tatatechnologies'], domain: 'tatatechnologies.com', alternateDomains: [], industry: 'Engineering Services', country: 'India', companyType: 'MNC' },
  { name: 'Tata Communications', shortName: 'Tata Comms', aliases: ['tata communications limited', 'tatacommunications'], domain: 'tatacommunications.com', alternateDomains: [], industry: 'Telecom / Network Services', country: 'India', companyType: 'MNC' },

  /* ------------------------------ Enterprise Software ------------------------------ */
  { name: 'Zoho', shortName: 'Zoho', aliases: ['zoho corporation', 'zoho corp', 'zoho technologies'], domain: 'zoho.com', alternateDomains: [], industry: 'Enterprise Software', country: 'India', companyType: 'MNC' },
  { name: 'Freshworks', shortName: 'Freshworks', aliases: ['freshworks inc', 'freshworks software', 'fresh desk'], domain: 'freshworks.com', alternateDomains: [], industry: 'Enterprise Software', country: 'India', companyType: 'MNC' },
  { name: 'SAP', shortName: 'SAP', aliases: ['sap se', 'sap india', 'sap labs'], domain: 'sap.com', alternateDomains: [], industry: 'Enterprise Software', country: 'Global', companyType: 'MNC' },
  { name: 'Salesforce', shortName: 'Salesforce', aliases: ['salesforce inc', 'salesforce.com', 'trailblazer'], domain: 'salesforce.com', alternateDomains: [], industry: 'CRM Software', country: 'Global', companyType: 'MNC' },
  { name: 'ServiceNow', shortName: 'ServiceNow', aliases: ['servicenow inc'], domain: 'servicenow.com', alternateDomains: [], industry: 'IT Service Management', country: 'Global', companyType: 'MNC' },
  { name: 'Workday', shortName: 'Workday', aliases: ['workday inc'], domain: 'workday.com', alternateDomains: [], industry: 'Enterprise Software', country: 'Global', companyType: 'MNC' },
  { name: 'Zendesk', shortName: 'Zendesk', aliases: ['zendesk inc'], domain: 'zendesk.com', alternateDomains: [], industry: 'SaaS', country: 'Global', companyType: 'MNC' },
  { name: 'HubSpot', shortName: 'HubSpot', aliases: ['hubspot inc'], domain: 'hubspot.com', alternateDomains: [], industry: 'SaaS / Marketing', country: 'Global', companyType: 'MNC' },
  { name: 'Atlassian', shortName: 'Atlassian', aliases: ['atlassian pty', 'jira', 'confluence'], domain: 'atlassian.com', alternateDomains: [], industry: 'Developer Tools / SaaS', country: 'Global', companyType: 'MNC' },
  { name: 'GitLab', shortName: 'GitLab', aliases: ['gitlab inc'], domain: 'gitlab.com', alternateDomains: [], industry: 'Developer Tools', country: 'Global', companyType: 'MNC' },
  { name: 'GitHub', shortName: 'GitHub', aliases: ['github inc', 'github technologies'], domain: 'github.com', alternateDomains: [], industry: 'Developer Tools', country: 'Global', companyType: 'MNC' },
  { name: 'Palantir', shortName: 'Palantir', aliases: ['palantir technologies'], domain: 'palantir.com', alternateDomains: [], industry: 'Data Analytics / AI', country: 'Global', companyType: 'MNC' },
  { name: 'Datadog', shortName: 'Datadog', aliases: ['datadog inc'], domain: 'datadoghq.com', alternateDomains: [], industry: 'Cloud Monitoring', country: 'Global', companyType: 'MNC' },
  { name: 'Snowflake', shortName: 'Snowflake', aliases: ['snowflake inc'], domain: 'snowflake.com', alternateDomains: [], industry: 'Data Cloud', country: 'Global', companyType: 'MNC' },
  { name: 'MongoDB', shortName: 'MongoDB', aliases: ['mongodb inc', 'mongo'], domain: 'mongodb.com', alternateDomains: [], industry: 'Database Software', country: 'Global', companyType: 'MNC' },
  { name: 'Elastic', shortName: 'Elastic', aliases: ['elastic co', 'elasticsearch'], domain: 'elastic.co', alternateDomains: [], industry: 'Enterprise Search', country: 'Global', companyType: 'MNC' },
  { name: 'HashiCorp', shortName: 'HashiCorp', aliases: ['hashicorp inc', 'terraform'], domain: 'hashicorp.com', alternateDomains: [], industry: 'Cloud Infrastructure', country: 'Global', companyType: 'MNC' },
  { name: 'Cloudflare', shortName: 'Cloudflare', aliases: ['cloudflare inc'], domain: 'cloudflare.com', alternateDomains: [], industry: 'Web Infrastructure', country: 'Global', companyType: 'MNC' },
  { name: 'Twilio', shortName: 'Twilio', aliases: ['twilio inc'], domain: 'twilio.com', alternateDomains: [], industry: 'Communications API', country: 'Global', companyType: 'MNC' },
  { name: 'Intuit', shortName: 'Intuit', aliases: ['intuit inc', 'quickbooks', 'turbotax'], domain: 'intuit.com', alternateDomains: ['intuit.in'], industry: 'Fintech / SMB Software', country: 'Global', companyType: 'MNC' },
  { name: 'Adobe', shortName: 'Adobe', aliases: ['adobe systems', 'adobe inc'], domain: 'adobe.com', alternateDomains: [], industry: 'Software / Creative', country: 'Global', companyType: 'MNC' },
  { name: 'Autodesk', shortName: 'Autodesk', aliases: ['autodesk inc'], domain: 'autodesk.com', alternateDomains: [], industry: 'Design Software', country: 'Global', companyType: 'MNC' },
  { name: 'Cisco', shortName: 'Cisco', aliases: ['cisco systems', 'ciscosystems', 'cisco india'], domain: 'cisco.com', alternateDomains: [], industry: 'Technology / Networking', country: 'Global', companyType: 'MNC' },
  { name: 'NetApp', shortName: 'NetApp', aliases: ['netapp inc'], domain: 'netapp.com', alternateDomains: [], industry: 'Data Storage', country: 'Global', companyType: 'MNC' },
  { name: 'VMware', shortName: 'VMware', aliases: ['vmware inc', 'broadcom software'], domain: 'vmware.com', alternateDomains: [], industry: 'Virtualization', country: 'Global', companyType: 'MNC' },
  { name: 'Red Hat', shortName: 'Red Hat', aliases: ['red hat inc', 'redhat'], domain: 'redhat.com', alternateDomains: [], industry: 'Open Source Software', country: 'Global', companyType: 'MNC' },
  { name: 'Splunk', shortName: 'Splunk', aliases: ['splunk inc'], domain: 'splunk.com', alternateDomains: [], industry: 'Data / Observability', country: 'Global', companyType: 'MNC' },
  { name: 'Veeva Systems', shortName: 'Veeva', aliases: ['veeva', 'veeva systems'], domain: 'veeva.com', alternateDomains: [], industry: 'Life Sciences Software', country: 'Global', companyType: 'MNC' },
  { name: 'Okta', shortName: 'Okta', aliases: ['okta inc'], domain: 'okta.com', alternateDomains: [], industry: 'Identity Management', country: 'Global', companyType: 'MNC' },
  { name: 'Stripe', shortName: 'Stripe', aliases: ['stripe inc'], domain: 'stripe.com', alternateDomains: [], industry: 'Fintech / Payments', country: 'Global', companyType: 'MNC' },
  { name: 'Square / Block', shortName: 'Block', aliases: ['block inc', 'square inc', 'cash app'], domain: 'block.xyz', alternateDomains: ['squareup.com'], industry: 'Fintech', country: 'Global', companyType: 'MNC' },
  { name: 'Shopify', shortName: 'Shopify', aliases: ['shopify inc'], domain: 'shopify.com', alternateDomains: [], industry: 'E-commerce SaaS', country: 'Global', companyType: 'MNC' },
  { name: 'Wix', shortName: 'Wix', aliases: ['wix.com', 'wix ltd'], domain: 'wix.com', alternateDomains: [], industry: 'Website Builder', country: 'Global', companyType: 'MNC' },

  /* ------------------------------ Consumer Tech / Internet ------------------------------ */
  { name: 'Apple', shortName: 'Apple', aliases: ['apple inc', 'apple india'], domain: 'apple.com', alternateDomains: [], industry: 'Consumer Electronics', country: 'Global', companyType: 'MNC' },
  { name: 'Meta', shortName: 'Meta', aliases: ['meta platforms', 'facebook', 'facebook inc', 'instagram', 'whatsapp'], domain: 'meta.com', alternateDomains: ['facebook.com', 'fb.com'], industry: 'Social Media', country: 'Global', companyType: 'MNC' },
  { name: 'Netflix', shortName: 'Netflix', aliases: ['netflix inc'], domain: 'netflix.com', alternateDomains: [], industry: 'Streaming', country: 'Global', companyType: 'MNC' },
  { name: 'Tesla', shortName: 'Tesla', aliases: ['tesla inc', 'tesla motors'], domain: 'tesla.com', alternateDomains: [], industry: 'Automotive / Energy', country: 'Global', companyType: 'MNC' },
  { name: 'Uber', shortName: 'Uber', aliases: ['uber technologies', 'uber india'], domain: 'uber.com', alternateDomains: [], industry: 'Ride Hailing / Logistics', country: 'Global', companyType: 'MNC' },
  { name: 'Airbnb', shortName: 'Airbnb', aliases: ['airbnb inc'], domain: 'airbnb.com', alternateDomains: [], industry: 'Travel / Hospitality', country: 'Global', companyType: 'MNC' },
  { name: 'LinkedIn', shortName: 'LinkedIn', aliases: ['linkedin corporation', 'linkedin india'], domain: 'linkedin.com', alternateDomains: [], industry: 'Social Media / Professional', country: 'Global', companyType: 'MNC' },
  { name: 'X', shortName: 'X', aliases: ['twitter', 'twitter inc', 'x corp'], domain: 'x.com', alternateDomains: ['twitter.com', 'twimg.com'], industry: 'Social Media', country: 'Global', companyType: 'MNC' },
  { name: 'Snap', shortName: 'Snap', aliases: ['snap inc', 'snapchat'], domain: 'snap.com', alternateDomains: ['snapchat.com'], industry: 'Social Media', country: 'Global', companyType: 'MNC' },
  { name: 'Pinterest', shortName: 'Pinterest', aliases: ['pinterest inc'], domain: 'pinterest.com', alternateDomains: [], industry: 'Social Media', country: 'Global', companyType: 'MNC' },
  { name: 'TikTok / ByteDance', shortName: 'ByteDance', aliases: ['tiktok', 'bytedance inc'], domain: 'bytedance.com', alternateDomains: ['tiktok.com'], industry: 'Social Media', country: 'Global', companyType: 'MNC' },
  { name: 'Spotify', shortName: 'Spotify', aliases: ['spotify ab', 'spotify technology'], domain: 'spotify.com', alternateDomains: [], industry: 'Streaming / Audio', country: 'Global', companyType: 'MNC' },
  { name: 'Zoom', shortName: 'Zoom', aliases: ['zoom video communications', 'zoom communications'], domain: 'zoom.us', alternateDomains: ['zoom.com'], industry: 'Video Conferencing', country: 'Global', companyType: 'MNC' },
  { name: 'Slack', shortName: 'Slack', aliases: ['slack technologies', 'salesforce slack'], domain: 'slack.com', alternateDomains: [], industry: 'Team Collaboration', country: 'Global', companyType: 'MNC' },
  { name: 'Roblox', shortName: 'Roblox', aliases: ['roblox corporation'], domain: 'roblox.com', alternateDomains: [], industry: 'Gaming / Metaverse', country: 'Global', companyType: 'MNC' },
  { name: 'Epic Games', shortName: 'Epic Games', aliases: ['epicgames', 'epic games inc', 'fortnite'], domain: 'epicgames.com', alternateDomains: [], industry: 'Gaming', country: 'Global', companyType: 'MNC' },
  { name: 'Riot Games', shortName: 'Riot Games', aliases: ['riotgames', 'riot games inc'], domain: 'riotgames.com', alternateDomains: [], industry: 'Gaming', country: 'Global', companyType: 'MNC' },
  { name: 'Electronic Arts', shortName: 'EA', aliases: ['electronic arts inc', 'ea games'], domain: 'ea.com', alternateDomains: [], industry: 'Gaming', country: 'Global', companyType: 'MNC' },
  { name: 'NVIDIA', shortName: 'NVIDIA', aliases: ['nvidia corporation', 'nvidia india'], domain: 'nvidia.com', alternateDomains: [], industry: 'Semiconductors / AI', country: 'Global', companyType: 'MNC' },
  { name: 'AMD', shortName: 'AMD', aliases: ['advanced micro devices', 'amd india'], domain: 'amd.com', alternateDomains: [], industry: 'Semiconductors', country: 'Global', companyType: 'MNC' },
  { name: 'Intel', shortName: 'Intel', aliases: ['intel corporation', 'intel corp', 'intel india'], domain: 'intel.com', alternateDomains: [], industry: 'Semiconductors', country: 'Global', companyType: 'MNC' },
  { name: 'Qualcomm', shortName: 'Qualcomm', aliases: ['qualcomm inc', 'qualcomm india'], domain: 'qualcomm.com', alternateDomains: [], industry: 'Semiconductors', country: 'Global', companyType: 'MNC' },
  { name: 'Broadcom', shortName: 'Broadcom', aliases: ['broadcom inc', 'broadcom corporation'], domain: 'broadcom.com', alternateDomains: [], industry: 'Semiconductors', country: 'Global', companyType: 'MNC' },
  { name: 'Micron', shortName: 'Micron', aliases: ['micron technology', 'micron technologies'], domain: 'micron.com', alternateDomains: [], industry: 'Semiconductors / Memory', country: 'Global', companyType: 'MNC' },
  { name: 'Texas Instruments', shortName: 'TI', aliases: ['texas instruments inc', 'ti india'], domain: 'ti.com', alternateDomains: [], industry: 'Semiconductors', country: 'Global', companyType: 'MNC' },
  { name: 'Dell', shortName: 'Dell', aliases: ['dell technologies', 'dell india'], domain: 'dell.com', alternateDomains: [], industry: 'Technology / Hardware', country: 'Global', companyType: 'MNC' },
  { name: 'HP', shortName: 'HP', aliases: ['hewlett packard', 'hp inc', 'hp india'], domain: 'hp.com', alternateDomains: [], industry: 'Technology / Hardware', country: 'Global', companyType: 'MNC' },
  { name: 'HPE', shortName: 'HPE', aliases: ['hewlett packard enterprise', 'hpe india'], domain: 'hpe.com', alternateDomains: [], industry: 'Enterprise IT', country: 'Global', companyType: 'MNC' },
  { name: 'Lenovo', shortName: 'Lenovo', aliases: ['lenovo group', 'lenovo india'], domain: 'lenovo.com', alternateDomains: [], industry: 'Technology / Hardware', country: 'Global', companyType: 'MNC' },
  { name: 'ASUS', shortName: 'ASUS', aliases: ['asus tek computer', 'asus india'], domain: 'asus.com', alternateDomains: [], industry: 'Consumer Electronics', country: 'Taiwan', companyType: 'MNC' },
  { name: 'Xiaomi', shortName: 'Xiaomi', aliases: ['xiaomi india', 'xiaomi corporation'], domain: 'xiaomi.com', alternateDomains: ['mi.com', 'xiaomistore.com'], industry: 'Consumer Electronics', country: 'China', companyType: 'MNC' },
  { name: 'Samsung', shortName: 'Samsung', aliases: ['samsung electronics', 'samsung india'], domain: 'samsung.com', alternateDomains: ['samsungindia.com'], industry: 'Consumer Electronics', country: 'South Korea', companyType: 'MNC' },
  { name: 'LG', shortName: 'LG', aliases: ['lg electronics', 'lg india'], domain: 'lg.com', alternateDomains: [], industry: 'Consumer Electronics', country: 'South Korea', companyType: 'MNC' },
  { name: 'Sony', shortName: 'Sony', aliases: ['sony corporation', 'sony india'], domain: 'sony.com', alternateDomains: [], industry: 'Consumer Electronics / Media', country: 'Japan', companyType: 'MNC' },
  { name: 'Panasonic', shortName: 'Panasonic', aliases: ['panasonic corporation', 'panasonic india'], domain: 'panasonic.com', alternateDomains: [], industry: 'Consumer Electronics', country: 'Japan', companyType: 'MNC' },

  /* ------------------------------ E-commerce / Indian Consumer ------------------------------ */
  { name: 'Walmart Global Tech', shortName: 'Walmart', aliases: ['walmart global technology', 'walmart', 'wal mart global tech'], domain: 'walmartglobaltech.com', alternateDomains: ['walmart.com', 'careers.walmart.com'], industry: 'Retail / Technology', country: 'Global', companyType: 'MNC' },
  { name: 'Flipkart', shortName: 'Flipkart', aliases: ['flipkart internet', 'flipkart private limited', 'flipkart india'], domain: 'flipkart.com', alternateDomains: ['flipkartcareers.com'], industry: 'E-commerce', country: 'India', companyType: 'MNC' },
  { name: 'Meesho', shortName: 'Meesho', aliases: ['meesho inc', 'meesho technologies'], domain: 'meesho.com', alternateDomains: [], industry: 'E-commerce', country: 'India', companyType: 'MNC' },
  { name: 'Zomato', shortName: 'Zomato', aliases: ['zomato limited', 'zomato media', 'zomato india'], domain: 'zomato.com', alternateDomains: [], industry: 'Food Delivery', country: 'India', companyType: 'MNC' },
  { name: 'Swiggy', shortName: 'Swiggy', aliases: ['bundl technologies', 'swiggy india'], domain: 'swiggy.com', alternateDomains: [], industry: 'Food Delivery', country: 'India', companyType: 'MNC' },
  { name: 'Nykaa', shortName: 'Nykaa', aliases: ['fsnl', 'nykaa fashion', 'nykaa e-retail'], domain: 'nykaa.com', alternateDomains: [], industry: 'Beauty / E-commerce', country: 'India', companyType: 'MNC' },
  { name: 'MakeMyTrip', shortName: 'MMT', aliases: ['makemytrip india', 'mmt'], domain: 'makemytrip.com', alternateDomains: [], industry: 'Travel', country: 'India', companyType: 'MNC' },
  { name: 'OYO', shortName: 'OYO', aliases: ['oyo rooms', 'oyo india'], domain: 'oyorooms.com', alternateDomains: ['oyo.com'], industry: 'Hospitality', country: 'India', companyType: 'MNC' },
  { name: 'Urban Company', shortName: 'Urban Company', aliases: ['urbanclap', 'urban company india'], domain: 'urbandcompany.com', alternateDomains: [], industry: 'Home Services', country: 'India', companyType: 'MNC' },
  { name: 'BigBasket', shortName: 'BigBasket', aliases: ['big basket', 'supermarket groceries', 'bb'], domain: 'bigbasket.com', alternateDomains: [], industry: 'E-commerce / Grocery', country: 'India', companyType: 'MNC' },
  { name: 'Udaan', shortName: 'Udaan', aliases: ['udaan b2b'], domain: 'udaan.com', alternateDomains: [], industry: 'B2B Commerce', country: 'India', companyType: 'Startup' },
  { name: 'Razorpay', shortName: 'Razorpay', aliases: ['razorpay software'], domain: 'razorpay.com', alternateDomains: [], industry: 'Fintech / Payments', country: 'India', companyType: 'MNC' },
  { name: 'Paytm', shortName: 'Paytm', aliases: ['one97 communications', 'paytm india'], domain: 'paytm.com', alternateDomains: [], industry: 'Fintech / Payments', country: 'India', companyType: 'MNC' },
  { name: 'PhonePe', shortName: 'PhonePe', aliases: ['phonepe private limited', 'phone pe'], domain: 'phonepe.com', alternateDomains: [], industry: 'Fintech / Payments', country: 'India', companyType: 'MNC' },
  { name: 'BharatPe', shortName: 'BharatPe', aliases: ['bharatpe india'], domain: 'bharatpe.com', alternateDomains: [], industry: 'Fintech / Payments', country: 'India', companyType: 'MNC' },
  { name: 'Cred', shortName: 'CRED', aliases: ['dreamplug', 'cred india'], domain: 'cred.club', alternateDomains: ['credapp.io'], industry: 'Fintech', country: 'India', companyType: 'Startup' },
  { name: 'Groww', shortName: 'Groww', aliases: ['groww india', 'groww invest'], domain: 'groww.in', alternateDomains: ['groww.com'], industry: 'Fintech / Investing', country: 'India', companyType: 'Startup' },
  { name: 'Zerodha', shortName: 'Zerodha', aliases: ['zerodha broking', 'zerodha india'], domain: 'zerodha.com', alternateDomains: [], industry: 'Fintech / Brokerage', country: 'India', companyType: 'MNC' },
  { name: 'PolicyBazaar', shortName: 'PolicyBazaar', aliases: ['policy bazaar', 'etechaces'], domain: 'policybazaar.com', alternateDomains: [], industry: 'Insurtech', country: 'India', companyType: 'MNC' },

  /* ------------------------------ Financial Services / Banks ------------------------------ */
  { name: 'JPMorgan Chase', shortName: 'JPMorgan Chase', aliases: ['jpmorgan', 'jpmc', 'jp morgan chase', 'jpmorgan chase co'], domain: 'jpmorganchase.com', alternateDomains: ['jpmc.com'], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'Goldman Sachs', shortName: 'Goldman Sachs', aliases: ['goldman sachs group', 'goldman'], domain: 'goldmansachs.com', alternateDomains: [], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'Morgan Stanley', shortName: 'Morgan Stanley', aliases: ['morgan stanley india'], domain: 'morganstanley.com', alternateDomains: [], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'Bank of America', shortName: 'BofA', aliases: ['bofa', 'bank of america corp', 'merrill'], domain: 'bankofamerica.com', alternateDomains: [], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'Citibank', shortName: 'Citi', aliases: ['citigroup', 'citi india', 'citibank india'], domain: 'citi.com', alternateDomains: ['citibank.co.in'], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'Wells Fargo', shortName: 'Wells Fargo', aliases: ['wells fargo bank'], domain: 'wellsfargo.com', alternateDomains: [], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'American Express', shortName: 'Amex', aliases: ['american express india', 'amex'], domain: 'americanexpress.com', alternateDomains: [], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'Visa', shortName: 'Visa', aliases: ['visa inc', 'visa india'], domain: 'visa.com', alternateDomains: [], industry: 'Payments', country: 'Global', companyType: 'MNC' },
  { name: 'Mastercard', shortName: 'Mastercard', aliases: ['master card', 'mastercard india'], domain: 'mastercard.com', alternateDomains: [], industry: 'Payments', country: 'Global', companyType: 'MNC' },
  { name: 'Capital One', shortName: 'Capital One', aliases: ['capital one financial'], domain: 'capitalone.com', alternateDomains: [], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'Barclays', shortName: 'Barclays', aliases: ['barclays india', 'barclays bank'], domain: 'barclays.com', alternateDomains: ['barclays.lk'], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'HSBC', shortName: 'HSBC', aliases: ['hsbc india', 'hsbc bank'], domain: 'hsbc.com', alternateDomains: ['hsbc.co.in'], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'Standard Chartered', shortName: 'Standard Chartered', aliases: ['standard chartered bank', 'scb'], domain: 'sc.com', alternateDomains: [], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'UBS', shortName: 'UBS', aliases: ['ubs group', 'ubs india'], domain: 'ubs.com', alternateDomains: [], industry: 'Financial Services', country: 'Global', companyType: 'MNC' },
  { name: 'State Bank of India', shortName: 'SBI', aliases: ['state bank of india', 'sbi bank', 'sbi'], domain: 'sbi.co.in', alternateDomains: ['bank.sbi'], industry: 'Banking', country: 'India', companyType: 'MNC' },
  { name: 'HDFC Bank', shortName: 'HDFC Bank', aliases: ['hdfc', 'hdfc bank ltd'], domain: 'hdfcbank.com', alternateDomains: [], industry: 'Banking', country: 'India', companyType: 'MNC' },
  { name: 'ICICI Bank', shortName: 'ICICI', aliases: ['icici bank limited', 'icici'], domain: 'icicibank.com', alternateDomains: [], industry: 'Banking', country: 'India', companyType: 'MNC' },
  { name: 'Axis Bank', shortName: 'Axis Bank', aliases: ['axis bank limited', 'axis'], domain: 'axisbank.com', alternateDomains: [], industry: 'Banking', country: 'India', companyType: 'MNC' },
  { name: 'Kotak Mahindra Bank', shortName: 'Kotak', aliases: ['kotak bank', 'kotak mahindra'], domain: 'kotak.com', alternateDomains: ['kotakbank.com'], industry: 'Banking', country: 'India', companyType: 'MNC' },
  { name: 'Punjab National Bank', shortName: 'PNB', aliases: ['pnb', 'punjab national bank'], domain: 'pnbindia.in', alternateDomains: [], industry: 'Banking', country: 'India', companyType: 'MNC' },
  { name: 'Bank of Baroda', shortName: 'BOB', aliases: ['bank of baroda', 'bob'], domain: 'bankofbaroda.com', alternateDomains: [], industry: 'Banking', country: 'India', companyType: 'MNC' },
  { name: 'Canara Bank', shortName: 'Canara Bank', aliases: ['canara bank'], domain: 'canarabank.com', alternateDomains: [], industry: 'Banking', country: 'India', companyType: 'MNC' },

  /* ------------------------------ Telecom / Connectivity ------------------------------ */
  { name: 'Reliance Jio', shortName: 'Jio', aliases: ['reliance jio infocomm', 'jio', 'jio infocomm'], domain: 'jio.com', alternateDomains: ['ril.com', 'reliancegroup.com'], industry: 'Telecom', country: 'India', companyType: 'MNC' },
  { name: 'Bharti Airtel', shortName: 'Airtel', aliases: ['airtel', 'bharti airtel limited', 'airtel india'], domain: 'airtel.in', alternateDomains: ['airtel.com'], industry: 'Telecom', country: 'India', companyType: 'MNC' },
  { name: 'Vi (Vodafone Idea)', shortName: 'Vi', aliases: ['vodafone idea', 'vodafone idea limited', 'vi india'], domain: 'vi.com', alternateDomains: ['vodafoneidea.com'], industry: 'Telecom', country: 'India', companyType: 'MNC' },
  { name: 'BSNL', shortName: 'BSNL', aliases: ['bharat sanchar nigam limited', 'bsnl india'], domain: 'bsnl.co.in', alternateDomains: [], industry: 'Telecom', country: 'India', companyType: 'MNC' },
  { name: 'Vodafone', shortName: 'Vodafone', aliases: ['vodafone group', 'vodafone india'], domain: 'vodafone.com', alternateDomains: [], industry: 'Telecom', country: 'Global', companyType: 'MNC' },
  { name: 'Tata Communications Mobile', shortName: 'Tata Play', aliases: ['tata sky', 'tata play'], domain: 'tatasky.com', alternateDomains: [], industry: 'Broadcasting / DTH', country: 'India', companyType: 'MNC' },
  { name: 'AT&T', shortName: 'AT&T', aliases: ['att', 'att inc', 'at and t'], domain: 'att.com', alternateDomains: [], industry: 'Telecom', country: 'Global', companyType: 'MNC' },
  { name: 'Verizon', shortName: 'Verizon', aliases: ['verizon communications', 'verizon india'], domain: 'verizon.com', alternateDomains: [], industry: 'Telecom', country: 'Global', companyType: 'MNC' },
  { name: 'T-Mobile', shortName: 'T-Mobile', aliases: ['t mobile', 't-mobile us'], domain: 't-mobile.com', alternateDomains: [], industry: 'Telecom', country: 'Global', companyType: 'MNC' },
  { name: 'Comcast', shortName: 'Comcast', aliases: ['comcast corporation', 'nbcuniversal'], domain: 'comcast.com', alternateDomains: [], industry: 'Telecom / Media', country: 'Global', companyType: 'MNC' },

  /* ------------------------------ Automotive ------------------------------ */
  { name: 'Tata Motors', shortName: 'Tata Motors', aliases: ['tata motors limited', 'tata motors'], domain: 'tatamotors.com', alternateDomains: [], industry: 'Automotive', country: 'India', companyType: 'MNC' },
  { name: 'Mahindra & Mahindra', shortName: 'Mahindra', aliases: ['mahindra', 'mahindra group', 'm&m'], domain: 'mahindra.com', alternateDomains: [], industry: 'Automotive / Conglomerate', country: 'India', companyType: 'MNC' },
  { name: 'Maruti Suzuki', shortName: 'Maruti', aliases: ['maruti suzuki india', 'maruti'], domain: 'maruti.co.in', alternateDomains: ['marutisuzuki.com'], industry: 'Automotive', country: 'India', companyType: 'MNC' },
  { name: 'Toyota', shortName: 'Toyota', aliases: ['toyota motor', 'toyota india', 'toyota kirloskar'], domain: 'toyota.com', alternateDomains: ['toyotabharat.com', 'global.toyota'], industry: 'Automotive', country: 'Japan', companyType: 'MNC' },
  { name: 'Honda', shortName: 'Honda', aliases: ['honda motor', 'honda india'], domain: 'honda.com', alternateDomains: ['hondacarindia.com'], industry: 'Automotive', country: 'Japan', companyType: 'MNC' },
  { name: 'Hyundai', shortName: 'Hyundai', aliases: ['hyundai motor', 'hyundai india'], domain: 'hyundai.com', alternateDomains: ['hyundai.co.in'], industry: 'Automotive', country: 'South Korea', companyType: 'MNC' },
  { name: 'Ford', shortName: 'Ford', aliases: ['ford motor company', 'ford india'], domain: 'ford.com', alternateDomains: ['fordcareers.com'], industry: 'Automotive', country: 'Global', companyType: 'MNC' },
  { name: 'General Motors', shortName: 'GM', aliases: ['general motors', 'gm', 'chevrolet'], domain: 'gm.com', alternateDomains: [], industry: 'Automotive', country: 'Global', companyType: 'MNC' },
  { name: 'BMW', shortName: 'BMW', aliases: ['bmw group', 'bmw india'], domain: 'bmw.com', alternateDomains: ['bmwgroup.com'], industry: 'Automotive', country: 'Germany', companyType: 'MNC' },
  { name: 'Mercedes-Benz', shortName: 'Mercedes', aliases: ['mercedes benz india', 'daimler'], domain: 'mercedes-benz.com', alternateDomains: [], industry: 'Automotive', country: 'Germany', companyType: 'MNC' },
  { name: 'Volkswagen', shortName: 'Volkswagen', aliases: ['volkswagen group', 'vw', 'volkswagen india'], domain: 'volkswagen.com', alternateDomains: ['volkswagenindia.com'], industry: 'Automotive', country: 'Germany', companyType: 'MNC' },
  { name: 'Audi', shortName: 'Audi', aliases: ['audi group', 'audi india'], domain: 'audi.com', alternateDomains: ['audi.in'], industry: 'Automotive', country: 'Germany', companyType: 'MNC' },
  { name: 'Porsche', shortName: 'Porsche', aliases: ['porsche ag'], domain: 'porsche.com', alternateDomains: [], industry: 'Automotive', country: 'Germany', companyType: 'MNC' },
  { name: 'Renault-Nissan', shortName: 'Renault', aliases: ['renault india', 'nissan motor india', 'nissan', 'renault nissan'], domain: 'renault.com', alternateDomains: ['nissan.co.in', 'nissanusa.com'], industry: 'Automotive', country: 'Global', companyType: 'MNC' },
  { name: 'Kia', shortName: 'Kia', aliases: ['kia motors', 'kia india'], domain: 'kia.com', alternateDomains: ['kia.co.in', 'kia.com'], industry: 'Automotive', country: 'South Korea', companyType: 'MNC' },
  { name: 'Harley-Davidson', shortName: 'Harley', aliases: ['harley davidson', 'harley'], domain: 'harley-davidson.com', alternateDomains: [], industry: 'Automotive / Motorcycles', country: 'Global', companyType: 'MNC' },
  { name: 'Bosch', shortName: 'Bosch', aliases: ['bosch limited', 'bosch india', 'robert bosch'], domain: 'bosch.com', alternateDomains: ['bosch.in'], industry: 'Engineering / Auto Components', country: 'Germany', companyType: 'MNC' },
  { name: 'Cummins', shortName: 'Cummins', aliases: ['cummins india', 'cummins inc'], domain: 'cummins.com', alternateDomains: ['cumminsindia.com'], industry: 'Industrial Engines', country: 'Global', companyType: 'MNC' },
  { name: 'Caterpillar', shortName: 'Caterpillar', aliases: ['cat', 'caterpillar inc'], domain: 'caterpillar.com', alternateDomains: [], industry: 'Heavy Machinery', country: 'Global', companyType: 'MNC' },
  { name: '3M', shortName: '3M', aliases: ['3m company', '3m india'], domain: '3m.com', alternateDomains: [], industry: 'Conglomerate / Manufacturing', country: 'Global', companyType: 'MNC' },
  { name: 'Siemens', shortName: 'Siemens', aliases: ['siemens ltd', 'siemens india', 'siemens ag'], domain: 'siemens.com', alternateDomains: ['siemens.co.in'], industry: 'Engineering / Technology', country: 'Germany', companyType: 'MNC' },
  { name: 'Schneider Electric', shortName: 'Schneider', aliases: ['schneider electric india', 'se india'], domain: 'se.com', alternateDomains: ['schneider-electric.com'], industry: 'Energy Management', country: 'Global', companyType: 'MNC' },
  { name: 'ABB', shortName: 'ABB', aliases: ['abb india', 'abb group'], domain: 'abb.com', alternateDomains: ['abb.co.in'], industry: 'Industrial Automation', country: 'Global', companyType: 'MNC' },
  { name: 'Honeywell', shortName: 'Honeywell', aliases: ['honeywell india', 'honeywell international'], domain: 'honeywell.com', alternateDomains: [], industry: 'Industrial / Aerospace', country: 'Global', companyType: 'MNC' },
  { name: 'GE', shortName: 'GE', aliases: ['general electric', 'ge india', 'general electric company'], domain: 'ge.com', alternateDomains: [], industry: 'Industrial / Aviation', country: 'Global', companyType: 'MNC' },
  { name: 'Dyson', shortName: 'Dyson', aliases: ['dyson ltd'], domain: 'dyson.com', alternateDomains: ['dyson.in'], industry: 'Consumer Appliances', country: 'Global', companyType: 'MNC' },

  /* ------------------------------ Pharma / Healthcare ------------------------------ */
  { name: 'Pfizer', shortName: 'Pfizer', aliases: ['pfizer india', 'pfizer ltd'], domain: 'pfizer.com', alternateDomains: ['pfizerindia.com'], industry: 'Pharmaceuticals', country: 'Global', companyType: 'MNC' },
  { name: 'Johnson & Johnson', shortName: 'J&J', aliases: ['johnson and johnson', 'jj', 'jnj'], domain: 'jnj.com', alternateDomains: [], industry: 'Pharmaceuticals / Healthcare', country: 'Global', companyType: 'MNC' },
  { name: 'Novartis', shortName: 'Novartis', aliases: ['novartis india'], domain: 'novartis.com', alternateDomains: ['novartisindia.com'], industry: 'Pharmaceuticals', country: 'Global', companyType: 'MNC' },
  { name: 'Roche', shortName: 'Roche', aliases: ['roche india'], domain: 'roche.com', alternateDomains: [], industry: 'Pharmaceuticals', country: 'Global', companyType: 'MNC' },
  { name: 'Merck', shortName: 'Merck', aliases: ['merck sharp dohme', 'msd', 'merck india'], domain: 'merck.com', alternateDomains: ['msd.com'], industry: 'Pharmaceuticals', country: 'Global', companyType: 'MNC' },
  { name: 'GlaxoSmithKline', shortName: 'GSK', aliases: ['gsk', 'glaxosmithkline pharmaceuticals'], domain: 'gsk.com', alternateDomains: ['gskindia.com'], industry: 'Pharmaceuticals', country: 'Global', companyType: 'MNC' },
  { name: 'AstraZeneca', shortName: 'AstraZeneca', aliases: ['astra zeneca', 'astrazeneca india'], domain: 'astrazeneca.com', alternateDomains: [], industry: 'Pharmaceuticals', country: 'Global', companyType: 'MNC' },
  { name: 'Sanofi', shortName: 'Sanofi', aliases: ['sanofi india'], domain: 'sanofi.com', alternateDomains: ['sanofi.in'], industry: 'Pharmaceuticals', country: 'Global', companyType: 'MNC' },
  { name: 'Abbott', shortName: 'Abbott', aliases: ['abbott india', 'abbott laboratories'], domain: 'abbott.com', alternateDomains: [], industry: 'Healthcare / Nutrition', country: 'Global', companyType: 'MNC' },
  { name: 'Cipla', shortName: 'Cipla', aliases: ['cipla limited'], domain: 'cipla.com', alternateDomains: [], industry: 'Pharmaceuticals', country: 'India', companyType: 'MNC' },
  { name: 'Sun Pharma', shortName: 'Sun Pharma', aliases: ['sun pharmaceutical', 'sunpharma'], domain: 'sunpharma.com', alternateDomains: [], industry: 'Pharmaceuticals', country: 'India', companyType: 'MNC' },
  { name: 'Dr. Reddy’s', shortName: 'Dr. Reddy’s', aliases: ['dr reddys', 'dr reddy laboratories', 'reddys'], domain: 'drreddys.com', alternateDomains: [], industry: 'Pharmaceuticals', country: 'India', companyType: 'MNC' },
  { name: 'Lupin', shortName: 'Lupin', aliases: ['lupin limited'], domain: 'lupin.com', alternateDomains: [], industry: 'Pharmaceuticals', country: 'India', companyType: 'MNC' },
  { name: 'Biocon', shortName: 'Biocon', aliases: ['biocon limited'], domain: 'biocon.com', alternateDomains: [], industry: 'Biotech / Pharma', country: 'India', companyType: 'MNC' },
  { name: 'Apollo Hospitals', shortName: 'Apollo', aliases: ['apollo hospitals enterprise', 'apollo hitech'], domain: 'apollohospitals.com', alternateDomains: [], industry: 'Healthcare', country: 'India', companyType: 'MNC' },
  { name: 'Fortis Healthcare', shortName: 'Fortis', aliases: ['fortis'], domain: 'fortishealthcare.com', alternateDomains: [], industry: 'Healthcare', country: 'India', companyType: 'MNC' },
  { name: 'Max Healthcare', shortName: 'Max', aliases: ['max healthcare', 'max hospitals'], domain: 'maxhealthcare.com', alternateDomains: [], industry: 'Healthcare', country: 'India', companyType: 'MNC' },

  /* ------------------------------ Airlines / Travel ------------------------------ */
  { name: 'IndiGo', shortName: 'IndiGo', aliases: ['indigo airlines', 'interglobe aviation', 'indigo'], domain: 'goindigo.in', alternateDomains: ['indigousa.com'], industry: 'Airlines', country: 'India', companyType: 'MNC' },
  { name: 'Air India', shortName: 'Air India', aliases: ['airindia', 'air india limited'], domain: 'airindia.com', alternateDomains: ['airindia.in'], industry: 'Airlines', country: 'India', companyType: 'MNC' },
  { name: 'Vistara', shortName: 'Vistara', aliases: ['vistara airlines', 'tata seng airventures'], domain: 'vistara.com', alternateDomains: [], industry: 'Airlines', country: 'India', companyType: 'MNC' },
  { name: 'SpiceJet', shortName: 'SpiceJet', aliases: ['spicejet airlines', 'spice jet'], domain: 'spicejet.com', alternateDomains: [], industry: 'Airlines', country: 'India', companyType: 'MNC' },
  { name: 'Emirates', shortName: 'Emirates', aliases: ['emirates airline', 'emirates group'], domain: 'emirates.com', alternateDomains: [], industry: 'Airlines', country: 'UAE', companyType: 'MNC' },
  { name: 'Lufthansa', shortName: 'Lufthansa', aliases: ['lufthansa group', 'lufthansa airlines'], domain: 'lufthansa.com', alternateDomains: [], industry: 'Airlines', country: 'Germany', companyType: 'MNC' },
  { name: 'Singapore Airlines', shortName: 'SIA', aliases: ['singapore air', 'sia'], domain: 'singaporeair.com', alternateDomains: [], industry: 'Airlines', country: 'Singapore', companyType: 'MNC' },
  { name: 'Qatar Airways', shortName: 'Qatar Airways', aliases: ['qatarairways'], domain: 'qatarairways.com', alternateDomains: [], industry: 'Airlines', country: 'Qatar', companyType: 'MNC' },
  { name: 'Delta Air Lines', shortName: 'Delta', aliases: ['delta airlines', 'delta air lines'], domain: 'delta.com', alternateDomains: [], industry: 'Airlines', country: 'Global', companyType: 'MNC' },
  { name: 'United Airlines', shortName: 'United', aliases: ['united airlines', 'united airlines holdings'], domain: 'united.com', alternateDomains: [], industry: 'Airlines', country: 'Global', companyType: 'MNC' },
  { name: 'British Airways', shortName: 'BA', aliases: ['british airway', 'ba', 'iaf'], domain: 'britishairways.com', alternateDomains: [], industry: 'Airlines', country: 'UK', companyType: 'MNC' },
  { name: 'American Airlines', shortName: 'American Airlines', aliases: ['american airline', 'aa'], domain: 'aa.com', alternateDomains: [], industry: 'Airlines', country: 'Global', companyType: 'MNC' },

  /* ------------------------------ FMCG / Retail / Consumer ------------------------------ */
  { name: 'Reliance Industries', shortName: 'RIL', aliases: ['reliance industries limited', 'reliance', 'ril'], domain: 'ril.com', alternateDomains: [], industry: 'Conglomerate', country: 'India', companyType: 'MNC' },
  { name: 'Tata Sons', shortName: 'Tata', aliases: ['tata group', 'tata sons limited'], domain: 'tata.com', alternateDomains: ['tatasons.com'], industry: 'Conglomerate', country: 'India', companyType: 'MNC' },
  { name: 'Adani Group', shortName: 'Adani', aliases: ['adani group', 'adani enterprises'], domain: 'adani.com', alternateDomains: ['adani.in'], industry: 'Conglomerate', country: 'India', companyType: 'MNC' },
  { name: 'Larsen & Toubro', shortName: 'L&T', aliases: ['larsen and toubro', 'l&t', 'lt group'], domain: 'larsentoubro.com', alternateDomains: ['lntecc.com'], industry: 'Engineering / Construction', country: 'India', companyType: 'MNC' },
  { name: 'Hindustan Unilever', shortName: 'HUL', aliases: ['hindustan unilever limited', 'unilever india', 'hul'], domain: 'hul.co.in', alternateDomains: ['unilever.com'], industry: 'FMCG', country: 'India', companyType: 'MNC' },
  { name: 'Unilever', shortName: 'Unilever', aliases: ['unilever plc', 'unilever'], domain: 'unilever.com', alternateDomains: ['unileverjobs.com'], industry: 'FMCG', country: 'Global', companyType: 'MNC' },
  { name: 'ITC Limited', shortName: 'ITC', aliases: ['itc limited', 'itc group', 'itc hotels', 'itc infotech'], domain: 'itcportal.com', alternateDomains: ['itc.in'], industry: 'FMCG / Conglomerate', country: 'India', companyType: 'MNC' },
  { name: 'Nestlé', shortName: 'Nestlé', aliases: ['nestle', 'nestle india'], domain: 'nestle.com', alternateDomains: ['nestle.in'], industry: 'FMCG', country: 'Global', companyType: 'MNC' },
  { name: 'PepsiCo', shortName: 'PepsiCo', aliases: ['pepsico india', 'pepsi'], domain: 'pepsico.com', alternateDomains: [], industry: 'FMCG / Beverages', country: 'Global', companyType: 'MNC' },
  { name: 'Coca-Cola', shortName: 'Coca-Cola', aliases: ['coca cola india', 'coco cola'], domain: 'coca-cola.com', alternateDomains: ['coca-colaindia.com'], industry: 'FMCG / Beverages', country: 'Global', companyType: 'MNC' },
  { name: 'Procter & Gamble', shortName: 'P&G', aliases: ['p&g', 'procter and gamble'], domain: 'pg.com', alternateDomains: [], industry: 'FMCG', country: 'Global', companyType: 'MNC' },
  { name: 'Colgate-Palmolive', shortName: 'Colgate', aliases: ['colgate', 'colgate palmolive', 'colgate india'], domain: 'colgatepalmolive.com', alternateDomains: ['colgate.co.in'], industry: 'FMCG', country: 'Global', companyType: 'MNC' },
  { name: 'Britannia', shortName: 'Britannia', aliases: ['britannia industries'], domain: 'britannia.co.in', alternateDomains: [], industry: 'FMCG / Foods', country: 'India', companyType: 'MNC' },
  { name: 'Amul / GCMMF', shortName: 'Amul', aliases: ['amul', 'gcmmf', 'amul dairy'], domain: 'amul.com', alternateDomains: ['amul.coop'], industry: 'FMCG / Dairy', country: 'India', companyType: 'MNC' },
  { name: "Dr. Reddy's", shortName: "Dr. Reddy's", aliases: ['dr reddy', 'drre ddy', 'drs reddys'], domain: 'drreddys.com', alternateDomains: [], industry: 'Pharmaceuticals', country: 'India', companyType: 'MNC' },
  { name: 'Nike', shortName: 'Nike', aliases: ['nike inc'], domain: 'nike.com', alternateDomains: [], industry: 'Sportswear', country: 'Global', companyType: 'MNC' },
  { name: 'Adidas', shortName: 'Adidas', aliases: ['adidas group'], domain: 'adidas.com', alternateDomains: [], industry: 'Sportswear', country: 'Global', companyType: 'MNC' },
  { name: 'PUMA', shortName: 'PUMA', aliases: ['puma se'], domain: 'puma.com', alternateDomains: [], industry: 'Sportswear', country: 'Global', companyType: 'MNC' },
  { name: 'Zara / Inditex', shortName: 'Inditex', aliases: ['zara', 'inditex'], domain: 'zara.com', alternateDomains: ['inditex.com'], industry: 'Retail / Fashion', country: 'Global', companyType: 'MNC' },
  { name: 'H&M', shortName: 'H&M', aliases: ['h and m', 'hennes and mauritz', 'hm group'], domain: 'hm.com', alternateDomains: [], industry: 'Retail / Fashion', country: 'Global', companyType: 'MNC' },
  { name: 'IKEA', shortName: 'IKEA', aliases: ['ikea india', 'ingka'], domain: 'ikea.com', alternateDomains: [], industry: 'Retail / Home Furnishings', country: 'Global', companyType: 'MNC' },
  { name: 'Decathlon', shortName: 'Decathlon', aliases: ['decathlon sports'], domain: 'decathlon.com', alternateDomains: [], industry: 'Retail / Sporting Goods', country: 'Global', companyType: 'MNC' },
  { name: 'Titan Company', shortName: 'Titan', aliases: ['titan', 'titan company limited', 'tanishq'], domain: 'titan.co.in', alternateDomains: [], industry: 'Retail / Watches & Jewelry', country: 'India', companyType: 'MNC' },
  { name: 'DMart / Avenue Supermarts', shortName: 'DMart', aliases: ['dmart', 'avenue supermarts'], domain: 'dmartindia.com', alternateDomains: [], industry: 'Retail', country: 'India', companyType: 'MNC' },

  /* ------------------------------ Hospitality / F&B ------------------------------ */
  { name: 'Marriott International', shortName: 'Marriott', aliases: ['marriott hotels', 'marriott'], domain: 'marriott.com', alternateDomains: [], industry: 'Hospitality', country: 'Global', companyType: 'MNC' },
  { name: 'Hilton', shortName: 'Hilton', aliases: ['hilton hotels', 'hilton worldwide'], domain: 'hilton.com', alternateDomains: [], industry: 'Hospitality', country: 'Global', companyType: 'MNC' },
  { name: 'Accor', shortName: 'Accor', aliases: ['accor hotels', 'accor group'], domain: 'accor.com', alternateDomains: [], industry: 'Hospitality', country: 'Global', companyType: 'MNC' },
  { name: 'Taj Hotels / IHCL', shortName: 'Taj', aliases: ['taj hotels', 'ihcl', 'indian hotels company'], domain: 'tajhotels.com', alternateDomains: ['ihcltata.com'], industry: 'Hospitality', country: 'India', companyType: 'MNC' },
  { name: 'Oberoi Hotels', shortName: 'Oberoi', aliases: ['oberoi group', 'oberoi hotels'], domain: 'oberoihotels.com', alternateDomains: ['oberoigroup.com'], industry: 'Hospitality', country: 'India', companyType: 'MNC' },
  { name: 'Starbucks', shortName: 'Starbucks', aliases: ['starbucks india', 'starbucks coffee'], domain: 'starbucks.com', alternateDomains: ['starbucks.in'], industry: 'Food & Beverage', country: 'Global', companyType: 'MNC' },
  { name: 'McDonald’s', shortName: 'McDonald’s', aliases: ['mcdonalds', 'mcdonald', 'mcd'], domain: 'mcdonalds.com', alternateDomains: [], industry: 'Food & Beverage', country: 'Global', companyType: 'MNC' },
  { name: 'KFC', shortName: 'KFC', aliases: ['kentucky fried chicken', 'kfc india', 'yum brands'], domain: 'kfc.com', alternateDomains: ['yum.com', 'kfcindia.com'], industry: 'Food & Beverage', country: 'Global', companyType: 'MNC' },
  { name: 'Domino’s', shortName: 'Domino’s', aliases: ['dominos', 'domino pizza', 'jubilant foodworks'], domain: 'dominos.com', alternateDomains: ['dominosindia.com'], industry: 'Food & Beverage', country: 'Global', companyType: 'MNC' },
  { name: 'Burger King', shortName: 'Burger King', aliases: ['burgerking', 'bk india', 'restaurant brands'], domain: 'bk.com', alternateDomains: ['burgerking.in'], industry: 'Food & Beverage', country: 'Global', companyType: 'MNC' },

  /* ------------------------------ Media / Jobs Platforms / Misc ------------------------------ */
  { name: 'Naukri', shortName: 'Naukri', aliases: ['naukri.com', 'info edge', 'infoedge'], domain: 'naukri.com', alternateDomains: ['infoedge.in'], industry: 'Job Platform', country: 'India', companyType: 'MNC' },
  { name: 'Indeed', shortName: 'Indeed', aliases: ['indeed.com', 'indeed india'], domain: 'indeed.com', alternateDomains: [], industry: 'Job Platform', country: 'Global', companyType: 'MNC' },
  { name: 'Monster', shortName: 'Monster', aliases: ['monster.com', 'monster india'], domain: 'monster.com', alternateDomains: [], industry: 'Job Platform', country: 'Global', companyType: 'MNC' },
  { name: 'Disney', shortName: 'Disney', aliases: ['walt disney company', 'disney india', 'disney star'], domain: 'disney.com', alternateDomains: ['thewaltdisneycompany.com'], industry: 'Media / Entertainment', country: 'Global', companyType: 'MNC' },
  { name: 'Warner Bros. Discovery', shortName: 'WBD', aliases: ['warner bros', 'warner brothers discovery', 'wbd'], domain: 'wbd.com', alternateDomains: ['warnerbros.com'], industry: 'Media / Entertainment', country: 'Global', companyType: 'MNC' },
  { name: 'Sony Pictures', shortName: 'Sony Pictures', aliases: ['sony pictures entertainment', 'spe'], domain: 'sonypictures.com', alternateDomains: [], industry: 'Media / Entertainment', country: 'Global', companyType: 'MNC' },
  { name: 'PayPal', shortName: 'PayPal', aliases: ['paypal holdings', 'paypal india'], domain: 'paypal.com', alternateDomains: [], industry: 'Fintech', country: 'Global', companyType: 'MNC' },
  { name: 'Coinbase', shortName: 'Coinbase', aliases: ['coinbase inc', 'coinbase global'], domain: 'coinbase.com', alternateDomains: [], industry: 'Crypto Exchange', country: 'Global', companyType: 'MNC' },
];

// Centrally control how many companies this trusted registry contains.
const TRUSTED_COMPANIES_COUNT = companies.length;

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/* Strip legal/business suffixes so "Tata Consultancy Services Limited" matches
 * "Tata Consultancy Services" without a full fuzzy comparison. */
const LEGAL_SUFFIX_RE = /\b(limited?|ltd|inc|incorporated|incorporation|corporation|corp|plc|pvt|private|company|co|sa|ab|ag|llc|gmbh|group|holdings?|global|technologies|technology|services|sons)\b/g;

function stripLegalSuffixes(s) {
  return (s || '')
    .replace(LEGAL_SUFFIX_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Remove accidental duplicates by normalized name — keeps the DB clean. */
const dedupeCompanies = (list) => {
  const seen = new Set();
  const out = [];
  let dropped = 0;
  for (const c of list) {
    const key = normalizeName(c.name);
    if (seen.has(key)) {
      dropped += 1;
      continue;
    }
    seen.add(key);
    out.push(c);
  }
  if (dropped > 0) console.log(`[companies] Removed ${dropped} duplicate trusted-company entries`);
  return out;
};

const deduped = dedupeCompanies(companies);

/**
 * Find a registry entry whose name / shortName / aliases match the input.
 * Returns the best match with confidence. Strong matches only — weak fuzzy
 * matches are NOT auto-verified (they resolve to null so unknown handling kicks in).
 */
function lookupCompany(input, options = {}) {
  const minScore = options.minScore || 0.85;
  if (!input) return null;
  const raw = String(input).toLowerCase();
  const n = normalizeName(raw);
  if (!n) return null;

  // 1) Exact match on name / shortName / aliases
  for (const c of deduped) {
    if (normalizeName(c.name) === n) return c;
    if (c.shortName && normalizeName(c.shortName) === n) return c;
    for (const a of c.aliases || []) {
      if (normalizeName(a) === n) return c;
    }
  }

  // 2) Legal-suffix-insensitive match ("Tata Consultancy Services Limited" -> TCS)
  const nStripped = normalizeName(stripLegalSuffixes(raw));
  if (nStripped && nStripped.length >= 3) {
    for (const c of deduped) {
      const candidates = [c.name, c.shortName, ...(c.aliases || [])];
      for (const cand of candidates) {
        const stripped = normalizeName(stripLegalSuffixes(cand));
        if (stripped && stripped !== '' && nStripped === stripped) return c;
      }
    }
  }

  // 3) Fuzzy candidate ranking: pick the best scoring entry, but require score >= minScore
  let best = null;
  let bestScore = 0;
  for (const c of deduped) {
    const candidates = [c.name, c.shortName, ...(c.aliases || [])];
    for (const cand of candidates) {
      const cn = normalizeName(cand);
      if (!cn) continue;
      const d = levenshtein(n, cn);
      const longer = Math.max(n.length, cn.length);
      if (longer === 0) continue;
      let sim = 1 - d / longer;
      // Bonus for prefix containment ("Tata Consultancy Service" vs "Tata Consultancy Services")
      const prefixBonus = cn.startsWith(n) || n.startsWith(cn) ? 0.05 : 0;
      // Bonus when stripped forms align ("Tata Consultancy Services Limited" vs "...Services")
      if (nStripped && nStripped.length >= 3 && normalizeName(stripLegalSuffixes(cand)) === nStripped) sim += 0.1;
      const score = sim + prefixBonus;
      if (score >= minScore && score > bestScore) {
        best = c;
        bestScore = score;
      }
    }
  }
  return best; // null unless score >= minScore (weak match -> null -> "Unknown")
}

function allDomainsFor(company) {
  if (!company) return [];
  const set = new Set([company.domain]);
  (company.alternateDomains || []).forEach((d) => set.add(d.replace(/^\./, '')));
  return Array.from(set);
}

/**
 * Registered (registrable) domain e.g. www.careers.microsoft.com -> microsoft.com
 * with awareness of multi-part public suffixes (co.in, co.uk, com.au, ...).
 */
const MULTI_PART_PUBLIC_SUFFIXES = new Set([
  'co.in', 'co.uk', 'org.uk', 'com.au', 'net.au', 'com.sg', 'com.br', 'co.za',
  'co.jp', 'com.cn', 'com.hk', 'com.my', 'com.ph', 'com.tr', 'co.id', 'com.mx',
  'com.ar', 'co.nz', 'com.pk', 'com.ng', 'com.eg', 'com.ae', 'co.ke', 'com.bd',
  'com.bh', 'com.om', 'com.qa', 'com.sa', 'com.lk', 'com.np', 'com.kh', 'com.tw',
  'com.hk', 'gov.in', 'ac.in', 'edu.in',
]);
function registrableDomain(host) {
  if (!host) return null;
  const h = String(host).toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  if (!h || h.indexOf('.') === -1) return h || null;
  const labels = h.split('.');
  if (labels.length <= 2) return h;
  const lastTwo = labels.slice(-2).join('.');
  const lastThree = labels.slice(-3).join('.');
  if (MULTI_PART_PUBLIC_SUFFIXES.has(lastThree)) return labels.slice(-3).join('.');
  if (MULTI_PART_PUBLIC_SUFFIXES.has(lastTwo)) return labels.slice(-2).join('.');
  return lastTwo;
}
function isSubdomainOf(host, officialDomain) {
  if (!host || !officialDomain) return false;
  const h = String(host).toLowerCase().replace(/^www\./, '');
  const o = String(officialDomain).toLowerCase().replace(/^www\./, '');
  return h === o || h.endsWith('.' + o) || (registrableDomain(h) === registrableDomain(o) && h !== o);
}

/**
 * Detect impersonation (typosquatting / lookalike) of an official domain.
 * Returns { impersonation: true, nearTo, reason } or { impersonation: false }.
 */
function detectImpersonation(hostname, officialDomains) {
  if (!hostname || !officialDomains || !officialDomains.length) return { impersonation: false };
  const h = String(hostname).toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  for (const off of officialDomains) {
    const o = String(off).toLowerCase().replace(/^www\./, '');
    if (h === o) continue;
    if (h.endsWith('.' + o)) continue;
    const hr = registrableDomain(h);
    const or = registrableDomain(o);
    const d = levenshtein(hr, or);
    if (d > 0 && d <= 2) {
      return { impersonation: true, nearTo: off, reason: `Domain "${h}" looks like "${off}" (edit distance ${d})` };
    }
    // official brand embedded in a lookalike but NOT as a proper subdomain, e.g. microsoft-careers.com
    const base = o.split('.')[0];
    if (base.length > 3 && (h.includes(base) || base.includes(hr.split('.')[0])) && hr !== or) {
      return { impersonation: true, nearTo: off, reason: `Domain "${h}" embeds "${base}" but is not a subdomain of ${o}` };
    }
  }
  return { impersonation: false };
}

function levenshtein(a, b) {
  a = String(a || '');
  b = String(b || '');
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

module.exports = {
  companies: deduped,
  TRUSTED_COMPANIES_COUNT,
  lookupCompany,
  allDomainsFor,
  registrableDomain,
  isSubdomainOf,
  detectImpersonation,
  levenshtein,
  normalizeName
};