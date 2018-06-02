(function() {

    const fs = require('fs');
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
            arr.push(`${key}="${val}"`);
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
        this.chunk += ch;
        switch(ch) {
            case '<':
            this.chunk = '<';
            if(this.symbol === '') {
                this.symbol += ch;
                this.chunkKey = 'name';
            }
            break;
            case '/':
            if(this.symbol === '<' && this.chunkKey !== 'attrValue') {
                this.symbol += ch;
                this.isInline = this.chunk !== '</';
            } else {
                this.appendChunk(ch);
            }
            break;
            case '>':
            var result = this.symbol + ch;
            switch(result) {
                case '<>':
                this.chunkKey = 'value';
                var pivot = this.parser.getPivot();
                pivot.setValue(this.chunks.default || this.value);
                this.chunks.name = '';
                this.symbol = '';
                var childHandler = pivot.appendChild();
                this.parser.setPivot(childHandler);
                break;
                case '</>':
                var pivot = this.parser.getPivot();
                pivot.setName(this.chunks.name || this.name);
                pivot.setValue(this.chunks.default || this.value);
                this.chunks.name = '';
                this.symbol = '';
                if(this.isInline) {
                    var inlineHandler = pivot.appendChild();
                    inlineHandler.node.setName(this.name);
                    inlineHandler.node.setValue(this.value);
                    pivot.node.appendChild(inlineHandler.node);
                    for(var key in pivot.attrs) {
                        var value = pivot.attrs[key];
                        inlineHandler.node.addAttribute(key, value);
                    }
                    pivot.attrs = {};
                } else {
                    pivot.node.setName(this.name);
                    pivot.node.setValue(this.value);
                    this.parser.setPivot(pivot.parent);
                    pivot.parent.node.appendChild(pivot.node);
                    for(var key in pivot.parent.attrs) {
                        var value = pivot.parent.attrs[key];
                        pivot.node.addAttribute(key, value);
                    }
                    pivot.parent.attrs = {};
                }
                break;
            }
            break;
            case ' ':
            if(this.symbol === '<') {
                this.chunkKey = 'attr';
            } else {
                this.appendChunk(ch);
            }
            break;
            case '=':
            if(this.symbol === '<') {
            } else {
                this.appendChunk(ch);
            }
            break;
            case '"':
            this.symbolQuote += ch;
            if(this.symbol === '<') {
                if(this.symbolQuote === '"') {
                    this.chunkKey = 'attrValue';
                } else if(this.symbolQuote === '""') {
                    var attrKey = this.chunks.attr;
                    var attrValue = this.chunks.attrValue;
                    this.chunks.attr = '';
                    this.chunks.attrValue = '';
                    this.symbolQuote = '';
                    this.attrs[attrKey] = attrValue;
                } else {
                    this.appendChunk(ch);
                }
            } else {
                this.appendChunk(ch);
            }
            break;
            default:
            this.appendChunk(ch);
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
