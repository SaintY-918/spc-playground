/*
 * 把 index.html + src/*.js 打包成單一檔 dist/artifact.html（body-only，
 * 可以直接發布成 Claude Artifact，也可以當成離線單檔版本分享）。
 *
 *   node tools/build-artifact.js
 */
var fs = require('fs');
var path = require('path');

var root = path.join(__dirname, '..');
var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// 抽出 <title> 與 <style>，丟掉 doctype/html/head/body 外殼
var title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || 'SPC Playground';
var style = (html.match(/<style>[\s\S]*?<\/style>/) || [''])[0];
var body = (html.match(/<body>([\s\S]*?)<\/body>/) || [, ''])[1];

// 把外部 script 換成內嵌內容
body = body.replace(/<script src="([^"]+)"><\/script>/g, function (_, src) {
  return '<script>\n' + fs.readFileSync(path.join(root, src), 'utf8') + '\n</script>';
});

var out = '<title>' + title + '</title>\n' + style + '\n' + body.trim() + '\n';
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'artifact.html'), out, 'utf8');
console.log('dist/artifact.html  ' + (out.length / 1024).toFixed(1) + ' KB');
