describe('xml-parser', () => {

	const assert = require('chai').assert;
	const xmlParser = require('../xml-parser');

	it('parse simple xml', () => {
		var nodes = xmlParser.parseFromText('<div></div>');
		assert.equal(1, nodes.length);
		assert.equal(0, nodes[0].children.length);
		assert.equal('<div/>', nodes[0].toXml());
		assert.equal('div: \n', nodes[0].toString());

		nodes = xmlParser.parseFromText('<div>12345</div>');
		assert.equal(1, nodes.length);
		assert.equal(0, nodes[0].children.length);
		assert.equal('<div>12345</div>', nodes[0].toXml());
		assert.equal('div: 12345\n', nodes[0].toString());

		nodes = xmlParser.parseFromText('<div name="newname">12345</div>');
		assert.equal(1, nodes.length);
		assert.equal(0, nodes[0].children.length);
		assert.equal('<div name="newname">12345</div>', nodes[0].toXml());
		assert.equal('div(name="newname"): 12345\n', nodes[0].toString());

		nodes = xmlParser.parseFromText('<div name="newname">"abcdefg"</div>');
		assert.equal(1, nodes.length);
		assert.equal(0, nodes[0].children.length);
		assert.equal('<div name="newname">"abcdefg"</div>', nodes[0].toXml());
		assert.equal('div(name="newname"): "abcdefg"\n', nodes[0].toString());

		nodes = xmlParser.parseFromText('<div name="newname" attr2="thesecondattr">12345</div>');
		assert.equal(1, nodes.length);
		assert.equal(0, nodes[0].children.length);
		assert.equal('<div name="newname" attr2="thesecondattr">12345</div>', nodes[0].toXml());
		assert.equal('div(name="newname" attr2="thesecondattr"): 12345\n', nodes[0].toString());

		nodes = xmlParser.parseFromText('<div name="newname" attr2="thesecondattr"><div>childA</div><div>childB</div></div>');
		assert.equal(1, nodes.length);
		assert.equal(2, nodes[0].children.length);
		assert.equal('<div name="newname" attr2="thesecondattr"><div>childA</div><div>childB</div></div>', nodes[0].toXml());
		assert.equal('div(name="newname" attr2="thesecondattr"): \n  div: childA\n  div: childB\n', nodes[0].toString());

		nodes = xmlParser.parseFromText('<div>3<div>2<div>1</div></div></div>');
		assert.equal(1, nodes.length);
		assert.equal(1, nodes[0].children[0].children.length);
		assert.equal('<div>3<div>2<div>1</div></div></div>', nodes[0].toXml());
		assert.equal('div: 3\n  div: 2\n    div: 1\n', nodes[0].toString());
	});

	it('parse xml from file(not exists)', (done) => {
		xmlParser.parseFromFile('./test/testdata/node-version1.xml')
		.then((nodes) => {
			assert.fail('parse from file failed');
		}, (err) => {
			assert.equal(new Error('File not found!').toString(), err.toString());
			done();
		});
	});

	it('parse node-version.xml from file', (done) => {
		xmlParser.parseFromFile('./test/testdata/node-version.xml')
		.then((nodes) => {
			assert.equal(1, nodes.length);
			assert.equal(7, nodes[0].children.length);
			var n1 = nodes[0].children[0];
			assert.equal('<td data-label="Version">Node.js 10.3.0</td>', n1.toXml());
			assert.equal('td', n1.name);
			assert.deepEqual({'data-label': 'Version'}, n1.attrs);
			assert.equal('Node.js 10.3.0', n1.value);
			assert.equal(0, n1.children.length);

			var n2 = nodes[0].children[1];
			assert.equal('<td data-label="LTS"/>', n2.toXml());
			assert.equal('td', n2.name);
			assert.deepEqual({'data-label': 'LTS'}, n2.attrs);
			assert.equal('', n2.value);
			assert.equal(0, n2.children.length);

			var n3 = nodes[0].children[2];
			assert.equal('<td data-label="Date"><time>2018-05-29</time></td>', n3.toXml());
			assert.equal('td(data-label="Date"): \n  time: 2018-05-29\n', n3.toString());
			assert.equal('td', n3.name);
			assert.deepEqual({'data-label': 'Date'}, n3.attrs);
			assert.equal('', n3.value);
			var n31 = n3.children[0];
			assert.equal('time', n31.name);
			assert.deepEqual({}, n31.attrs);
			assert.equal('2018-05-29', n31.value);
			assert.equal(1, n3.children.length);

			var n4 = nodes[0].children[3];
			assert.equal('<td data-label="V8">6.6.346.32</td>', n4.toXml());
			assert.equal('td', n4.name);
			assert.deepEqual({'data-label': 'V8'}, n4.attrs);
			assert.equal('6.6.346.32', n4.value);
			assert.equal(0, n4.children.length);

			var n5 = nodes[0].children[4];
			assert.equal('<td data-label="npm">6.1.0</td>', n5.toXml());
			assert.equal('td', n5.name);
			assert.deepEqual({'data-label': 'npm'}, n5.attrs);
			assert.equal('6.1.0', n5.value);
			assert.equal(0, n5.children.length);

			var n6 = nodes[0].children[5];
			assert.equal('<td data-label="NODE_MODULE_VERSION">64</td>', n6.toXml());
			assert.equal('td', n6.name);
			assert.deepEqual({'data-label': 'NODE_MODULE_VERSION'}, n6.attrs);
			assert.equal('64', n6.value);
			assert.equal(0, n6.children.length);

			var n7 = nodes[0].children[6];
			assert.equal(['<td class="download-table-last">',
				'<a href="https://nodejs.org/download/release/v10.3.0/">',
				'Downloads',
				'</a>',
				'<a href="https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.3.0">',
				'Changelog',
				'</a>',
				'<a href="https://nodejs.org/dist/v10.3.0/docs/api/">',
				'Docs',
				'</a>',
				'</td>'].join(''), n7.toXml());
			assert.equal('td', n7.name);
			assert.deepEqual({class: 'download-table-last'}, n7.attrs);
			assert.equal('', n7.value);
			assert.equal(3, n7.children.length);
			var n71 = n7.children[0];
			assert.equal('a', n71.name);
			assert.deepEqual({href: 'https://nodejs.org/download/release/v10.3.0/'}, n71.attrs);
			assert.equal('Downloads', n71.value);
			var n72 = n7.children[1];
			assert.equal('a', n72.name);
			assert.deepEqual({href: 'https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.3.0'}, n72.attrs);
			assert.equal('Changelog', n72.value);
			var n73 = n7.children[2];
			assert.equal('a', n73.name);
			assert.deepEqual({href: 'https://nodejs.org/dist/v10.3.0/docs/api/'}, n73.attrs);
			assert.equal('Docs', n73.value);
			done();
		}, (err) => {
			assert.fail('Invalid status');
			done();
		});
	});

	it('parse node-version.xml from text', (done) => {
		var nodes = xmlParser.parseFromText([
			'<tr>',
			'<td data-label="Version">Node.js 10.3.0</td>',
			'<td data-label="LTS"></td>',
			'<td data-label="Date"><time>2018-05-29</time></td>',
			'<td data-label="V8">6.6.346.32</td>',
			'<td data-label="npm">6.1.0</td>',
			'<td data-label="NODE_MODULE_VERSION">64</td>',
			'<td class="download-table-last">',
			'<a href="https://nodejs.org/download/release/v10.3.0/">',
			'Downloads',
			'</a>',
			'<a href="https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.3.0">',
			'Changelog',
			'</a>',
			'<a href="https://nodejs.org/dist/v10.3.0/docs/api/">',
			'Docs',
			'</a>',
			'</td>',
			'</tr>'
			].join(''));
		assert.equal(1, nodes.length);
		assert.equal(7, nodes[0].children.length);
		var n1 = nodes[0].children[0];
		assert.equal('<td data-label="Version">Node.js 10.3.0</td>', n1.toXml());
		assert.equal('td', n1.name);
		assert.deepEqual({'data-label': 'Version'}, n1.attrs);
		assert.equal('Node.js 10.3.0', n1.value);
		assert.equal(0, n1.children.length);

		var n2 = nodes[0].children[1];
		assert.equal('<td data-label="LTS"/>', n2.toXml());
		assert.equal('td', n2.name);
		assert.deepEqual({'data-label': 'LTS'}, n2.attrs);
		assert.equal('', n2.value);
		assert.equal(0, n2.children.length);

		var n3 = nodes[0].children[2];
		assert.equal('<td data-label="Date"><time>2018-05-29</time></td>', n3.toXml());
		assert.equal('td(data-label="Date"): \n  time: 2018-05-29\n', n3.toString());
		assert.equal('td', n3.name);
		assert.deepEqual({'data-label': 'Date'}, n3.attrs);
		assert.equal('', n3.value);
		var n31 = n3.children[0];
		assert.equal('time', n31.name);
		assert.deepEqual({}, n31.attrs);
		assert.equal('2018-05-29', n31.value);
		assert.equal(1, n3.children.length);

		var n4 = nodes[0].children[3];
		assert.equal('<td data-label="V8">6.6.346.32</td>', n4.toXml());
		assert.equal('td', n4.name);
		assert.deepEqual({'data-label': 'V8'}, n4.attrs);
		assert.equal('6.6.346.32', n4.value);
		assert.equal(0, n4.children.length);

		var n5 = nodes[0].children[4];
		assert.equal('<td data-label="npm">6.1.0</td>', n5.toXml());
		assert.equal('td', n5.name);
		assert.deepEqual({'data-label': 'npm'}, n5.attrs);
		assert.equal('6.1.0', n5.value);
		assert.equal(0, n5.children.length);

		var n6 = nodes[0].children[5];
		assert.equal('<td data-label="NODE_MODULE_VERSION">64</td>', n6.toXml());
		assert.equal('td', n6.name);
		assert.deepEqual({'data-label': 'NODE_MODULE_VERSION'}, n6.attrs);
		assert.equal('64', n6.value);
		assert.equal(0, n6.children.length);

		var n7 = nodes[0].children[6];
		assert.equal(['<td class="download-table-last">',
			'<a href="https://nodejs.org/download/release/v10.3.0/">',
			'Downloads',
			'</a>',
			'<a href="https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.3.0">',
			'Changelog',
			'</a>',
			'<a href="https://nodejs.org/dist/v10.3.0/docs/api/">',
			'Docs',
			'</a>',
			'</td>'].join(''), n7.toXml());
		assert.equal('td', n7.name);
		assert.deepEqual({class: 'download-table-last'}, n7.attrs);
		assert.equal('', n7.value);
		assert.equal(3, n7.children.length);
		var n71 = n7.children[0];
		assert.equal('a', n71.name);
		assert.deepEqual({href: 'https://nodejs.org/download/release/v10.3.0/'}, n71.attrs);
		assert.equal('Downloads', n71.value);
		var n72 = n7.children[1];
		assert.equal('a', n72.name);
		assert.deepEqual({href: 'https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.3.0'}, n72.attrs);
		assert.equal('Changelog', n72.value);
		var n73 = n7.children[2];
		assert.equal('a', n73.name);
		assert.deepEqual({href: 'https://nodejs.org/dist/v10.3.0/docs/api/'}, n73.attrs);
		assert.equal('Docs', n73.value);
		done();
	})

	it('parse xml', () => {
		var xmlText = ['<tr>',
		'<td data-label="Version">Node.js 10.3.0</td>',
		'<td data-label="LTS"></td>',
		'<td data-label="Date"><time>2018-05-29</time></td>',
		'<td data-label="V8">6.6.346.32</td>',
		'<td data-label="npm">6.1.0</td>',
		'<td data-label="NODE_MODULE_VERSION">64</td>',
		'<td class="download-table-last">',
		'<a href="https://nodejs.org/download/release/v10.3.0/">',
		'Downloads',
		'</a>',
		'<a href="https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.3.0">',
		'Changelog',
		'</a>',
		'<a href="https://nodejs.org/dist/v10.3.0/docs/api/">',
		'Docs',
		'</a>',
		'</td>',
		'</tr>'].join('');
		var nodes = xmlParser.parseFromText(xmlText);
		assert.equal(1, nodes.length);
		assert.equal(7, nodes[0].children.length);
		var n1 = nodes[0].children[0];
		assert.equal('<td data-label="Version">Node.js 10.3.0</td>', n1.toXml());
		assert.equal('td', n1.name);
		assert.deepEqual({'data-label': 'Version'}, n1.attrs);
		assert.equal('Node.js 10.3.0', n1.value);
		assert.equal(0, n1.children.length);

		var n2 = nodes[0].children[1];
		assert.equal('<td data-label="LTS"/>', n2.toXml());
		assert.equal('td', n2.name);
		assert.deepEqual({'data-label': 'LTS'}, n2.attrs);
		assert.equal('', n2.value);
		assert.equal(0, n2.children.length);

		var n3 = nodes[0].children[2];
		assert.equal('<td data-label="Date"><time>2018-05-29</time></td>', n3.toXml());
		assert.equal('td', n3.name);
		assert.deepEqual({'data-label': 'Date'}, n3.attrs);
		assert.equal('', n3.value);
		var n31 = n3.children[0];
		assert.equal('time', n31.name);
		assert.deepEqual({}, n31.attrs);
		assert.equal('2018-05-29', n31.value);
		assert.equal(1, n3.children.length);

		var n4 = nodes[0].children[3];
		assert.equal('<td data-label="V8">6.6.346.32</td>', n4.toXml());
		assert.equal('td', n4.name);
		assert.deepEqual({'data-label': 'V8'}, n4.attrs);
		assert.equal('6.6.346.32', n4.value);
		assert.equal(0, n4.children.length);

		var n5 = nodes[0].children[4];
		assert.equal('<td data-label="npm">6.1.0</td>', n5.toXml());
		assert.equal('td', n5.name);
		assert.deepEqual({'data-label': 'npm'}, n5.attrs);
		assert.equal('6.1.0', n5.value);
		assert.equal(0, n5.children.length);

		var n6 = nodes[0].children[5];
		assert.equal('<td data-label="NODE_MODULE_VERSION">64</td>', n6.toXml());
		assert.equal('td', n6.name);
		assert.deepEqual({'data-label': 'NODE_MODULE_VERSION'}, n6.attrs);
		assert.equal('64', n6.value);
		assert.equal(0, n6.children.length);

		var n7 = nodes[0].children[6];
		assert.equal(['<td class="download-table-last">',
			'<a href="https://nodejs.org/download/release/v10.3.0/">',
			'Downloads',
			'</a>',
			'<a href="https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.3.0">',
			'Changelog',
			'</a>',
			'<a href="https://nodejs.org/dist/v10.3.0/docs/api/">',
			'Docs',
			'</a>',
			'</td>'].join(''), n7.toXml());
		assert.equal('td', n7.name);
		assert.deepEqual({class: 'download-table-last'}, n7.attrs);
		assert.equal('', n7.value);
		assert.equal(3, n7.children.length);
		var n71 = n7.children[0];
		assert.equal('a', n71.name);
		assert.deepEqual({href: 'https://nodejs.org/download/release/v10.3.0/'}, n71.attrs);
		assert.equal('Downloads', n71.value);
		var n72 = n7.children[1];
		assert.equal('a', n72.name);
		assert.deepEqual({href: 'https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.3.0'}, n72.attrs);
		assert.equal('Changelog', n72.value);
		var n73 = n7.children[2];
		assert.equal('a', n73.name);
		assert.deepEqual({href: 'https://nodejs.org/dist/v10.3.0/docs/api/'}, n73.attrs);
		assert.equal('Docs', n73.value);
	});

	it('parse xml with newline', () => {
		var xmlText = [
		'<td class="download-table-last">',
		'  <a href="https://nodejs.org/download/release/v10.3.0/">',
		'    Downloads',
		'  </a>',
		'  <a href="https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.3.0">',
		'    Changelog',
		'  </a>',
		'  <a href="https://nodejs.org/dist/v10.3.0/docs/api/">',
		'  Docs',
		'  </a>',
		'</td>'
		].join('\n');
		var nodes = xmlParser.parseFromText(xmlText);
		assert.equal(1, nodes.length);
		
		var n1 = nodes[0];
		assert.equal(3, n1.children.length);
		assert.equal(['<td class="download-table-last">',
			'<a href="https://nodejs.org/download/release/v10.3.0/">',
			'Downloads',
			'</a>',
			'<a href="https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.3.0">',
			'Changelog',
			'</a>',
			'<a href="https://nodejs.org/dist/v10.3.0/docs/api/">',
			'Docs',
			'</a>',
			'</td>'].join(''), n1.toXml());
		assert.equal('td', n1.name);
		assert.deepEqual({class: 'download-table-last'}, n1.attrs);
		assert.equal('', n1.value);
		assert.equal(3, n1.children.length);
		var n11 = n1.children[0];
		assert.equal('a', n11.name);
		assert.deepEqual({href: 'https://nodejs.org/download/release/v10.3.0/'}, n11.attrs);
		assert.equal('Downloads', n11.value);
		var n12 = n1.children[1];
		assert.equal('a', n12.name);
		assert.deepEqual({href: 'https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.3.0'}, n12.attrs);
		assert.equal('Changelog', n12.value);
		var n13 = n1.children[2];
		assert.equal('a', n13.name);
		assert.deepEqual({href: 'https://nodejs.org/dist/v10.3.0/docs/api/'}, n13.attrs);
		assert.equal('Docs', n13.value);
	});

	it('test html file with script tag', (done) => {
		xmlParser.parseFromFile('./test/testdata/simple.html')
		.then((nodes) => {
			assert.equal(1, nodes.length);
			var htmlNode = nodes[0];
			assert.equal('html', htmlNode.name);
			assert.equal(1, htmlNode.children.length);
			var headNode = htmlNode.children[0];
			assert.equal('head', headNode.name);
			assert.deepEqual({meta: 'abcd'}, headNode.attrs);
			assert.equal(1, headNode.children.length);
			var scriptNode = headNode.children[0];
			assert.equal('script', scriptNode.name);
			assert.equal('var v1 = 1 < 2;		function foo() {			return 1 < 2;		}		var testStr = "</script>";', scriptNode.value);
			done();
		}, (err) => {
			assert.fail(err.message);
			done();
		});
	});

	it('parseInlineTag', () => {
		var nodes = xmlParser.parseFromText('<foo name="zz">321<div attr="123"/></foo>');
		assert.equal(1, nodes.length);
		assert.equal('foo', nodes[0].name);
		assert.deepEqual({
			name: 'zz'
		}, nodes[0].attrs);
		assert.equal('321', nodes[0].value);
		assert.equal(1, nodes[0].children.length);
		assert.equal('div', nodes[0].children[0].name);
		assert.deepEqual({
			attr: '123'
		}, nodes[0].children[0].attrs);
		assert.equal('', nodes[0].children[0].value);
	});
});