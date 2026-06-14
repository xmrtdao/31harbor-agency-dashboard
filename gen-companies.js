import fs from "fs";
const companies = [
  ["harbor", "31 Harbor", "#0A84FF"],
  ["party", "Party Favor Photo", "#F5A623"],
  ["xmrt", "XMRT DAO", "#7B61FF"]
];
for (const [id, name, color] of companies) {
  let html = fs.readFileSync("dist/index.html", "utf8");
  html = html.replace("<head>", `<head>\n    <script>window.SUITEAI_COMPANY="${id}";window.SUITEAI_COMPANY_NAME="${name}";window.SUITEAI_COMPANY_COLOR="${color}";</script>`);
  html = html.replace("<title>SuiteAI</title>", `<title>SuiteAI — ${name}</title>`);
  html = html.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0" />', `<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <meta name="theme-color" content="${color}" />`);
  fs.mkdirSync(`dist/${id}`, { recursive: true });
  fs.writeFileSync(`dist/${id}/index.html`, html);
  console.log(id, "done");
}
