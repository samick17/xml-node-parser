(function() {

    const fs = require('fs');
    const XmlUtility = require('./xml-utility');
    /**/
    function XmlNode() {
        this.name = '';
        this.attrs = {};
        this.value = '';
        this.children = [];
    }

    XmlNode.prototype.appendChild = function(xmlNode) {
        this.children.push(xmlNode);
    };
    XmlNode.prototype.addAttribute = function(key, value) {
        this.attrs[key] = value;
    };
    XmlNode.prototype.setName = function(name) {
        this.name = name;
    };
    XmlNode.prototype.setAttributes = function(attrs) {
        for(var key in attrs) {
            var value = attrs[key];
            this.addAttribute(key, value);
        }
    };
    XmlNode.prototype.setValue = function(value) {
        var typeofValue = typeof value;
        switch(typeofValue) {
            case 'string':
            this.value = value.trim();
            break;
            default:
            this.value = '';
            break;
        }
    };
    XmlNode.prototype.attributeToString = function() {
        var arr = [];
        for(var key in this.attrs) {
            var val = this.attrs[key];
            if(val) {
                arr.push(`${key}="${val}"`);
            } else {
                arr.push(`${key}`);
            }
        }
        return arr.join(' ');
    };
    XmlNode.prototype.forEach = function(callback) {
        for(var i in this.children) {
            callback(this.children[i], parseInt(i));
        }
    };
    XmlNode.prototype.toString = function(prefix) {
        var text = '';
        prefix = prefix || '';
        var attrText = this.attributeToString();
        attrText = attrText ? `(${attrText})` : '';
        text += `${prefix}${this.name}${attrText}: ${this.value}\n`;
        prefix += '  ';
        this.forEach((child) => {
            text += child.toString(prefix);
        });
        return text;
    };
    XmlNode.prototype.toStartString = function() {
        var attrText = this.attributeToString();
        attrText = attrText ? ' ' + attrText : '';
        return `<${this.name}${attrText}>`;
    };
    XmlNode.prototype.toEndString = function() {
        return `</${this.name}>`;
    };
    XmlNode.prototype.toXml = function() {
        if(this.children.length || this.value) {
            return this.toStartString() + this.value + this.children.map((child) => {
                return child.toXml();
            }).join('') + this.toEndString();
        } else {
            var attrText = this.attributeToString();
            attrText = attrText ? ' ' + attrText : '';
            return `<${this.name}${attrText}/>`;
        }
    };
    /**/
    function XmlParser() {
        var rootHandler = this.createHandler();
        var pivotHandler = rootHandler.appendChild();
        this.pivotHandler = pivotHandler;
        
    };
    XmlParser.prototype.createHandler = function() {
        var handler = new XmlNodeHandler();
        handler.parser = this;
        return handler;
    };
    XmlParser.prototype.handle = function(ch) {
        this.pivotHandler.handle(ch);
    };
    XmlParser.prototype.write = function(text) {
        for(var i in text) {
            var ch = text[i];
            this.handle(ch);
        }
    };
    XmlParser.prototype.setPivot = function(pivot) {
        this.pivotHandler = pivot;
    };
    XmlParser.prototype.getPivot = function() {
        return this.pivotHandler;
    };
    XmlParser.prototype.toString = function() {
        return this.pivotHandler.toString();
    };
    XmlParser.prototype.getNodes = function() {
        return this.pivotHandler.getNodes();
    };
    /**/
    function XmlNodeHandler() {
        this.symbol = '';
        this.symbolQuote = '';
        this.name = '';
        this.attrs = {};
        this.value = '';
        this.children = [];
        this.chunks = {};
        this.chunkKey = 'default';
        this.chunk = '';
        this.isStartTag = true;
        this.isStartValue = false;
        this.isEndTag = false;
        this.node = new XmlNode();
    }
    XmlNodeHandler.prototype.appendChunk = function(ch) {
        if(!(this.chunkKey in this.chunks)) {
            this.chunks[this.chunkKey] = '';
        }
        this.chunks[this.chunkKey] += ch;
    };
    XmlNodeHandler.prototype.appendChild = function() {
        var child = this.parser.createHandler();
        child.parent = this;
        this.children.push(child);
        return child;
    };
    XmlNodeHandler.prototype.setName = function(name) {
        this.name = name;
    };
    XmlNodeHandler.prototype.setValue = function(value) {
        this.value = value;
    };
    XmlNodeHandler.prototype.handle = function(ch) {
        switch(ch) {
            case '>':
            this.chunk += ch;
            var pivot = this.parser.getPivot();
            if(XmlUtility.isInlineTag(this.chunk)) {
                var inlineTag = XmlUtility.parseInlineTag(this.chunk);
                var node = new XmlNode();
                node.setName(inlineTag.name);
                node.setValue(inlineTag.value);
                node.setAttributes(inlineTag.attrs);
                pivot.setValue(inlineTag.previousValue);
                pivot.node.appendChild(node);
                this.chunk = '';
            } else if(pivot && pivot.name && XmlUtility.isEndWithTag(pivot.name, this.chunk)) {
                var endTag = XmlUtility.parseValueEndTag(this.chunk);
                pivot.node.setValue(endTag.value || this.value);
                this.parser.setPivot(pivot.parent);
                pivot.parent.node.appendChild(pivot.node);
                this.chunk = '';
            } else if(XmlUtility.isStartTag(this.chunk)) {
                var startTag = XmlUtility.parseStartTag(this.chunk);
                var value = startTag.previousValue;
                pivot.setValue(value);
                var childHandler = pivot.appendChild();
                this.parser.setPivot(childHandler);
                childHandler.node.setName(startTag.name);
                childHandler.node.setAttributes(startTag.attrs);
                childHandler.setName(startTag.name);
                this.chunk = '';
            }
            break;
            case '\r':
            case '\n':
            break;
            default:
            this.chunk += ch;
            break;
        }
    };
    XmlNodeHandler.prototype.toString = function() {
        return this.node.children.map((child) => {
            return child.toString();
        }).join('\n');
    };
    XmlNodeHandler.prototype.getNodes = function() {
        return this.node.children;
    };

    function createParser() {
        return new XmlParser();
    }

    module.exports = {
        parseFromText: function(xmlText) {
            var parser = createParser();
            parser.write(xmlText);
            return parser.getNodes();
        },
        parseFromFile: function(filePath) {
            return new Promise((resolve, reject) => {
                if(fs.exists(filePath, (isExists) => {
                    if(isExists) {
                        var parser = createParser();
                        var rs = fs.createReadStream(filePath);
                        rs.on('data', (data) => {
                            parser.write(data.toString());
                        });
                        rs.on('end', (data) => {
                            resolve(parser.getNodes());
                        });
                    } else {
                        reject(new Error('File not found!'));
                    }
                }));
            });
        }
    }
})();
