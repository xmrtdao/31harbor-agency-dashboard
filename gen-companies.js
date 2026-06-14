import fs from "fs";
const companies = [
  {
    id: "harbor",
    name: "31 Harbor",
    color: "#C9A84C",
    theme: `<style>:root{--su-bg:#0F1923;--su-bg-card:#1B2838;--su-bg-sidebar:#152030;--su-bg-input:#1B2838;--su-bg-elevated:#223040;--su-accent:#C9A84C;--su-accent-dim:rgba(201,168,76,0.15);--su-accent-glow:rgba(201,168,76,0.3);--su-text:#E8E0D0;--su-text-muted:#8A7E6B;--su-text-dim:#5A5040;--su-border:rgba(201,168,76,0.2);--su-border-focus:rgba(201,168,76,0.5);--su-gold:#C9A84C;--su-navy:#1B2838;--su-gradient:linear-gradient(135deg,#1B2838 0%,#0F1923 100%);}</style>`
  },
  {
    id: "party",
    name: "Party Favor Photo",
    color: "#D946EF",
    theme: `<style>:root{--su-bg:#FFF8F5;--su-bg-card:#FFFFFF;--su-bg-sidebar:#FFF0F5;--su-bg-input:#FFF5F8;--su-bg-elevated:#FFE8F0;--su-accent:#D946EF;--su-accent-dim:rgba(217,70,239,0.1);--su-accent-glow:rgba(217,70,239,0.25);--su-text:#2D1F2B;--su-text-muted:#8B6F7B;--su-text-dim:#B8A0A8;--su-border:rgba(217,70,239,0.15);--su-border-focus:rgba(217,70,239,0.4);--su-gold:#F5A623;--su-navy:#4A1E3D;--su-gradient:linear-gradient(135deg,#FFF8F5 0%,#FFE8F0 100%);}</style>`
  },
  {
    id: "xmrt",
    name: "XMRT DAO",
    color: "#F97316",
    theme: `<style>:root{--su-bg:#0B1120;--su-bg-card:#111D30;--su-bg-sidebar:#0D1528;--su-bg-input:#151D30;--su-bg-elevated:#1A2538;--su-accent:#F97316;--su-accent-dim:rgba(249,115,22,0.12);--su-accent-glow:rgba(249,115,22,0.3);--su-text:#E2E8F0;--su-text-muted:#7B8FA3;--su-text-dim:#4A5B6E;--su-border:rgba(249,115,22,0.15);--su-border-focus:rgba(249,115,22,0.4);--su-gold:#F97316;--su-navy:#0B1120;--su-gradient:linear-gradient(135deg,#111D30 0%,#0B1120 100%);}</style>`
  }
];
for (const co of companies) {
  let html = fs.readFileSync("dist/index.html", "utf8");
  html = html.replace("<head>", `<head>\n    ${co.theme}\n    <script>window.SUITEAI_COMPANY="${co.id}";window.SUITEAI_COMPANY_NAME="${co.name}";window.SUITEAI_COMPANY_COLOR="${co.color}";</script>`);
  html = html.replace("<title>SuiteAI</title>", `<title>SuiteAI — ${co.name}</title>`);
  html = html.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0" />', `<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <meta name="theme-color" content="${co.color}" />`);
  fs.mkdirSync(`dist/${co.id}`, { recursive: true });
  fs.writeFileSync(`dist/${co.id}/index.html`, html);
  console.log(co.id, "done");
}
