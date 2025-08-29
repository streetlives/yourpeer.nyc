import fs from "fs";
import path from "path";
import ts from "typescript";
import translations from "../src/components/translations";

const russian =
  (translations as Record<string, Record<string, string>>).ru || {};

const collected = new Set<string>();

function walk(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (
      entry.isFile() &&
      (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx"))
    ) {
      analyzeFile(fullPath);
    }
  }
}

function analyzeFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const source = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  function visit(node: ts.Node) {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tagName = node.tagName.getText();
      if (tagName === "TranslatableText") {
        let text: string | undefined;
        let id: string | undefined;
        let expectTranslation = true;
        node.attributes.properties.forEach((attr) => {
          if (ts.isJsxAttribute(attr) && attr.initializer) {
            const name = attr.name.getText();
            if (
              (name === "text" ||
                name === "id" ||
                name === "expectTranslation") &&
              ts.isJsxExpression(attr.initializer)
            ) {
              const expr = attr.initializer.expression;
              if (
                name === "expectTranslation" &&
                expr &&
                expr.kind === ts.SyntaxKind.FalseKeyword
              ) {
                expectTranslation = false;
              }
              if (name === "text" || name === "id") {
                if (expr && ts.isStringLiteral(expr)) {
                  if (name === "text") text = expr.text;
                  else id = expr.text;
                }
              }
            } else if (
              name === "text" &&
              ts.isStringLiteral(attr.initializer)
            ) {
              text = attr.initializer.text;
            } else if (name === "id" && ts.isStringLiteral(attr.initializer)) {
              id = attr.initializer.text;
            } else if (
              name === "expectTranslation" &&
              ts.isStringLiteral(attr.initializer)
            ) {
              expectTranslation = attr.initializer.text !== "false";
            }
          }
        });
        if (expectTranslation) {
          if (id) collected.add(id);
          else if (text) collected.add(text);
        }
      }
    } else if (ts.isCallExpression(node)) {
      const expr = node.expression.getText();
      if (expr === "useTranslatedText" || expr === "getTranslatedText") {
        const arg = node.arguments[0];
        if (arg && ts.isObjectLiteralExpression(arg)) {
          let text: string | undefined;
          let id: string | undefined;
          let expectTranslation = true;
          for (const prop of arg.properties) {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
              const name = prop.name.text;
              if (name === "expectTranslation") {
                if (prop.initializer.kind === ts.SyntaxKind.FalseKeyword)
                  expectTranslation = false;
              } else if (name === "text" || name === "id") {
                if (ts.isStringLiteral(prop.initializer)) {
                  if (name === "text") text = prop.initializer.text;
                  else id = prop.initializer.text;
                }
              }
            }
          }
          if (expectTranslation) {
            if (id) collected.add(id);
            else if (text) collected.add(text);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(source);
}

walk(path.join(__dirname, "..", "src"));

console.log("Translatable strings found:");
collected.forEach((text) => {
  const translation = russian[text];
  console.log(` - ${text} -> ${translation ?? "(missing)"}`);
});

const missing: string[] = [];
collected.forEach((text) => {
  if (!Object.prototype.hasOwnProperty.call(russian, text)) {
    missing.push(text);
  }
});

if (missing.length > 0) {
  console.error("Missing Russian translations for the following strings:");
  for (const m of missing) {
    console.error(` - ${m}`);
  }
  process.exit(1);
} else {
  console.log("All translatable text has Russian translations.");
}
