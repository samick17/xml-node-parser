describe('xml-utility', () => {

	const assert = require('chai').assert;
	const xmlUtility = require('../xml-utility');

	it('isStartTag', (done) => {
		assert.equal(true, xmlUtility.isStartTag('<abcde>'));
		assert.equal(false, xmlUtility.isStartTag('<abcde/>'));
		assert.equal(true, xmlUtility.isStartTag('<abcde attr>'));
		done();
	});

	it('parseStartTag', (done) => {
		var node = xmlUtility.parseStartTag('<abcde attr>');
		assert.equal('abcde', node.name);
		assert.deepEqual({attr: ''}, node.attrs);
		done();
	});

	it('parseStartTag - multi attributes', (done) => {
		var node = xmlUtility.parseStartTag('<abcde attr="" name="username" action="doSomething">');
		assert.equal('abcde', node.name);
		assert.deepEqual({
			attr: '',
			name: 'username',
			action: 'doSomething'
		}, node.attrs);
		done();
	});

	it('isEndTag', (done) => {
		assert.equal(true, xmlUtility.isEndTag('</abcde>'));
		assert.equal(false, xmlUtility.isEndTag('<abcde>'));
		done();
	});

	it('isEndWithTag', (done) => {
		assert.equal(false, xmlUtility.isEndWithTag('div', '<div>'));
		assert.equal(true, xmlUtility.isEndWithTag('div', '</div>'));
		done();
	});

	it('parseEndTag', (done) => {
		var node = xmlUtility.parseEndTag('</abcde>');
		assert.equal('abcde', node.name);
		done();
	});

	it('isInlineTag', (done) => {
		assert.equal(true, xmlUtility.isInlineTag('<abcde/>'));
		assert.equal(false, xmlUtility.isInlineTag('<abcde>'));
		assert.equal(true, xmlUtility.isInlineTag('<abcde attr/>'));
		done();
	});

	it('parseInlineTag', (done) => {
		var node = xmlUtility.parseInlineTag('<abcde attr/>');
		assert.equal('abcde', node.name);
		assert.deepEqual({attr: ''}, node.attrs);
		done();
	});

});