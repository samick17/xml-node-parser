function parseAttributes(text) {
	var attributeRe = /\s?([^"=]*)(=\"([^"]*)\"|())/g;
	var attrs = {};
	while((match = attributeRe.exec(text))) {
		if (match.index === attributeRe.lastIndex) {
			attributeRe.lastIndex++;
		}
		var key = match[1];
		var value = match[3] || match[4];
		if(key) {
			attrs[key] = value || '';
		}
	}
	return attrs;
}

function parseStartTag(text) {
	var startTagRe = /(.*)<([^ \/]+)((.*[^\/])?)>/;
	var reResult = startTagRe.exec(text);
	var previousValue = reResult[1];
	var tagName = reResult[2];
	var attribute = reResult[3];
	var attrs = parseAttributes(attribute);
	return {
		name: tagName,
		attrs: attrs,
		previousValue: previousValue
	};
}
function isEndTag(text) {
	var endTagRe = /<\/([^ \/]*)>/;
	return endTagRe.exec(text) !== null;
}
function parseEndTag(text) {
	var endTagRe = /<\/([^ \/]*)>/;
	var endTagResult = endTagRe.exec(text);
	if(endTagResult) {
		return {
			name: endTagResult[1]
		};
	} else {
		return {
			name: ''
		};
	}
}
function parseValueEndTag(text) {
	var endTagRe = /(.*)<\/([^ \/]*)>/;
	var endTagResult = endTagRe.exec(text);
	if(endTagResult) {
		return {
			name: endTagResult[2],
			value: endTagResult[1]
		};
	} else {
		return {
			name: '',
			value: ''
		};
	}
}
function isStartTag(text) {
	var startTagRe = /<([^ \/]+)((.*[^\/])?)>/;
	return startTagRe.exec(text) !== null;
}
function countOfChar(text) {
	return (text.match(/"/g) || []).length;
}
function isEndWithTag(tagName, text) {
	var endTagText = '</'+tagName+'>';
	var isQuoted = countOfChar(text) %2 === 0;
	var lastIndexOfEndTag = text.lastIndexOf(endTagText);
	return lastIndexOfEndTag !== -1 && lastIndexOfEndTag + endTagText.length === text.length && isQuoted;
}
function isInlineTag(text) {
	var inlineTagRe = /(.*)<([^ ]*)([^\/]*)\/>/;
	return inlineTagRe.exec(text) !== null;
}
function parseInlineTag(text) {
	var inlineTagRe = /(.*)<([^ ]*)([^\/]*)\/>/;
	var attributeRe = /\s?([^"=]*)(=\"([^"]*)\"|())/g;
	var reResult = inlineTagRe.exec(text);
	var previousValue = reResult[1];
	var tagName = reResult[2];
	var attribute = reResult[3];
	var attrs = parseAttributes(attribute);
	return {
		name: tagName,
		attrs: attrs,
		previousValue: previousValue
	};
}

module.exports = {
	parseStartTag: parseStartTag,
	isEndTag: isEndTag,
	parseEndTag: parseEndTag,
	parseValueEndTag: parseValueEndTag,
	isStartTag: isStartTag,
	isEndWithTag: isEndWithTag,
	isInlineTag: isInlineTag,
	parseInlineTag: parseInlineTag
};
/*
var startTag = parseStartTag('<?name attr1="asadasd" aaa>');
console.log(startTag);

console.log(isEndWithTag('script', '<></script>'));
console.log(isEndWithTag('script', '<script>function foo() {return 1 < 2;}var testStr = "</script>'));
*/
//var endTag = parseEndTag('abcdefg\nasdsad</abcde>');
//console.log(endTag);
//console.log(isEndWithTag('div', '</div>'));