const vscode = require("vscode");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "comment-cleaner.removeComments",
    async function () {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const document = editor.document;
      let fullText = document.getText();

      const urlRegex =
        /(https?:\/\/[^\s]+|process\.env\.[\w_]+(\.[\w_]+)?(\+?\s*["'`]\s*[\w\/:.-]+["'`])?)/g;
      const urls = [];
      fullText = fullText.replace(urlRegex, (match) => {
        const placeholder = `URL_${urls.length}`;
        urls.push(match);
        return placeholder;
      });

      const cleanedText = fullText.replace(
        /\/\/(?!\!)(.*)|\/\*[^]*?\*\//g,
        (match) => (match.startsWith("//!") ? match : "")
      );

      let finalText = cleanedText;
      urls.forEach((url, index) => {
        finalText = finalText.replace(`URL_${index}`, url);
      });

      const edit = new vscode.WorkspaceEdit();
      edit.replace(
        document.uri,
        new vscode.Range(0, 0, document.lineCount, 0),
        finalText
      );
      await vscode.workspace.applyEdit(edit);

      await vscode.commands.executeCommand("editor.action.formatDocument");
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
