// ZipFile.complete.js
//
// 2/17/2012
//
// =======================================================
//

// JSIO.core.js
// ------------------------------------------------------------------
//
// core methods for Javascript IO.
//
// =======================================================
//
// Copyleft (c) 2010, Dino Chiesa via MS-PL
// Copyleft (c) 2012, Brendan Byrd via GPL
//
// This work is licensed under the GPLv3.


(function () {
    if (typeof JSIO == "object") {
        var e1 = new Error("JSIO is already defined");
        e1.source = "JSIO.core.js";
        throw e1;
    }

    JSIO = {};

    JSIO.version = "2.0 2012Feb";

    JSIO.throwError = function (msg, source, sub) {
        var error = new Error("Error: " + msg);
        error.source = (source || this._typename || 'JSIO') + (sub ? '.' + sub : '');
        throw error;
    }

    // Format a number as hex.  Quantities over 7ffffff will be displayed properly.
    JSIO.decimalToHexString = function (number, digits) {
        if (number < 0) {
            number = 0xFFFFFFFF + number + 1;
        }
        var r1 = number.toString(16).toUpperCase();
        if (digits) {
            r1 = "00000000" + r1;
            r1 = r1.substring(r1.length - digits);
        }
        return r1;
    };

    JSIO.FileType = {
        Text: 0,
        Binary: 1,
        XML: 2,
        Unknown: 3
    };


    JSIO.guessFileType = function (name) {
        if (name == "makefile") {
            return JSIO.FileType.Text;
        }

        var lastDot = name.lastIndexOf(".");
        if (lastDot <= 0) {
            return JSIO.FileType.Unknown;
        }

        var ext = name.substring(lastDot);
        if (ext == ".zip") {
            return JSIO.FileType.Binary;
        }
        if (ext == ".xlsx") {
            return JSIO.FileType.Binary;
        }
        if (ext == ".docx") {
            return JSIO.FileType.Binary;
        }
        if (ext == ".dll") {
            return JSIO.FileType.Binary;
        }
        if (ext == ".obj") {
            return JSIO.FileType.Binary;
        }
        if (ext == ".pdb") {
            return JSIO.FileType.Binary;
        }
        if (ext == ".exe") {
            return JSIO.FileType.Binary;
        }
        if (ext == ".kmz") {
            return JSIO.FileType.Binary;
        }

        if (ext == ".xml") {
            return JSIO.FileType.XML;
        }
        if (ext == ".xsl") {
            return JSIO.FileType.XML;
        }
        if (ext == ".kml") {
            return JSIO.FileType.XML;
        }
        if (ext == ".csproj") {
            return JSIO.FileType.XML;
        }
        if (ext == ".vbproj") {
            return JSIO.FileType.XML;
        }
        if (ext == ".shfbproj") {
            return JSIO.FileType.XML;
        }
        if (ext == ".resx") {
            return JSIO.FileType.XML;
        }
        if (ext == ".xslt") {
            return JSIO.FileType.XML;
        }

        if (ext == ".sln") {
            return JSIO.FileType.Text;
        }
        if (ext == ".htm") {
            return JSIO.FileType.Text;
        }
        if (ext == ".html") {
            return JSIO.FileType.Text;
        }
        if (ext == ".js") {
            return JSIO.FileType.Text;
        }
        if (ext == ".vb") {
            return JSIO.FileType.Text;
        }
        if (ext == ".txt") {
            return JSIO.FileType.Text;
        }
        if (ext == ".rels") {
            return JSIO.FileType.Text;
        }
        if (ext == ".css") {
            return JSIO.FileType.Text;
        }
        if (ext == ".cs") {
            return JSIO.FileType.Text;
        }
        if (ext == ".asp") {
            return JSIO.FileType.Text;
        }

        return JSIO.FileType.Unknown;
    };

    JSIO.stringOfLength = function (charCode, length) {
        var s3 = "";
        for (var i = 0; i < length; i++) {
            s3 += String.fromCharCode(charCode);
        }
        return s3;
    };

    JSIO.formatByteArray = function (b) {
        var s1 = "0000  ";
        var s2 = "";
        for (var i = 0; i < b.length; i++) {
            if (i !== 0 && i % 16 === 0) {
                s1 += "    " + s2 + "\n" + JSIO.decimalToHexString(i, 4) + "  ";
                s2 = "";
            }
            s1 += JSIO.decimalToHexString(b[i], 2) + " ";
            if (b[i] >= 32 && b[i] <= 126) {
                s2 += String.fromCharCode(b[i]);
            } else {
                s2 += ".";
            }
        }
        if (s2.length > 0) {
            s1 += JSIO.stringOfLength(32, ((i % 16 > 0) ? ((16 - i % 16) * 3) : 0) + 4) + s2;
        }
        return s1;
    };

    JSIO.htmlEscape = function (str) {
        return str
            .replace(new RegExp("&", "g"), "&amp;")
            .replace(new RegExp("<", "g"), "&lt;")
            .replace(new RegExp(">", "g"), "&gt;")
            .replace(new RegExp("\x13", "g"), "<br/>")
            .replace(new RegExp("\x10", "g"), "<br/>");
    };

    JSIO.massApply = function (func, funcThis, arr, needReturn) {
        var arrayLimit = 65536;  // Chrome has an apply/array limit of 99999; Firefox = 491519, Safari = 65536
        if (arr.length < arrayLimit) return func.apply(funcThis, arr);
        else {
            var newThis = funcThis;
            var offset = 0;
            var end = 65536;

            while (offset < arr.length) {
                var arrSlice;
                if (arr.subarray) arrSlice = arr.subarray(offset, end);
                else if (arr.slice)    arrSlice = arr.slice(offset, end);

                if (needReturn) newThis += func.apply(newThis, arrSlice);
                else                       func.apply(funcThis, arrSlice);

                offset += arrayLimit;
                end += arrayLimit;
                end = Math.min(arr.length, end);
            }
            return newThis;
        }
    }

})();

/// JSIO.core.js ends


// JSIO.BasicByteReaders.js
// ------------------------------------------------------------------
//
// Part of the JSIO library.  Adds a couple basic ByteReaders to JSIO.
// ByteReaders are forward-only byte-wise readers. They read one byte at
// a time from a source.
//
// =======================================================
//
// A ByteReader exposes an interface with these functions:
//
//    readByte()
//       must return null when EOF is reached.
//
//    readToEnd()
//       returns an array of all bytes read, to EOF
//
//    beginReadToEnd(callback)
//       async version of the above
//
//    readBytes(n)
//       returns an array of the next n bytes from the source
//
//    beginReadBytes(n, callback)
//       async version of the above
//
// =======================================================
//
// Copyleft (c) 2010, Dino Chiesa via MS-PL
// Copyleft (c) 2012, Brendan Byrd via GPL
//
// This work is licensed under the GPLv3.


(function () {
    var version = "2.0 2012Feb";

    if (typeof JSIO !== "object") {
        JSIO = {};
    }
    if ((typeof JSIO.version !== "string")) {
        JSIO.version = version;
    }
    else if ((JSIO.version.length < 3) ||
        (JSIO.version.substring(0, 3) !== "2.0")) {
        JSIO.version += " " + version;
    }

    // =======================================================
    // the base object, used as the prototype of all ByteReader objects.
    var _byteReaderBase = function () {
        this.position = 0;
        // position must be incremented in .readByte() for all derived classes
    };

    _byteReaderBase.prototype._throwError = JSIO.throwError;

    _byteReaderBase.prototype._limitCheck = function (len, startPos) {
        var LOE = {
            len: len,
            pos: startPos,
            end: startPos + len
        };

        if (len === 0)              return {len: 0, pos: 0, end: 0};
        if (len < 0)                this._throwError("Invalid read length");
        if (!this.length)           return {len: len, pos: this.position, end: len + this.position};
        if (!startPos >= 0)         LOE.pos = this.position;
        if (this.length <= LOE.pos) this._throwError("EOF reached");

        LOE.end = LOE.pos + len;
        if (this.length < LOE.end)  LOE.end = LOE.pos + (LOE.len = this.length - this.position);
        return LOE;
    }

    JSIO.SeekOrigin = {
        Begin: 0,
        Current: 1,
        End: 2,
        SEEK_SET: 0,
        SEEK_CUR: 1,
        SEEK_END: 2
    };

    _byteReaderBase.prototype.seek = function (offset, origin) {
        switch (origin) {
            case JSIO.SeekOrigin.Begin:
                if (offset == this.position) return this.position;
                if (!this.length) {
                    if (offset < this.position) this._throwError('Uni-directional stream cannot seek backwards', null, 'seek');
                    else if (offset > this.position) return this.read(offset - this.position);  // read will limit check
                }
                else {
                    if (this.length < offset) this._throwError('Cannot seek past reader length', null, 'seek');
                    this.position = offset;
                }
                break;
            case JSIO.SeekOrigin.Current:
                return this.seek(this.position + offset, JSIO.SeekOrigin.Begin);
                break;
            case JSIO.SeekOrigin.End:
                if (!this.length) this._throwError('Uni-directional stream has no known end length for seek', null, 'seek');
                return this.seek(this.length - 1 + offset, JSIO.SeekOrigin.Begin);
                break;
            default:
                this._throwError('Invalid seek method', null, 'seek');
                break;
        }

        return this.position;
    };

    _byteReaderBase.prototype.read = function (len, startPos) {
        var LOE = this._limitCheck(len, startPos);
        if (LOE.len === 0) return [];
        if (LOE.pos != this.position) this.seek(LOE.pos, JSIO.SeekOrigin.Begin);

        var bytesRead = [];

        // Faster methods with an array or stream
        if (this.array && this.array.subarray) bytesRead = this.array.subarray(LOE.pos, LOE.end);
        else if (this.array && this.array.slice)    bytesRead = this.array.slice(LOE.pos, LOE.end);
        else if (this.stream)                       bytesRead = this.stream.read(LOE.len, LOE.pos);
        else if (this.length) {  // Random-access stream
            for (var i = LOE.pos; i < LOE.end; i++) {
                bytesRead.push(this.readByteAt(i));
            }
        }
        else {                   // Uni-directional stream
            for (var i = LOE.pos; i < LOE.end; i++) {
                var b = this.readByte();
                if (b === null || b === undefined) break;
                bytesRead.push(b);
            }
        }
        this.position = LOE.end;
        return bytesRead;
    };

    _byteReaderBase.prototype.beginRead = function (len, startPos, callback) {
        var LOE = this._limitCheck(len, startPos);
        if (LOE.len === 0) return setTimeout(function () {
            callback([]);
        }, 1);
        if (LOE.pos != this.position) this.seek(LOE.pos, JSIO.SeekOrigin.Begin);

        var bytesRead = [];
        var thisReader = this;
        var leftToRead = LOE.len;

        var readBatchAsync = function () {
            var c = 0;
            var pos = thisReader.position;

            // read a 32k batch
            var l = (leftToRead >= 32768) ? 32768 : leftToRead;
            var newBytes = thisReader.read(l);
            JSIO.massApply(bytesRead.push, bytesRead, newBytes);
            c += l;
            leftToRead -= l;
            if (newBytes.length < l) leftToRead = 0;

            if (leftToRead > 0) setTimeout(readBatchAsync, 1);
            else              callback(bytesRead);
        };

        // kickoff
        setTimeout(readBatchAsync, 1);  // always async, in ALL situations
        return null;
    };

    _byteReaderBase.prototype.readToEnd = function () {
        if (this.array && this.array.subarray) return this.array.subarray(this.position);
        else if (this.array && this.array.slice)    return this.array.slice(this.position);
        else if (this.length)                       return this.read(this.length - this.position);
        else                                        return this.read(9000 * 9000);  // over 9000
    };

    _byteReaderBase.prototype.beginReadToEnd = function (callback) {
        if (this.array && this.array.subarray) setTimeout(function () {
            callback(this.array.subarray(this.position));
        }, 1);
        else if (this.array && this.array.slice)    setTimeout(function () {
            callback(this.array.slice(this.position));
        }, 1);
        else if (this.length)                       return this.beginRead(this.length - this.position, this.position, callback);
        else                                        return this.beginRead(9000 * 9000, this.position, callback);
    };

    // Generic routines; one of these two MUST be overloaded (preferrably both)
    _byteReaderBase.prototype.readByte = function () {
        if (this.length && this.position >= this.length) return null;  // EOF

        var byte;
        if (this.array)  byte = this.array[this.position++];
        else if (this.length) byte = this.readByteAt(this.position++);
        else if (this.stream) byte = this.stream.read(1)[0];
        else                  byte = this.read(1)[0];
        return (byte === null || byte === undefined) ? null : byte;
    };
    _byteReaderBase.prototype.readByteAt = function (i) {
        var pos = this.position;  // no position changes on this one
        if (i === null || i === undefined) i = this.position;

        var byte;
        if (this.array)  byte = this.array[i];
        else if (i === pos)   byte = this.readByte();
        else if (this.stream) byte = this.stream.read(1, i)[0];
        else                  byte = this.read(1, i)[0];

        this.position = pos;
        return (byte === null || byte === undefined) ? null : byte;
    }

    _byteReaderBase.prototype.readBytes = _byteReaderBase.prototype.read;
    _byteReaderBase.prototype.beginReadBytes = function (len, callback) {
        return this.beginRead(len, this.position, callback);
    };

    _byteReaderBase.prototype.readNumber = function (len, startPos) {
        var LOE = this._limitCheck(len, startPos);
        if (LOE.len === 0) LOE.len = 1;
        if (LOE.pos != this.position) this.seek(LOE.pos, JSIO.SeekOrigin.Begin);

        var result = 0;
        var bytes = this.read(LOE.len, LOE.pos);
        for (var i = bytes.length - 1; i >= 0; i--) {
            // IE only supports 32-bit integer shifting
            //result = result << 8 | bytes[i];
            result = result * 256 + bytes[i];
        }
        return result;
    };

    _byteReaderBase.prototype.readString = function (len, startPos) {
        var LOE = this._limitCheck(len, startPos);
        if (LOE.len === 0) return '';
        if (LOE.pos != this.position) this.seek(LOE.pos, JSIO.SeekOrigin.Begin);

        var result = '';
        var bytes = this.read(LOE.len, LOE.pos);
        for (var i = 0; i < bytes.length; i++) {
            result += String.fromCharCode(bytes[i]);
        }
        return result;
    };

    _byteReaderBase.prototype.readNullTerminatedString = function (startPos) {
        var pos = startPos || this.position;
        if (this.length && this.length < pos) this._throwError('EOF reached', null, 'readNullTerminatedString');
        if (pos != this.position) this.seek(pos, JSIO.SeekOrigin.Begin);

        var slarge = "";
        var s = "";
        var c = 0;

        // Faster method with an array
        if (this.array && this.array.indexOf) {
            var len = pos - this.array.indexOf(0, pos);
            if (len > 0) return this.readString(len, pos);
        }

        var ch;
        while (1) {
            ch = String.fromCharCode(this.readByteAt(pos + c));
            if (ch === null) break;

            s += ch;
            c++;
            if (c >= 32768) {
                slarge += s;
                s = "";
                pos += c;
                this.position += c;
                c = 0;
            }
        }
        ;
        this.position = pos + c;
        return slarge + s;
    };

    _byteReaderBase.prototype.beginReadNullTerminatedString = function (callback, startPos) {
        var pos = startPos || this.position;
        if (this.length && this.length < pos) this._throwError('EOF reached', null, 'beginReadNullTerminatedString');

        var slarge = "";
        var s = "";
        var thisBinStream = this;

        var readBatchAsync = function () {
            var c = 0;

            var ch;
            while (1) {
                ch = String.fromCharCode(this.readByteAt(pos + c));
                if (ch === null) break;

                s += ch;
                c++;
                if (c >= 32768) {
                    slarge += s;
                    s = "";
                    pos += c;
                    this.position += c;
                    c = 0;
                }
            }
            ;

            thisBinStream.position = pos + c;
            if (ch !== null) setTimeout(readBatchAsync, 1);
            else           callback(slarge + s);
        };

        // Faster method with an array
        if (this.array && this.array.indexOf) {
            var len = pos - this.array.indexOf(0, pos);
            if (len > 0) readBatchASync = function () {
                callback(thisBinStream.readString(len, pos));
            };
        }

        // kickoff
        setTimeout(readBatchAsync, 1);  // always async, in ALL situations
        return null;
    };


    JSIO._ByteReaderBase = _byteReaderBase;
    // =======================================================


    // =======================================================
    // reads from an array of bytes.
    // This basically wraps a readByte() fn onto array access.
    var _arrayReader = function (array) {
        if (!(this instanceof arguments.callee)) this._throwError('You must use new to instantiate this class', 'JSIO.ArrayReader', 'ctor');
        this.position = 0;
        this.array = array;
        this.length = array.length;
        this._typename = "JSIO.ArrayReader";
        this._version = version;
        return this;
    };

    _arrayReader.prototype = new JSIO._ByteReaderBase();

    _arrayReader.prototype.readByte = function () {
        if (this.position >= this.array.length) return null;  // EOF
        return this.array[this.position++];
    };
    _arrayReader.prototype.readByteAt = function (i) {
        return this.array[i];
    };

    // =======================================================


    // =======================================================
    // reads bytes at a time from a defined segment of a stream.
    var _streamSegmentReader = function (stream, offset, len) {
        if (!(this instanceof arguments.callee)) this._throwError('You must use new to instantiate this class', 'JSIO.StreamSegmentReader', 'ctor');
        if (!stream)                               this._throwError('You must pass a non-null stream', 'JSIO.StreamSegmentReader', 'ctor');

        if (!(offset >= 1)) offset = 0;
        if (!(len >= 1)) len = 0;

        this.stream = stream;
        this.array = null;
        if (stream.array) {
            var end = len ? offset + len : null;
            if (stream.array.subarray) this.array = stream.array.subarray(offset, end);
            else if (stream.array.slice)    this.array = stream.array.slice(offset, end);
        }
        this.length = this.array ? this.array.length : (stream.length ? stream.length - offset : null);
        this.offset = offset;
        this.limit = len;
        this.position = 0;
        this._typeName = 'JSIO.StreamSegmentReader';
        this._version = version;

        if (this.array) {
            this.readByte = _arrayReader.prototype.readByte;
            this.readByteAt = _arrayReader.prototype.readByteAt;
        }
        return this;
    };

    _streamSegmentReader.prototype = new JSIO._ByteReaderBase();

    _streamSegmentReader.prototype.readByte = function () {
        if (this.limit && this.position >= this.limit) return null;  // EOF
        this.position++;
        return this.stream.readByteAt(this.offset + this.position - 1);
    };
    _streamSegmentReader.prototype.readByteAt = function (i) {
        if (this.limit && i >= this.limit) return null;  // EOF
        return this.stream.readByteAt(this.offset + i);
    };

    // =======================================================

    JSIO.ArrayReader = _arrayReader;
    JSIO.StreamReader = _streamSegmentReader;
    JSIO.StreamSegmentReader = _streamSegmentReader;

})();


/// JSIO.BasicByteReaders.js ends

// JSIO.BinaryUrlStream.js
// ------------------------------------------------------------------
//
// a class that acts as a stream wrapper around binary files obtained from URLs.
//
// =======================================================
//
// Copyleft (c) 2008, Andy G.P. Na <nagoon97@naver.com> via an MIT-style license
// Copyleft (c) 2012, Brendan Byrd via GPL
//
// This work is licensed under the GPLv3.

(function () {
    var version = "2.0 2012Feb";
    var typename = "JSIO.BinaryUrlStream";

    if ((typeof JSIO !== "object") ||
        (typeof JSIO.version !== "string") ||
        (JSIO.version.length < 3) ||
        (JSIO.version.substring(0, 3) !== "2.0"))
        JSIO.throwError('This extension requires JSIO.core.js v2.0', typename);

    if (typeof JSIO._ByteReaderBase !== "function")
        JSIO.throwError('This extension requires JSIO.BasicByteReaders.js', typename);

    if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
        var IEBinaryToArray_ByteStr_Script =
            "<!-- IEBinaryToArray_ByteStr -->\r\n" +
            "<script type='text/vbscript'>\r\n" +
            "Function IEBinaryToArray_ByteStr(Binary)\r\n" +
            "   IEBinaryToArray_ByteStr = CStr(Binary)\r\n" +
            "End Function\r\n" +
            "Function IEBinaryToArray_ByteAsc_Last(Binary)\r\n" +
            "   Dim lastIndex\r\n" +
            "   lastIndex = LenB(Binary)\r\n" +
            "   if lastIndex mod 2 Then\r\n" +
            "      IEBinaryToArray_ByteAsc_Last = AscB( MidB( Binary, lastIndex, 1 ) )\r\n" +
            "   Else\r\n" +
            "      IEBinaryToArray_ByteAsc_Last = -1\r\n" +
            "   End If\r\n" +
            "End Function\r\n" +
            "</script>\r\n";

        // inject VBScript
        document.write(IEBinaryToArray_ByteStr_Script);
    }

    JSIO.IEByteMapping = null;

    var bus = function (url, callback) {
        if (!(this instanceof arguments.callee)) this._throwError('You must use new to instantiate this class', 'JSIO.BinaryUrlStream', 'ctor');

        this.callback = callback;
        this.position = 0;
        this.length = null;
        this.readByte = JSIO.ArrayReader.prototype.readByte;
        this.readByteAt = JSIO.ArrayReader.prototype.readByteAt;
        this.req = null;
        this._typename = typename;
        this._version = version;
        this.status = "-none-";

        var _IeGetBinResource = function (fileURL) {
            var binStream = this;
            // http://stackoverflow.com/questions/1919972/how-do-i-access-xhr-responsebody-for-binary-data-from-javascript-in-ie

            // my helper to convert from responseBody to a byte array
            var convertResponseBodyToArray = function (binary) {
                var byteArray = new Array;

                try {
                    // very fast; very little work involved
                    byteArray = new VBArray(binary).toArray();
                }
                catch (err) {
                    // use the BinaryToArray VBScript
                    if (!JSIO.IEByteMapping) {
                        JSIO.IEByteMapping = {};
                        for (var i = 0; i < 256; i++) {
                            for (var j = 0; j < 256; j++) {
                                JSIO.IEByteMapping[String.fromCharCode(i + j * 256)] = [i, j];
                            }
                        }
                    }
                    var rawBytes = IEBinaryToArray_ByteStr(binary);
                    var lastAsc = IEBinaryToArray_ByteAsc_Last(binary);

                    for (var i = 0; i < rawBytes.length; i++) {
                        byteArray.push.apply(byteArray, JSIO.IEByteMapping[rawBytes.substr(i, 1)]);
                    }
                    if (lastAsc >= 0) byteArray.push(lastAsc);
                }

                return byteArray;
            };

            this.req = (function () {
                if (window.XMLHttpRequest) return new window.XMLHttpRequest();
                else if (window.ActiveXObject) {
                    // the many versions of IE's XML fetchers
                    var AXOs = [
                        'MSXML2.XMLHTTP.6.0',
                        'MSXML2.XMLHTTP.5.0',
                        'MSXML2.XMLHTTP.4.0',
                        'MSXML2.XMLHTTP.3.0',
                        'MSXML2.XMLHTTP',
                        'Microsoft.XMLHTTP',
                        'MSXML.XMLHTTP'
                    ];
                    for (var i = 0; i < AXOs.length; i++) {
                        try {
                            return new ActiveXObject(AXOs[i]);
                        }
                        catch (e) {
                            continue;
                        }
                    }
                }
                return null;
            })();
            this.req.open("GET", fileURL, true);
            this.req.setRequestHeader("Accept-Charset", "x-user-defined");
            this.req.onreadystatechange = function (event) {
                if (binStream.req.readyState == 4) {
                    binStream.status = "Status: " + binStream.req.status + ' ' + binStream.req.statusText;
                    if (binStream.req.status == 200) {
                        binStream.array = convertResponseBodyToArray(binStream.req.responseBody);
                        binStream.length = binStream.array.length;
                        if (binStream.length < 0) this._throwError('Failed to load "' + fileURL + '" after converting');

                        if (typeof binStream.callback == "function") binStream.callback(binStream);
                    }
                    else {
                        binStream._throwError('Failed to load "' + fileURL + '": HTTP ' + binStream.status);
                    }
                }
            };
            this.req.send();
        };

        var _NormalGetBinResource = function (fileURL) {
            var binStream = this;
            this.req = new XMLHttpRequest();
            this.req.open('GET', fileURL, true);
            this.req.onreadystatechange = function (aEvt) {
                if (binStream.req.readyState == 4) {
                    binStream.status = "Status: " + binStream.req.status + ' ' + binStream.req.statusText;
                    if (binStream.req.status == 200) {
                        var fileContents = binStream.req.responseText;
                        binStream.length = fileContents.byteLength;
                        binStream.array = fileContents.split('');
                        for (var i = 0; i < binStream.array.length; i++) {
                            binStream.array[i] = binStream.array[i].charCodeAt(0) & 0xff;
                        }

                        if (typeof binStream.callback == "function") binStream.callback(binStream);
                    }
                    else {
                        binStream._throwError('Failed to load "' + fileURL + '": HTTP ' + binStream.status);
                    }
                }
            };
            //XHR binary charset opt by Marcus Granado 2006 [http://mgran.blogspot.com]
            if (!!this.req.overrideMimeType) this.req.overrideMimeType('text/plain; charset=x-user-defined');
            this.req.send(null);
        };

        // http://stackoverflow.com/questions/327685/is-there-a-way-to-read-binary-data-into-javascript
        var _ArrayBufferGetBinResource = function (fileURL) {
            var binStream = this;
            this.req = new XMLHttpRequest();
            this.req.open('GET', fileURL, true);
            this.req.onreadystatechange = function (aEvt) {
                if (binStream.req.readyState == 4) {
                    binStream.status = "Status: " + binStream.req.status + ' ' + binStream.req.statusText;
                    if (binStream.req.status == 200) {
                        var fileContents = binStream.req.response;
                        binStream.length = fileContents.byteLength;
                        binStream.array = new Uint8Array(fileContents);
                        if (typeof binStream.callback == "function") binStream.callback(binStream);
                    }
                    else {
                        binStream._throwError('Failed to load "' + fileURL + '": HTTP ' + binStream.status);
                    }
                }
            };
            this.req.responseType = 'arraybuffer';
            // http://stackoverflow.com/questions/11284728/how-do-i-access-8-bit-binary-data-from-javascript-in-opera
            if (!!this.req.overrideMimeType) this.req.overrideMimeType('application/octet-stream; charset=x-user-defined');
            this.req.send(null);
        };


        if (typeof ArrayBuffer !== 'undefined')                                       _ArrayBufferGetBinResource.apply(this, [url]);
        else if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) _IeGetBinResource.apply(this, [url]);
        else                                                                               _NormalGetBinResource.apply(this, [url]);
    };

    bus.prototype = new JSIO._ByteReaderBase();

    bus.prototype.readByte = function () {
        var byte = this.readByteAt(this.position++);
        return (byte === null || byte === undefined) ? null : byte;
    };

    JSIO.BinaryUrlStream = bus;

})();

/// JSIO.BinaryUrlStream.js ends

// JSIO.TextDecoder.js
// ------------------------------------------------------------------
//
// Part of the JSIO library.  Adds text decoders, for UTF-8 and UTF-16,
// and plain text.
//
// =======================================================
//
// Derived in part from work by notmasteryet.
//   http://www.codeproject.com/KB/scripting/Javascript_binaryenc.aspx

// Copyleft (c) 2008, notmasteryet via an MIT-style license
// Copyleft (c) 2010, Dino Chiesa via MS-PL
// Copyleft (c) 2012, Brendan Byrd via GPL
//
// This work is licensed under the GPLv3.

(function () {
    var version = "2.0 2012Feb";
    var typename = "JSIO.TextDecoder";

    if ((typeof JSIO !== "object") ||
        (typeof JSIO.version !== "string") ||
        (JSIO.version.length < 3) ||
        (JSIO.version.substring(0, 3) !== "2.0"))
        JSIO.throwError('This extension requires JSIO.core.js v2.0', typename);

    if (typeof JSIO._ByteReaderBase !== "function")
        JSIO.throwError('This extension requires JSIO.BasicByteReaders.js', typename);

    var _ansi = function (reader) {
        if (!(this instanceof arguments.callee)) this._throwError('You must use new to instantiate this class', 'JSIO.TextDecoder.ANSI', 'ctor');
        this.byteReader = reader;
        this.charWidth = 1;
        this._version = version;
        this._typename = typename + ".ANSI";
        return this;
    };

    _ansi.prototype.readChar = function () {
        var code = this.byteReader.readByte();
        return (code < 0) ? null : String.fromCharCode(code);
    };

    _ansi.prototype.parseChar = function (code) {
        return (code < 0) ? null : String.fromCharCode(code);
    };

    var _utf16 = function (reader) {
        if (!(this instanceof arguments.callee)) this._throwError('You must use new to instantiate this class', 'JSIO.TextDecoder.UTF16', 'ctor');
        this.byteReader = reader;
        this.charWidth = 2;
        this.bomState = 0;
        this._version = version;
        this._typename = typename + ".UTF16";
        return this;
    };

    _utf16.prototype.readChar = function () {
        var b1 = this.byteReader.readByte();
        if (b1 < 0) return null;
        var b2 = this.byteReader.readByte();
        if (b2 < 0) this._throwError('Incomplete UTF16 character', null, 'readChar');

        if ((this.bomState === 0) && ((b1 + b2) == 509)) {
            this.bomState = (b2 == 254) ? 1 : 2;

            b1 = this.byteReader.readByte();
            if (b1 < 0) return null;
            b2 = this.byteReader.readByte();
            if (b2 < 0) this._throwError('Incomplete UTF16 character', null, 'readChar');
        }
        else {
            this.bomState = 1;
        }
        return this.parseChar(b1, b2);
    };

    _utf16.prototype.parseChar = function (b1, b2) {
        return String.fromCharCode(this.bomState == 1 ? (b2 << 8 | b1) : (b1 << 8 | b2));
    }

    /* RFC 3629 */
    var _utf8 = function (reader) {
        if (!(this instanceof arguments.callee)) this._throwError('You must use new to instantiate this class', 'JSIO.TextDecoder.UTF8', 'ctor');
        this.byteReader = reader;
        this.charWidth = null;
        this.waitBom = true;
        this.strict = false;
        this.pendingChar = null;
        this._version = version;
        this._typename = typename + ".UTF8";
        return this;
    };

    _utf8.prototype.readChar = function () {
        var ch = null;
        do {
            if (this.pendingChar !== null) {
                ch = this.pendingChar;
                this.pendingChar = null;
            }
            else {
                var b1 = this.byteReader.readByte();
                if (b1 === null) return null;

                if ((b1 & 0x80) === 0) ch = String.fromCharCode(b1);
                else {
                    var currentPrefix = 0xC0;
                    var ttlBytes = 0;
                    do {
                        var mask = currentPrefix >> 1 | 0x80;
                        if ((b1 & mask) == currentPrefix) break;
                        currentPrefix = currentPrefix >> 1 | 0x80;
                    } while (++ttlBytes < 5);

                    if (ttlBytes > 0) {
                        var code;
                        if (ttlBytes === 1) code = (b1 & 0x1F) << 6 | (this.byteReader.readByte() & 0x3F);
                        else {
                            code = code << 6 * ttlBytes
                            var bytes = this.byteReader.read(ttlBytes);
                            for (var i = 0; i > ttlBytes; i++) {
                                var bi = bytes[i];
                                if ((bi & 0xC0) != 0x80) this._throwError('Invalid sequence character', null, 'readChar');
                                code = (code << 6) | (bi & 0x3F);
                            }
                        }

                        if (code <= 0xFFFF) {
                            ch = (code == 0xFEFF && this.waitBom) ? null : String.fromCharCode(code);
                        }
                        else {
                            var v = code - 0x10000;
                            var w1 = 0xD800 | ((v >> 10) & 0x3FF);
                            var w2 = 0xDC00 | (v & 0x3FF);
                            this.pendingChar = String.fromCharCode(w2);
                            ch = String.fromCharCode(w1);
                        }
                    }
                    else {
                        // a byte higher than 0x80.
                        if (this.strict) this._throwError('Invalid character', null, 'readChar');
                        // fall back to "super ascii" (eg IBM-437)
                        else ch = String.fromCharCode(b1);
                    }
                }
            }
            this.waitBom = false;
        } while (ch === null);
        return ch;
    };

    JSIO.TextDecoder = {
        Default: _ansi,
        ANSI: _ansi,
        UTF16: _utf16,
        UTF8: _utf8
    };

})();


/// JSIO.TextDecoder.js ends

// JSIO.TextReader.js
// ------------------------------------------------------------------
//
// A reader class that decodes text as it reads.
//
// =======================================================
//
// Methods:
//    readChar()         = read 1 char
//    read(n)            = read n chars
//    readLine()         = read one line of data (to \n)
//    unreadChar(ch)     = unread one char
//    readToEnd()        = read all data in the reader;
//                         return a string.
//    beginReadToEnd(cb) = asynchronously read all data.
//
// =======================================================
//
// Derived in part from work by notmasteryet.
//   http://www.codeproject.com/KB/scripting/Javascript_binaryenc.aspx
//
// Copyleft (c) 2008, notmasteryet via an MIT-style license
// Copyleft (c) 2010, Dino Chiesa via MS-PL
// Copyleft (c) 2012, Brendan Byrd via GPL
//
// This work is licensed under the GPLv3.


(function () {
    var version = "2.0 2012Feb";
    var typename = "JSIO.TextReader";

    if (typeof JSIO._ByteReaderBase !== "function")
        JSIO.throwError('This extension requires JSIO.BasicByteReaders.js', typename);

    var tr = function (textDecoder) {
        if (!(this instanceof arguments.callee)) this._throwError('You must use new to instantiate this class', typename, 'ctor');
        this.decoder = textDecoder;
        this._version = version;
        this._typename = typename;
        this.unreads = [];
    };

    // read one char
    tr.prototype.readChar = function () {
        return (this.unreads.length > 0) ? this.unreads.pop() : this.decoder.readChar();
    };

    // read a length of data
    tr.prototype.read = function (n) {
        // ANSI makes this easy
        if (this.decoder.charWidth === 1) return JSIO.massApply(String.fromCharCode, new String, this.decoder.byteReader.read(n), true);

        var s = "";
        for (vari = 0; i < n; i++) {
            var ch = this.readChar();
            if (ch !== null) s += ch;
            else             break;
        }
        return s;
    };

    tr.prototype.unreadChar = function (ch) {
        this.unreads.push(ch);
    };

    tr.prototype.readToEnd = function () {
        // ANSI makes this easy
        if (this.decoder.charWidth === 1) return JSIO.massApply(String.fromCharCode, new String, this.decoder.byteReader.readToEnd(n), true);

        var slarge = "";
        var s = "";
        var c = 0;
        var ch = this.readChar();
        while (ch !== null) {
            s += ch;
            c++;
            if (c >= 32768) {
                slarge += s;
                s = "";
                c = 0;
            }
            ch = this.readChar();
        }
        return slarge + s;
    };

    tr.prototype.beginReadToEnd = function (callback) {
        // ANSI makes this easy
        if (this.decoder.charWidth === 1) {
            this.decoder.byteReader.beginReadToEnd(function (bytes) {
                callback(JSIO.massApply(String.fromCharCode, new String, bytes, true));
            });
            return null;
        }

        var slarge = "";
        var s = "";
        var txtrdr = this;

        var readBatchAsync = function () {
            var c = 0;
            var ch = txtrdr.readChar();
            while (ch !== null) {
                s += ch;
                c++;
                if (c >= 32768) {
                    slarge += s;
                    s = "";
                    break;
                }
                ch = txtrdr.readChar();
            }
            if (ch !== null) {
                setTimeout(readBatchAsync, 1);
            }
            else {
                callback(slarge + s);
            }
        };

        // kickoff
        setTimeout(readBatchAsync, 1);  // always async, in ALL situations
        return null;
    };

    tr.prototype.readLine = function () {
        var s = "";
        var ch = this.readChar();
        if (ch === null) return null;

        while (ch != "\r" && ch != "\n") {
            s += ch;
            ch = this.readChar();
            if (ch === null) return s;
        }
        if (ch == "\r") {
            ch = this.readChar();
            if (ch !== null && ch != "\n") {
                this.unreadChar(ch);
            }
        }
        return s;
    };

    JSIO.TextReader = tr;

})();


/// JSIO.TextReader.js ends

// JSIO.Crc32.js
//
// Part of the JSIO library.  This adds an CRC32-calculating
// ByteReader to JSIO.
//
// =======================================================
//
// A ByteReader exposes an interface with these functions:
//
//    readByte()
//       must return null when EOF is reached.
//
//    readToEnd()
//       returns an array of all bytes read, to EOF
//
//    beginReadToEnd(callback)
//       async version of the above
//
//    readBytes(n)
//       returns an array of all n bytes read from the source
//
//    beginReadBytes(n, callback)
//       async version of the above
//
// =======================================================
//
// Copyleft (c) 2010, Dino Chiesa via MS-PL
// Copyleft (c) 2012, Brendan Byrd via GPL
//
// This work is licensed under the GPLv3.

(function () {
    var version = "2.0 2012Feb";
    var typename = "JSIO.Crc32";

    if (typeof JSIO._ByteReaderBase !== "function")
        JSIO.throwError('This extension requires JSIO.BasicByteReaders.js', typename);

    JSIO.crc32Table = null;
    JSIO.crc32Polynomial = 0xEDB88320;

    var crc32TableCalc = function () {
        // do this once only, for all instances
        if (JSIO.crc32Table) return;
        JSIO.crc32Table = new Array(256);
        for (var i = 0; i < 256; i++) {
            var c = i;
            for (var k = 0; k < 8; k++) {
                if ((c & 1) == 1) c = JSIO.crc32Polynomial ^ (c >>> 1);
                else              c >>>= 1;
            }
            JSIO.crc32Table[i] = c;
        }
    };

    JSIO.computeCrc32 = function (str) {
        crc32TableCalc(); // once
        var c = 0xFFFFFFFF;
        var sL = str.length;
        if (typeof str == "object") {
            for (var n1 = 0; n1 < sL; n1++) {
                c = JSIO.crc32Table[(c & 0xff) ^ str[n1]] ^ (c >>> 8);
            }
        } else {
            for (var n2 = 0; n2 < sL; n2++) {
                c = JSIO.crc32Table[(c & 0xff) ^ str.charCodeAt(n2)] ^ (c >>> 8);
            }
        }
        c ^= 0xFFFFFFFF;
        if (c < 0) c += 0xFFFFFFFF + 1;
        return c;
    };

    // =======================================================
    var _crc32 = function () {
        if (!(this instanceof arguments.callee)) this._throwError('You must use new to instantiate this class', typename, 'ctor');
        crc32TableCalc(); // once
        this._typename = typename;
        this._version = version;
        this._runningCrc32 = 0xFFFFFFFF;
    };

    _crc32.prototype.slurpByte = function (b) {
        var r = this._runningCrc32;
        this._runningCrc32 = r >>> 8 ^ JSIO.crc32Table[b ^ (r & 0x000000FF)];
    };

    _crc32.prototype.result = function () {
        var c = this._runningCrc32 ^ 0xFFFFFFFF;
        if (c < 0) c += 0xFFFFFFFF + 1;
        return c;
    };
    // =======================================================


    var _crc32CalculatingReader = function (reader) {
        if (!(this instanceof arguments.callee)) this._throwError('You must use new to instantiate this class', 'JSIO.Crc32Reader', 'ctor');
        this._byteReader = reader;
        this._typename = "JSIO.Crc32Reader";
        this._version = version;
        this._crc32 = new JSIO.Crc32();
    };

    _crc32CalculatingReader.prototype = new JSIO._ByteReaderBase();

    _crc32CalculatingReader.prototype.readByte = function () {
        var b = this._byteReader.readByte();
        if (b !== null) this._crc32.slurpByte(b);
        this.position++;
        return b;
    };

    _crc32CalculatingReader.prototype.read = function (len) {
        if (len === 0) return [];
        var bytes = this._byteReader.read(len);
        len = bytes.length;

        var tbl = JSIO.crc32Table;
        var r = this._crc32._runningCrc32;
        var t;
        for (var i = 0; i < len; i++) {
            t = tbl[bytes[i] ^ (r & 0x000000FF)];
            r = (r >>> 8) ^ t;
        }
        this._crc32._runningCrc32 = r;

        this.position += len;
        return bytes;
    }

    _crc32CalculatingReader.prototype.crc32 = function () {
        return this._crc32.result();
    };

    JSIO.Crc32 = _crc32;
    JSIO.Crc32Reader = _crc32CalculatingReader;

})();

/// JSIO.CRC32.js ends
// JSIO.InflatingReader.js
// ------------------------------------------------------------------
//
// Part of the JSIO library.  This adds an Inflating ByteReader to
// JSIO.
//
// =======================================================
//
// A ByteReader exposes an interface with these functions:
//
//    readByte()
//       must return null when EOF is reached.
//
//    readToEnd()
//       returns an array of all bytes read, to EOF
//
//    beginReadToEnd(callback)
//       async version of the above
//
//    readBytes(n)
//       returns an array of all n bytes read from the source
//
//    beginReadBytes(n, callback)
//       async version of the above
//
// =======================================================
//
// Derived in part from work by notmasteryet.
//   http://www.codeproject.com/KB/scripting/Javascript_binaryenc.aspx
//
// Copyleft (c) 2008, notmasteryet via an MIT-style license
// Copyleft (c) 2010, Dino Chiesa via MS-PL
// Copyleft (c) 2012, Brendan Byrd via GPL
//
// This work is licensed under the GPLv3.


(function () {
    var version = "2.0 2012Feb";
    var typename = "JSIO.InflatingReader";

    if (typeof JSIO._ByteReaderBase !== "function")
        JSIO.throwError('This extension requires JSIO.BasicByteReaders.js', typename);

    // =======================================================
    //  _InternalBitReader is used internally in the InflatingReader class.
    //

    JSIO.bitShiftTable = null;

    var bitShiftTableCalc = function () {
        // do this once only, for all instances
        if (JSIO.bitShiftTable) return;

        var bits = 8;
        JSIO.bitShiftTable = {
            LSB: new Array(bits),
            MSB: new Array(bits)
        }
        for (var bp = 0; bp < bits; bp++) {
            var lim = bits - bp;
            JSIO.bitShiftTable.LSB[bp] = new Array(lim);
            JSIO.bitShiftTable.MSB[bp] = new Array(lim);

            var maskLSB = 1 << bp;
            var maskMSB = 1 << lim - 1;
            for (var len = 1; len <= lim; len++) {
                JSIO.bitShiftTable.LSB[bp][len - 1] = maskLSB;
                JSIO.bitShiftTable.MSB[bp][len - 1] = maskMSB;
                maskLSB |= 1 << bp + len;
                maskMSB |= 1 << lim - len - 1;
            }
        }
    };

    var _InternalBitReader = function (reader) {
        if (!(this instanceof arguments.callee)) this._throwError('You must use new to instantiate this class', typename + '._InternalBitReader.ctor');
        this.bitsLength = 0;
        this.bits = 0;
        this.byteReader = reader;
        this._typeName = typename + "._InternalBitReader";
        this._version = version;
        bitShiftTableCalc();
    };

    _InternalBitReader.prototype._throwError = JSIO.throwError;

    _InternalBitReader.prototype.readBit = function () {
        if (this.bitsLength === 0) {
            var nextByte = this.byteReader.readByte();
            if (nextByte === null) this._throwError('Unexpected end of stream', null, 'readBit');
            this.bits = nextByte;
            this.bitsLength = 8;
        }

        var bit = (this.bits & 1 << 8 - this.bitsLength) !== 0;
        this.bitsLength--;
        return bit;
    };

    _InternalBitReader.prototype.align = function () {
        this.bitsLength = 0;
    };

    _InternalBitReader.prototype.readBits = function (len, type) {
        var data = 0;
        type = type || 'LSB';
        var tbl = JSIO.bitShiftTable[type];
        var dl = 0;
        while (len > 0) {
            if (this.bitsLength === 0) {
                var nextByte = this.byteReader.readByte();
                if (nextByte === null) this._throwError('Unexpected end of stream', null, 'read' + type);
                this.bits = nextByte;
                this.bitsLength = 8;
            }

            var maskLen = (this.bitsLength >= len) ? len : this.bitsLength;
            var bitsPos = 8 - this.bitsLength;
            data |= (this.bits & tbl[bitsPos][maskLen - 1]) >>> bitsPos << dl;

            dl += maskLen;
            len -= maskLen;
            this.bitsLength -= maskLen;
        }
        ;
        return data;
    };

    _InternalBitReader.prototype.readLSB = function (len) {
        return this.readBits(len, 'LSB');
    }
    _InternalBitReader.prototype.readMSB = function (len) {
        return this.readBits(len, 'MSB');
    }

    //
    // =======================================================


    /* inflating ByteReader - RFC 1951 */
    var _inflatingReader = function (reader) {
        if (!(this instanceof arguments.callee)) this._throwError('You must use new to instantiate this class', typename, 'ctor');
        this._byteReader = reader;
        this._bitReader = new _InternalBitReader(reader);
        this._buffer = [];
        this._bufferPosition = 0;
        this._state = 0;
        this._blockFinal = false;
        this._typeName = typename;
        this._version = version;
        return this;
    };


    // shared fns and variables

    var staticCodes = null;
    var staticDistances = null;

    var clenMap = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

    var buildCodes = function (lengths) {
        var i = 0;
        var codes = new Array(lengths.length);
        var maxBits = lengths[0];
        for (i = 1; i < lengths.length; i++) {
            if (maxBits < lengths[i]) maxBits = lengths[i];
        }

        var bitLengthsCount = new Array(maxBits + 1);
        for (i = 0; i <= maxBits; i++) bitLengthsCount[i] = 0;

        for (i = 0; i < lengths.length; i++) {
            ++bitLengthsCount[lengths[i]];
        }

        var nextCode = new Array(maxBits + 1);
        var code = 0;
        bitLengthsCount[0] = 0;
        for (var bits = 1; bits <= maxBits; bits++) {
            code = (code + bitLengthsCount[bits - 1]) << 1;
            nextCode[bits] = code;
        }

        for (i = 0; i < codes.length; i++) {
            var len = lengths[i];
            if (len !== 0) {
                codes[i] = nextCode[len];
                nextCode[len]++;
            }
        }
        return codes;
    };

    var buildTree = function (codes, lengths) {
        var nonEmptyCodes = [];
        for (var i = 0; i < codes.length; ++i) {
            if (lengths[i] > 0) {
                var code = {};
                code.bits = codes[i];
                code.length = lengths[i];
                code.index = i;
                nonEmptyCodes.push(code);
            }
        }
        return buildTreeBranch(nonEmptyCodes, 0, 0);
    };


    var buildTreeBranch = function (codes, prefix, prefixLength) {
        if (codes.length === 0) return null;

        var zeros = [];
        var ones = [];
        var branch = {};
        branch.isLeaf = false;
        for (var i = 0; i < codes.length; ++i) {
            if (codes[i].length == prefixLength && codes[i].bits == prefix) {
                branch.isLeaf = true;
                branch.index = codes[i].index;
                break;
            }
            else {
                var nextBit = ((codes[i].bits >> (codes[i].length - prefixLength - 1)) & 1) > 0;
                if (nextBit)  ones.push(codes[i]);
                else         zeros.push(codes[i]);
            }
        }
        if (!branch.isLeaf) {
            branch.zero = buildTreeBranch(zeros, (prefix << 1), prefixLength + 1);
            branch.one = buildTreeBranch(ones, (prefix << 1) | 1, prefixLength + 1);
        }
        return branch;
    };


    var encodedLengthStart = [3, 4, 5, 6, 7, 8, 9, 10,
        11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99,
        115, 131, 163, 195, 227, 258];

    var encodedLengthAdditionalBits = [0, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];

    var encodedDistanceStart = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65,
        97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049,
        3073, 4097, 6145, 8193, 12289, 16385, 24577];

    var encodedDistanceAdditionalBits = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4,
        5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];


    var readDynamicTrees = function (bitReader) {
        var hlit = bitReader.readLSB(5) + 257;
        var hdist = bitReader.readLSB(5) + 1;
        var hclen = bitReader.readLSB(4) + 4;
        var clen = new Array(19);
        var i;
        for (i = 0; i < clen.length; i++) {
            clen[i] = 0;
        }
        for (i = 0; i < hclen; i++) {
            clen[clenMap[i]] = bitReader.readLSB(3);
        }

        var clenCodes = buildCodes(clen);
        var clenTree = buildTree(clenCodes, clen);

        var lengthsSequence = [];
        while (lengthsSequence.length < hlit + hdist) {
            var p = clenTree;
            while (!p.isLeaf) {
                p = bitReader.readBit() ? p.one : p.zero;
            }

            var code = p.index;
            if (code <= 15) lengthsSequence.push(code);
            else if (code == 16) {
                // TODO: replace with faster repeat algorythm
                var repeat = bitReader.readLSB(2) + 3;
                for (var q = 0; q < repeat; ++q) {
                    lengthsSequence.push(lengthsSequence[lengthsSequence.length - 1]);
                }
            }
            else if (code == 17) {
                var repeat1 = bitReader.readLSB(3) + 3;
                for (var q1 = 0; q1 < repeat1; ++q1) {
                    lengthsSequence.push(0);
                }
            }
            else if (code == 18) {
                var repeat2 = bitReader.readLSB(7) + 11;
                for (var q2 = 0; q2 < repeat2; ++q2) {
                    lengthsSequence.push(0);
                }
            }
        }

        var codesLengths = lengthsSequence.slice(0, hlit);
        var codes = buildCodes(codesLengths);
        var distancesLengths = lengthsSequence.slice(hlit, hlit + hdist);
        var distances = buildCodes(distancesLengths);

        return {
            codesTree: buildTree(codes, codesLengths),
            distancesTree: buildTree(distances, distancesLengths)
        };
    };


    _inflatingReader.prototype = new JSIO._ByteReaderBase();


    // internal instance fns
    _inflatingReader.prototype._decodeItem = function () {
        if (this._state == 2) return null;  // end-of-blocks

        var item;
        if (this._state === 0) {
            this._blockFinal = this._bitReader.readBit();
            var blockType = this._bitReader.readLSB(2);
            switch (blockType) {
                case 0:
                    this._bitReader.align();
                    var len = this._bitReader.readLSB(16);  // low-byte first, as opposed to readNumber's HBF
                    var nlen = this._bitReader.readLSB(16);
                    if ((len & ~nlen) != len) this._throwError('Invalid block type 0 length', null, '_decodeItem');

                    item = {};
                    item.itemType = 0;
                    item.array = this._bitReader.byteReader.read(len);
                    if (item.array.length < len) this._throwError('Incomplete block', null, '_decodeItem');
                    if (this._blockFinal) this._state = 2;
                    return item;
                case 1:
                    this._codesTree = staticCodes;
                    this._distancesTree = staticDistances;
                    this._state = 1;
                    break;
                case 2:
                    var dTrees = readDynamicTrees(this._bitReader);
                    this._codesTree = dTrees.codesTree;
                    this._distancesTree = dTrees.distancesTree;
                    this._state = 1;
                    break;
                default:
                    this._throwError('Invalid block type (' + blockType + ')', null, '_decodeItem');
            }
        }

        item = {};

        var p = this._codesTree;
        while (!p.isLeaf) {
            p = this._bitReader.readBit() ? p.one : p.zero;
        }
        if (p.index < 256) {
            item.itemType = 2;
            item.symbol = p.index;
        } else if (p.index > 256) {
            var lengthCode = p.index;
            if (lengthCode > 285) this._throwError('Invalid length code', null, '_decodeItem');

            var length = encodedLengthStart[lengthCode - 257];
            if (encodedLengthAdditionalBits[lengthCode - 257] > 0) {
                length += this._bitReader.readLSB(encodedLengthAdditionalBits[lengthCode - 257]);
            }

            p = this._distancesTree;
            while (!p.isLeaf) {
                p = this._bitReader.readBit() ? p.one : p.zero;
            }

            var distanceCode = p.index;
            var distance = encodedDistanceStart[distanceCode];
            if (encodedDistanceAdditionalBits[distanceCode] > 0)
                distance += this._bitReader.readLSB(encodedDistanceAdditionalBits[distanceCode]);

            item.itemType = 3;
            item.distance = distance;
            item.length = length;
        } else {
            item.itemType = 1;
            this._state = this._blockFinal ? 2 : 0;  // EOB
        }
        return item;
    };


    // public instance functions

    _inflatingReader.prototype.readByte = function () {
        var byte = this.read(1)[0];
        return (byte === null || byte === undefined) ? null : byte;
    };

    _inflatingReader.prototype.read = function (len) {
        var b = this._buffer;  // (since we use this so much...)

        // Keep reading until we get to the right length
        while (this._bufferPosition + len > b.length) {
            var item = this._decodeItem();
            if (item === null) {  // EOF
                len = b.length - this._bufferPosition;
                break;
            }
            switch (item.itemType) {
                case 0:
                    JSIO.massApply(b.push, b, item.array);
                    break;
                case 2:
                    b.push(item.symbol);
                    break;
                case 3:
                    var j = b.length - item.distance;
                    if (item.distance >= item.length)
                        JSIO.massApply(b.push, b, b.slice(j, j + item.length));
                    // sometimes DEFLATE tries some trickery with "look-ahead" compression
                    else {
                        // this is basically just a repetition of the same string, plus some possible cutoff
                        var count = parseInt(item.length / item.distance);
                        var repArr = b.slice(j);
                        // http://stackoverflow.com/questions/202605/repeat-string-javascript/5450113#5450113
                        while (count > 0) {
                            if (count & 1) JSIO.massApply(b.push, b, repArr);
                            if (count >>= 1) JSIO.massApply(repArr.push, repArr, repArr);
                        }
                        // add any remaining cutoff
                        var r;
                        if (r = item.length % item.distance)
                            JSIO.massApply(b.push, b, b.slice(j, j + r));
                    }
                    break;
            }
        }
        var bytes = b.slice(this._bufferPosition, this._bufferPosition + len);
        this._bufferPosition += len;
        this.position += len;

        if (this._bufferPosition > 0xC000) {
            var shift = b.length - 0x8000;
            if (shift > this._bufferPosition) shift = this._bufferPosition;
            b.splice(0, shift);
            this._bufferPosition -= shift;
        }

        return bytes;
    };

    // initialization routine - once per type
    (function () {

        var codes = new Array(288);
        var codesLengths = new Array(288);
        var i = 0;
        for (i = 0; i <= 143; i++) {
            codes[i] = 0x0030 + i;
            codesLengths[i] = 8;
        }
        for (i = 144; i <= 255; i++) {
            codes[i] = 0x0190 + i - 144;
            codesLengths[i] = 9;
        }
        for (i = 256; i <= 279; i++) {
            codes[i] = 0x0000 + i - 256;
            codesLengths[i] = 7;
        }
        for (i = 280; i <= 287; i++) {
            codes[i] = 0x00C0 + i - 280;
            codesLengths[i] = 8;
        }
        staticCodes = buildTree(codes, codesLengths);

        var distances = new Array(32);
        var distancesLengths = new Array(32);
        for (i = 0; i <= 31; i++) {
            distances[i] = i;
            distancesLengths[i] = 5;
        }
        staticDistances = buildTree(distances, distancesLengths);
    })();


    JSIO.InflatingReader = _inflatingReader;

})();


/// JSIO.InflatingReader.js ends

// Zipfile.js
// ------------------------------------------------------------------
//
// A class that reads Zip files.
// Depends on the JSIO library functions.
//
// =======================================================
//
// Copyleft (c) 2010, Dino Chiesa via MS-PL
// Copyleft (c) 2012, Brendan Byrd via GPL
//
// This work is licensed under the GPLv3.

(function () {
    var version = "2.0 2012Feb";
    var typename = "Zipfile";

    if (typeof JSIO.BinaryUrlStream !== "function") JSIO.throwError('This extension requires JSIO.BinaryUrlStream.js v2.0', typename);
    if (typeof JSIO.TextDecoder !== "object")   JSIO.throwError('This extension requires JSIO.TextDecoder.js v2.0', typename);
    if (typeof JSIO.TextReader !== "function") JSIO.throwError('This extension requires JSIO.TextReader.js v2.0', typename);
    if (typeof JSIO.Crc32 !== "function") JSIO.throwError('This extension requires JSIO.Crc32.js v2.0', typename);
    if (typeof JSIO.InflatingReader !== "function") JSIO.throwError('This extension requires JSIO.InflatingReader.js v2.0', typename);

    // =======================================================
    function ZipEntry(zip) {
        this.zipfile = zip;
        this._typename = "ZipEntry";
        this._version = version;
        this._crcCalculator = null;
    }

    ZipEntry.prototype._throwError = JSIO.throwError;

    // return byte array or string
    ZipEntry.prototype.extract = function (callback, asString) {
        this.contentType = JSIO.guessFileType(this.name);
        asString = asString || ( this.contentType == JSIO.FileType.Text ||
        this.contentType == JSIO.FileType.XML);
        var thisEntry = this;

        if (this.compressionMethod !== 0 && this.compressionMethod != 8)
            this._throwError('Unsupported compression method: ' + this.compressionMethod, null, 'extract');

        var reader = (asString) ? this.openTextReader(thisEntry.utf8 ? JSIO.TextDecoder.UTF8 : JSIO.TextDecoder.ANSI) : this.openBinaryReader();

        // diagnostic purpose only; tag the reader with the entry name
        reader.zipEntryName = thisEntry.name;

        if (typeof callback != "function") {
            // synchronous
            var result = reader.readToEnd();
            this.verifyCrc32();
            return result;
        }

        // asynchronous
        reader.beginReadToEnd(function (result) {
            try {
                thisEntry.verifyCrc32();
                callback(thisEntry, result);
            }
            catch (exc1) {
                callback(thisEntry, exc1);
            }
        });
        return null;
    };


    // open a ByteReader on the entry, which will read binary
    // content from the compressed stream.
    ZipEntry.prototype.openBinaryReader = function () {
        var reader =
            new JSIO.StreamSegmentReader(this.zipfile.binaryStream,
                this.offset + this.lengthOfHeader,
                this.compressedSize);
        if (this.compressionMethod === 0) {
            this._crcCalculator = new JSIO.Crc32Reader(reader);
        }
        else {
            var inflator = new JSIO.InflatingReader(reader);
            this._crcCalculator = new JSIO.Crc32Reader(inflator);
        }
        // Whether compressed or not, the source ByteReader in each case
        // is wrapped in a second ByteReader object that calculates CRC
        // as it reads.  That way, after all reading is complete, the
        // caller can check the calcuated CRC against the expected CRC.
        return this._crcCalculator;
    };

    // open a TextReader on the entry, to read text from the
    // compressed stream.
    ZipEntry.prototype.openTextReader = function (decoderKind) {
        var reader = this.openBinaryReader();
        decoderKind = decoderKind || JSIO.TextDecoder.UTF8;
        var d = new decoderKind(reader);
        var textReader = new JSIO.TextReader(d);
        d._parent = textReader;  // store a reference, for diagnostic purposes only
        return textReader;
    };

    // verify the CRC on the entry.
    // call this after all bytes have been read.
    ZipEntry.prototype.verifyCrc32 = function () {
        var computedCrc = this._crcCalculator.crc32();
        var rc = false;  // CRC FAIL
        if (this.crc32 != computedCrc) {
            var msg = "WARNING: CRC check failed: " +
                "entry(" + this.name + ") " +
                "computed(" + JSIO.decimalToHexString(computedCrc, 8) + ") " +
                "expected(" + JSIO.decimalToHexString(this.crc32, 8) + ") ";
            this.zipfile.status.push(msg);
        } else {
            rc = true;  // OK
            if (this.zipfile.verbose > 2) {
                this.zipfile.status.push("INFO: CRC check ok: 0x" +
                JSIO.decimalToHexString(this.crc32, 8));
            }
        }
        return rc;
    };


    // ctor
    ZipFile = function (fileUrl, callback, verbosity) {
        if (!(this instanceof arguments.callee)) JSIO.throwError('You must use new to instantiate this class', typename, 'ctor');

        this.verbose = verbosity || 0;
        this.entries = [];
        this.entryNames = [];
        this.status = [];
        this._version = version;
        this._typename = "ZipFile";
        this._throwError = JSIO.throwError;

        var thisZipFile = this;

        // Could use a back-tracking reader for the central directory, but
        // there's no point, since all the zip data is held in memory anyway.

        /* function ReadCentralDirectory(){
         var posn = thisZipFile.binaryStream.length - 64;
         var maxSeekback = Math.Max(s.Length - 0x4000, 10);
         var success = false;
         var nTries = 0;
         do
         {
         thisZipFile.binaryStream.Seek(posn, SeekOrigin.Begin);
         var bytesRead = thisZipFile.binaryStream.findSignature(thisZipFile.Signatures.EndOfCentralDirectory);
         if (bytesRead != -1)
         success = true;
         else
         {
         nTries++;
         // increasingly larger
         posn -= (32 * (nTries + 1) * nTries);
         if (posn < 0) posn = 0;  // BOF
         }
         }
         while (!success && posn > maxSeekback);
         if (!success) {
         thisZipFile.status.push("cannot find End of Central Directory");
         return;
         }
         } */


        function DateFromPackedFormat(packed) {
            if (packed == 0xFFFF || packed === 0) return new Date(1995, 0, 1, 0, 0, 0, 0);

            var packedTime = packed & 0x0000ffff;
            var packedDate = ((packed & 0xffff0000) >> 16);

            var year = 1980 + ((packedDate & 0xFE00) >> 9);
            var month = ((packedDate & 0x01E0) >> 5) - 1;
            var day = packedDate & 0x001F;

            var hour = (packedTime & 0xF800) >> 11;
            var minute = (packedTime & 0x07E0) >> 5;
            var second = (packedTime & 0x001F) * 2;

            // Validation and error checking.
            // This is not foolproof but will catch most errors.

            // I can't believe how many different ways applications
            // can mess up a simple date format.

            if (second >= 60) {
                minute++;
                second = 0;
            }
            if (minute >= 60) {
                hour++;
                minute = 0;
            }
            if (hour >= 24) {
                day++;
                hour = 0;
            }
            var success = false;
            var d;
            try {
                d = new Date(year, month, day, hour, minute, second, 0);
                success = true;
            }
            catch (exc1) {
                if (year == 1980 && (month === 0 || day === 0)) {
                    try {
                        d = new Date(1980, 0, 1, hour, minute, second, 0);
                        success = true;
                    }
                    catch (exc2) {
                        try {
                            d = new Date(1980, 0, 1, 0, 0, 0, 0);
                            success = true;
                        }
                        catch (exc3) {
                        }  // how could this fail??
                    }
                }
                else {
                    try {
                        if (year < 1980) year = 1980;
                        if (year > 2030) year = 2030;
                        if (month < 1)    month = 1;
                        if (month > 12)   month = 12;
                        if (day < 1)    day = 1;
                        if (day > 31)   day = 31;
                        if (minute < 0)    minute = 0;
                        if (minute > 59)   minute = 59;
                        if (second < 0)    second = 0;
                        if (second > 59)   second = 59;
                        d = new Date(year, month - 1, day, hour, minute, second, 0);
                        success = true;
                    }
                    catch (exc4) {
                    }
                }
            }
            if (!success) this._throwError('Bad date/time value in this ZIP file', null, 'DateFromPackedFormat');
            return d;
        }


        function ReadZipEntries() {
            // read only once
            if (thisZipFile.entryNames.length === 0) {
                var e;
                while ((e = ReadZipEntry()) !== null) {
                    thisZipFile.entries.push(e);
                    thisZipFile.entryNames.push(e.name);
                }
            }
        }


        function ReadZipEntry() {
            var offset = thisZipFile.binaryStream.position;
            var sig = thisZipFile.binaryStream.readNumber(4);
            if (sig == ZipFile.Signatures.DirEntry) {
                // after all entries, comes the central directory
                if (thisZipFile.verbose > 0) {
                    thisZipFile.status.push("INFO: at offset 0x" +
                    JSIO.decimalToHexString(offset) +
                    ", found start of Zip Directory.");
                }
                // all done reading
                return null;
            }
            if (sig != ZipFile.Signatures.Entry) {
                thisZipFile.status.push("WARNING: at offset 0x" +
                JSIO.decimalToHexString(offset) +
                ", found unexpected signature: 0x" +
                JSIO.decimalToHexString(sig));
                return null;
            }

            var entry = new ZipEntry(thisZipFile);
            entry.offset = offset;
            entry.versionNeeded = thisZipFile.binaryStream.readNumber(2);
            entry.bitField = thisZipFile.binaryStream.readNumber(2);
            entry.compressionMethod = thisZipFile.binaryStream.readNumber(2);
            var timeBlob = thisZipFile.binaryStream.readNumber(4);
            entry.lastModified = DateFromPackedFormat(timeBlob);
            entry.crc32 = thisZipFile.binaryStream.readNumber(4);
            entry.compressedSize = thisZipFile.binaryStream.readNumber(4);
            entry.uncompressedSize = thisZipFile.binaryStream.readNumber(4);

            if ((entry.bitField & 0x01) == 0x01) {
                thisZipFile.status.push("This zipfile uses Encryption, which is not supported by ZipFile.js.");
                return null;
            }

            entry.utf8 = ((entry.bitField & 0x0800) == 0x0800);

            if ((entry.bitField & 0x0008) == 0x0008) {
                thisZipFile.status.push("This zipfile uses a bit 3 trailing data descriptor, which is not supported by ZipFile.js.");
                return null;
            }

            if (entry.compressedSize == 0xFFFFFFFF ||
                entry.uncompressedSize == 0xFFFFFFFF) {
                thisZipFile.status.push("This zipfile uses ZIP64, which is not supported by ZipFile.js");
                return null;
            }

            var filenameLength = thisZipFile.binaryStream.readNumber(2);
            var extraFieldLength = thisZipFile.binaryStream.readNumber(2);

            thisZipFile.status.push("INFO: filename length= " + filenameLength);

            // we've read 30 bytes of metadata so far
            var bytesRead = 30 + filenameLength + extraFieldLength;

            if (entry.utf8) {
                thisZipFile.status.push("INFO: before filename, position= 0x" +
                JSIO.decimalToHexString(thisZipFile.binaryStream.position));
                var binReader =
                    new JSIO.StreamSegmentReader(thisZipFile.binaryStream,
                        thisZipFile.binaryStream.position,
                        filenameLength);
                var utf8Decoder = new JSIO.TextDecoder.UTF8(binReader);
                var textReader = new JSIO.TextReader(utf8Decoder);
                entry.name = textReader.readToEnd();

                // advance the filepointer:
                thisZipFile.binaryStream.seek(filenameLength,
                    JSIO.SeekOrigin.Current,
                    thisZipFile);

                thisZipFile.status.push("INFO: after filename, position= 0x" +
                JSIO.decimalToHexString(thisZipFile.binaryStream.position));
            }
            else {
                entry.name = thisZipFile.binaryStream.readString(filenameLength);
            }

            // There are a bunch of things in the "extra" header, thisZipFile we
            // could parse, like timestamps and other things.  This class
            // only identifies and separates them.

            // More info here: http://www.pkware.com/documents/casestudies/APPNOTE.TXT

            var extraPos = 0;
            entry.extra = [];
            while (extraPos < extraFieldLength) {
                var extraBlock = {
                    type: thisZipFile.binaryStream.readNumber(2),
                    size: thisZipFile.binaryStream.readNumber(2)
                };
                extraBlock.typeDescription = ZipFile.ExtraFieldTypes[extraBlock.type];
                extraBlock.data = thisZipFile.binaryStream.read(extraBlock.size);
                entry.extra.push(extraBlock);
                extraPos += 4 + extraBlock.size;
            }

            if (thisZipFile.verbose > 1) {
                thisZipFile.status.push("INFO: at offset 0x" +
                JSIO.decimalToHexString(entry.offset) +
                ", found entry '" + entry.name + "' fnl(" +
                filenameLength + ") efl(" +
                extraFieldLength + ")");
            }

            if (extraFieldLength > 0) {
                if (thisZipFile.verbose > 0) {
                    thisZipFile.status.push("INFO: entry " + entry.name + " has " +
                    extraFieldLength + " bytes of " +
                    "extra metadata (ID'd but ignored)");
                }
            }

            entry.lengthOfHeader = bytesRead;
            entry.totalEntrySize = entry.lengthOfHeader + entry.compressedSize;

            // seek past the data without reading it. We will read on Extract()
            if (thisZipFile.verbose > 1) {
                thisZipFile.status.push("INFO: seek 0x" +
                JSIO.decimalToHexString(entry.compressedSize) +
                " (" + entry.compressedSize + ") bytes");
            }

            thisZipFile.binaryStream.seek(entry.compressedSize,
                JSIO.SeekOrigin.Current,
                thisZipFile);

            return entry;
        }


        var parseZipFile = function (bfr) {
            try {
                if (bfr.req.status == 200) {
                    var sig = thisZipFile.binaryStream.readNumber(4);
                    if (sig != ZipFile.Signatures.Entry) {
                        thisZipFile.status.push("WARNING: this file does not appear to be a zip file");
                    } else {
                        thisZipFile.binaryStream.seek(0, JSIO.SeekOrigin.Begin);
                        ReadZipEntries();
                        if (thisZipFile.verbose > 0) {
                            thisZipFile.status.push("INFO: read " + thisZipFile.entries.length + " entries");
                        }
                    }
                }
                else {
                    thisZipFile.status.push("ERROR: the URL could not be read (" +
                    bfr.req.status + " " + bfr.req.statusText + ")");
                }
                callback(thisZipFile);
            }
            catch (exc1) {
                thisZipFile.status.push("Exception: " + exc1.message);
                callback(thisZipFile);
            }
        };

        this.binaryStream = new JSIO.BinaryUrlStream(fileUrl, parseZipFile);

        return this;
    };


    ZipFile.Signatures = {
        Entry: 0x04034b50,
        EndOfCentralDirectory: 0x06054b50,
        DirEntry: 0x02014b50
    };

    ZipFile.Version = version;

    ZipFile.EncryptionAlgorithm = {
        None: 0,
        PkzipWeak: 1,
        WinZipAes: 2
    };

    ZipFile.ExtraFieldTypes = {};
    ZipFile.ExtraFieldTypes[0x0001] = 'Zip64 Extended Info';
    ZipFile.ExtraFieldTypes[0x0007] = 'AV Info';
    ZipFile.ExtraFieldTypes[0x0008] = 'Extended Language Encoding Data (PFS)';
    ZipFile.ExtraFieldTypes[0x0009] = 'OS/2';
    ZipFile.ExtraFieldTypes[0x000a] = 'NTFS ';
    ZipFile.ExtraFieldTypes[0x000c] = 'OpenVMS';
    ZipFile.ExtraFieldTypes[0x000d] = 'UNIX';
    ZipFile.ExtraFieldTypes[0x000e] = 'File Stream and Fork Descriptors';
    ZipFile.ExtraFieldTypes[0x000f] = 'Patch Descriptor';
    ZipFile.ExtraFieldTypes[0x0014] = 'PKCS#7 Store for X.509 Certificates';
    ZipFile.ExtraFieldTypes[0x0015] = 'X.509 Certificate ID and Signature (Individual File)';
    ZipFile.ExtraFieldTypes[0x0016] = 'X.509 Certificate ID (Central Directory)';
    ZipFile.ExtraFieldTypes[0x0017] = 'Strong Encryption Header';
    ZipFile.ExtraFieldTypes[0x0018] = 'Record Management Controls';
    ZipFile.ExtraFieldTypes[0x0019] = 'PKCS#7 Encryption Recipient Certificate List';
    ZipFile.ExtraFieldTypes[0x0065] = 'IBM S/390 (Z390), AS/400 (I400) attributes (uncompressed)';
    ZipFile.ExtraFieldTypes[0x0066] = 'IBM S/390 (Z390), AS/400 (I400) attributes (compressed)';
    ZipFile.ExtraFieldTypes[0x4690] = 'POSZIP 4690 (reserved) ';
    ZipFile.ExtraFieldTypes[0x07c8] = 'Macintosh';
    ZipFile.ExtraFieldTypes[0x2605] = 'ZipIt Macintosh';
    ZipFile.ExtraFieldTypes[0x2705] = 'ZipIt Macintosh 1.3.5+';
    ZipFile.ExtraFieldTypes[0x2805] = 'ZipIt Macintosh 1.3.5+';
    ZipFile.ExtraFieldTypes[0x334d] = 'Info-ZIP Macintosh';
    ZipFile.ExtraFieldTypes[0x4341] = 'Acorn/SparkFS ';
    ZipFile.ExtraFieldTypes[0x4453] = 'Windows NT security descriptor (binary ACL)';
    ZipFile.ExtraFieldTypes[0x4704] = 'VM/CMS';
    ZipFile.ExtraFieldTypes[0x470f] = 'MVS';
    ZipFile.ExtraFieldTypes[0x4b46] = 'FWKCS MD5';
    ZipFile.ExtraFieldTypes[0x4c41] = 'OS/2 access control list (text ACL)';
    ZipFile.ExtraFieldTypes[0x4d49] = 'Info-ZIP OpenVMS';
    ZipFile.ExtraFieldTypes[0x4f4c] = 'Xceed original location extra field';
    ZipFile.ExtraFieldTypes[0x5356] = 'AOS/VS (ACL)';
    ZipFile.ExtraFieldTypes[0x5455] = 'extended timestamp';
    ZipFile.ExtraFieldTypes[0x554e] = 'Xceed unicode extra field';
    ZipFile.ExtraFieldTypes[0x5855] = 'Info-ZIP UNIX (original, also OS/2, NT, etc)';
    ZipFile.ExtraFieldTypes[0x6375] = 'Info-ZIP Unicode Comment Extra Field';
    ZipFile.ExtraFieldTypes[0x6542] = 'BeOS/BeBox';
    ZipFile.ExtraFieldTypes[0x7075] = 'Info-ZIP Unicode Path Extra Field';
    ZipFile.ExtraFieldTypes[0x756e] = 'ASi UNIX';
    ZipFile.ExtraFieldTypes[0x7855] = 'Info-ZIP UNIX (new)';
    ZipFile.ExtraFieldTypes[0xa220] = 'Microsoft Open Packaging Growth Hint';
    ZipFile.ExtraFieldTypes[0xfd4a] = 'SMS/QDOS';

})();

/**
 * @fileOverview Renders KML on the Google Maps JavaScript API Version 3
 * @name GeoXML3
 * @author Sterling Udell, Larry Ross, Brendan Byrd
 * @see http://code.google.com/p/geoxml3/
 *
 * geoxml3.js
 *
 * Renders KML on the Google Maps JavaScript API Version 3
 * http://code.google.com/p/geoxml3/
 *
 * Copyright 2010 Sterling Udell, Larry Ross
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/**
 * A MultiGeometry object that will allow multiple polylines in a MultiGeometry
 * containing LineStrings to be treated as a single object
 *
 * @param {MutiGeometryOptions} anonymous object.  Available properties:
 * map: The map on which to attach the MultiGeometry
 * paths: the individual polylines
 * polylineOptions: options to use when constructing all the polylines
 *
 * @constructor
 */
// only if Google Maps API included
/*global google*/
if (!!window.google && !!google.maps) {
    function MultiGeometry(multiGeometryOptions) {
        function createPolyline(polylineOptions, mg) {
            var polyline = new google.maps.Polyline(polylineOptions);
            google.maps.event.addListener(polyline, 'click', function (evt) {
                google.maps.event.trigger(mg, 'click', evt);
            });
            google.maps.event.addListener(polyline, 'dblclick', function (evt) {
                google.maps.event.trigger(mg, 'dblclick', evt);
            });
            google.maps.event.addListener(polyline, 'mousedown', function (evt) {
                google.maps.event.trigger(mg, 'mousedown', evt);
            });
            google.maps.event.addListener(polyline, 'mousemove', function (evt) {
                google.maps.event.trigger(mg, 'mousemove', evt);
            });
            google.maps.event.addListener(polyline, 'mouseout', function (evt) {
                google.maps.event.trigger(mg, 'mouseout', evt);
            });
            google.maps.event.addListener(polyline, 'mouseover', function (evt) {
                google.maps.event.trigger(mg, 'mouseover', evt);
            });
            google.maps.event.addListener(polyline, 'mouseup', function (evt) {
                google.maps.event.trigger(mg, 'mouseup', evt);
            });
            google.maps.event.addListener(polyline, 'rightclick', function (evt) {
                google.maps.event.trigger(mg, 'rightclick', evt);
            });
            return polyline;
        }

        this.setValues(multiGeometryOptions);
        this.polylines = [];

        for (i = 0; i < this.paths.length; i++) {
            var polylineOptions = multiGeometryOptions;
            polylineOptions.path = this.paths[i];
            var polyline = createPolyline(polylineOptions, this);
            // Bind the polyline properties to the MultiGeometry properties
            this.polylines.push(polyline);
        }
    }

    MultiGeometry.prototype = new google.maps.MVCObject();
    MultiGeometry.prototype.changed = function (key) {
        // alert(key+" changed");
        if (this.polylines) {
            for (var i = 0; i < this.polylines.length; i++) {
                this.polylines[i].set(key, this.get(key));
            }
        }
    };
    MultiGeometry.prototype.setMap = function (map) {
        this.set('map', map);
    };
    MultiGeometry.prototype.getMap = function () {
        return this.get('map');
    };
}

// Extend the global String object with a method to remove leading and trailing whitespace
if (!String.prototype.trim) {
    /**
     * Remove leading and trailing whitespace.
     *
     * @augments String
     * @return {String}
     */
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

/**
 * @namespace The GeoXML3 namespace.
 */
geoXML3 = window.geoXML3 || {instances: []};

/**
 * Constructor for the root KML parser object.
 *
 * <p>All top-level objects and functions are declared under a namespace of geoXML3.
 * The core object is geoXML3.parser; typically, you'll instantiate a one parser
 * per map.</p>
 *
 * @class Main XML parser.
 * @param {geoXML3.parserOptions} options
 */
geoXML3.parser = function (options) {
    // Inherit from Google MVC Object to include event handling
    google.maps.MVCObject.call(this);

    // Private variables
    var parserOptions = new geoXML3.parserOptions(options);
    var docs = [];  // Individual KML documents
    var docsByUrl = {};  // Same docs as an hash by cleanURL
    var kmzMetaData = {};  // Extra files from KMZ data
    var styles = {};  // Global list of styles
    var lastPlacemark;
    var parserName;
    if (!parserOptions.infoWindow && parserOptions.singleInfoWindow)
        parserOptions.infoWindow = new google.maps.InfoWindow();

    var parseKmlString = function (kmlString, docSet, promise) {
        // Internal values for the set of documents as a whole
        var internals = {
            parser: this,
            docSet: docSet || [],
            remaining: 1,
            parseOnly: !(parserOptions.afterParse || parserOptions.processStyles)
        };
        thisDoc = new Object();
        thisDoc.internals = internals;
        internals.docSet.push(thisDoc);
        render(geoXML3.xmlParse(kmlString), thisDoc, promise);
    };

    var parse = function (urls, docSet, promise) {
        // Process one or more KML documents
        if (!parserName) {
            parserName = 'geoXML3.instances[' + (geoXML3.instances.push(this) - 1) + ']';
        }
        if (typeof urls === 'string') {
            // Single KML document
            urls = [urls];
        }
        if (urls instanceof Blob) {
            urls = [urls];
        }
        // Internal values for the set of documents as a whole
        var internals = {
            parser: this,
            docSet: docSet || [],
            remaining: urls.length,
            parseOnly: !(parserOptions.afterParse || parserOptions.processStyles)
        };
        var thisDoc, j;
        for (var i = 0; i < urls.length; i++) {
            var mimeType = null, blobUrl = null;
            if (urls[i] instanceof Blob) {
                mimeType = urls[i].type;
                blobUrl = URL.createObjectURL(urls[i]);
            } else {
                blobUrl = urls[i];
            }

            var baseUrl = cleanURL(defileURL(location.pathname), blobUrl);
            if (docsByUrl[baseUrl]) {
                // Reloading an existing document
                thisDoc = docsByUrl[baseUrl];
                thisDoc.reload = true;
            }
            else {
                thisDoc = new Object();
                thisDoc.baseUrl = baseUrl;
                internals.docSet.push(thisDoc);
            }
            thisDoc.type = mimeType;
            thisDoc.url = blobUrl;
            thisDoc.internals = internals;
            fetchDoc(thisDoc.url, thisDoc, null, promise);
        }
    };

    function fetchDoc(url, doc, resFunc, promise) {
        resFunc = resFunc || function (responseXML) {
            render(responseXML, doc, promise);
        };

        if (doc.type !== 'application/vnd.google-earth.kml+xml' && typeof ZipFile === 'function' && typeof JSIO === 'object' && typeof JSIO.guessFileType === 'function') {  // KMZ support requires these modules loaded
            contentType = JSIO.guessFileType(doc.baseUrl);
            if (contentType == JSIO.FileType.Binary || contentType == JSIO.FileType.Unknown) {
                doc.isCompressed = true;
                doc.baseDir = doc.baseUrl + '/';
                geoXML3.fetchZIP(url, resFunc, doc.internals.parser);
                return;
            }
        }
        doc.isCompressed = false;
        doc.baseDir = defileURL(doc.baseUrl);
        geoXML3.fetchXML(url, resFunc);
    }

    var hideDocument = function (doc) {
        if (!doc) doc = docs[0];
        // Hide the map objects associated with a document
        var i;
        if (!!doc.markers) {
            for (i = 0; i < doc.markers.length; i++) {
                if (!!doc.markers[i].infoWindow) doc.markers[i].infoWindow.close();
                doc.markers[i].setVisible(false);
            }
        }
        if (!!doc.ggroundoverlays) {
            for (i = 0; i < doc.ggroundoverlays.length; i++) {
                doc.ggroundoverlays[i].setOpacity(0);
            }
        }
        if (!!doc.gpolylines) {
            for (i = 0; i < doc.gpolylines.length; i++) {
                if (!!doc.gpolylines[i].infoWindow) doc.gpolylines[i].infoWindow.close();
                doc.gpolylines[i].setMap(null);
            }
        }
        if (!!doc.gpolygons) {
            for (i = 0; i < doc.gpolygons.length; i++) {
                if (!!doc.gpolygons[i].infoWindow) doc.gpolygons[i].infoWindow.close();
                doc.gpolygons[i].setMap(null);
            }
        }
    };

    var showDocument = function (doc) {
        if (!doc) doc = docs[0];
        // Show the map objects associated with a document
        var i;
        if (!!doc.markers) {
            for (i = 0; i < doc.markers.length; i++) {
                doc.markers[i].setVisible(true);
            }
        }
        if (!!doc.ggroundoverlays) {
            for (i = 0; i < doc.ggroundoverlays.length; i++) {
                doc.ggroundoverlays[i].setOpacity(doc.ggroundoverlays[i].percentOpacity_);
            }
        }
        if (!!doc.gpolylines) {
            for (i = 0; i < doc.gpolylines.length; i++) {
                doc.gpolylines[i].setMap(parserOptions.map);
            }
        }
        if (!!doc.gpolygons) {
            for (i = 0; i < doc.gpolygons.length; i++) {
                doc.gpolygons[i].setMap(parserOptions.map);
            }
        }
    };

    var defaultStyle = {
        balloon: {
            bgColor: 'ffffffff',
            textColor: 'ff000000',
            text: "<h3>$[name]</h3>\n<div>$[description]</div>\n<div>$[geDirections]</div>",
            displayMode: 'default'
        },
        icon: {
            scale: 1.0,
            dim: {
                x: 0,
                y: 0,
                w: -1,
                h: -1
            },
            hotSpot: {
                x: 0.5,
                y: 0.5,
                xunits: 'fraction',
                yunits: 'fraction'
            }
        },
        line: {
            color: 'ffffffff', // white (KML default)
            colorMode: 'normal',
            width: 1.0
        },
        poly: {
            color: 'ffffffff', // white (KML default)
            colorMode: 'normal',
            fill: true,
            outline: true
        }
    };

    var kmlNS = 'http://www.opengis.net/kml/2.2';
    var gxNS = 'http://www.google.com/kml/ext/2.2';
    var nodeValue = geoXML3.nodeValue;
    var getBooleanValue = geoXML3.getBooleanValue;
    var getElementsByTagNameNS = geoXML3.getElementsByTagNameNS;
    var getElementsByTagName = geoXML3.getElementsByTagName;

    function processStyleUrl(node) {
        var styleUrlStr = nodeValue(getElementsByTagName(node, 'styleUrl')[0]);
        if (!!styleUrlStr && styleUrlStr.indexOf('#') != -1)
            var styleUrl = styleUrlStr.split('#');
        else var styleUrl = ["", ""];
        return styleUrl;
    }

    function processStyle(thisNode, baseUrl, styleID, baseDir) {
        var style = (baseUrl === '{inline}') ? clone(defaultStyle) : (styles[baseUrl][styleID] = styles[baseUrl][styleID] || clone(defaultStyle));

        var styleNodes = getElementsByTagName(thisNode, 'BalloonStyle');
        if (!!styleNodes && styleNodes.length > 0) {
            style.balloon.bgColor = nodeValue(getElementsByTagName(styleNodes[0], 'bgColor')[0], style.balloon.bgColor);
            style.balloon.textColor = nodeValue(getElementsByTagName(styleNodes[0], 'textColor')[0], style.balloon.textColor);
            style.balloon.text = nodeValue(getElementsByTagName(styleNodes[0], 'text')[0], style.balloon.text);
            style.balloon.displayMode = nodeValue(getElementsByTagName(styleNodes[0], 'displayMode')[0], style.balloon.displayMode);
        }

        // style.list = (unsupported; doesn't make sense in Google Maps)

        var styleNodes = getElementsByTagName(thisNode, 'IconStyle');
        if (!!styleNodes && styleNodes.length > 0) {
            var icon = style.icon;

            icon.scale = parseFloat(nodeValue(getElementsByTagName(styleNodes[0], 'scale')[0], icon.scale));
            // style.icon.heading   = (unsupported; not supported in API)
            // style.icon.color     = (unsupported; not supported in API)
            // style.icon.colorMode = (unsupported; not supported in API)

            styleNodes = getElementsByTagName(styleNodes[0], 'hotSpot');
            if (!!styleNodes && styleNodes.length > 0) {
                icon.hotSpot = {
                    x: styleNodes[0].getAttribute('x'),
                    y: styleNodes[0].getAttribute('y'),
                    xunits: styleNodes[0].getAttribute('xunits'),
                    yunits: styleNodes[0].getAttribute('yunits')
                };
            }

            styleNodes = getElementsByTagName(thisNode, 'Icon');
            if (!!styleNodes && styleNodes.length > 0) {
                icon.href = nodeValue(getElementsByTagName(styleNodes[0], 'href')[0]);
                icon.url = cleanURL(baseDir, icon.href);
                // Detect images buried in KMZ files (and use a base64 encoded URL)
                if (kmzMetaData[icon.url]) icon.url = kmzMetaData[icon.url].dataUrl;

                // Support for icon palettes and exact size dimensions
                icon.dim = {
                    x: parseInt(nodeValue(getElementsByTagNameNS(styleNodes[0], gxNS, 'x')[0], icon.dim.x)),
                    y: parseInt(nodeValue(getElementsByTagNameNS(styleNodes[0], gxNS, 'y')[0], icon.dim.y)),
                    w: parseInt(nodeValue(getElementsByTagNameNS(styleNodes[0], gxNS, 'w')[0], icon.dim.w)),
                    h: parseInt(nodeValue(getElementsByTagNameNS(styleNodes[0], gxNS, 'h')[0], icon.dim.h))
                };

                // certain occasions where we need the pixel size of the image (like the default settings...)
                // (NOTE: Scale is applied to entire image, not just the section of the icon palette.  So,
                //  if we need scaling, we'll need the img dimensions no matter what.)
                if (true /* (icon.dim.w < 0 || icon.dim.h < 0) && (icon.xunits != 'pixels' || icon.yunits == 'fraction') || icon.scale != 1.0 */) {
                    // (hopefully, this will load by the time we need it...)
                    icon.img = new Image();
                    icon.img.onload = function () {
                        if (icon.dim.w < 0 || icon.dim.h < 0) {
                            icon.dim.w = this.width;
                            icon.dim.h = this.height;
                        } else {
                            icon.dim.th = this.height;
                        }
                    };
                    icon.img.src = icon.url;

                    // sometimes the file is already cached and it never calls onLoad
                    if (icon.img.width > 0) {
                        if (icon.dim.w < 0 || icon.dim.h < 0) {
                            icon.dim.w = icon.img.width;
                            icon.dim.h = icon.img.height;
                        } else {
                            icon.dim.th = icon.img.height;
                        }
                    }
                }
            }
        }

        // style.label = (unsupported; may be possible but not with API)

        styleNodes = getElementsByTagName(thisNode, 'LineStyle');
        if (!!styleNodes && styleNodes.length > 0) {
            style.line.color = nodeValue(getElementsByTagName(styleNodes[0], 'color')[0], style.line.color);
            style.line.colorMode = nodeValue(getElementsByTagName(styleNodes[0], 'colorMode')[0], style.line.colorMode);
            style.line.width = nodeValue(getElementsByTagName(styleNodes[0], 'width')[0], style.line.width);
            // style.line.outerColor      = (unsupported; not supported in API)
            // style.line.outerWidth      = (unsupported; not supported in API)
            // style.line.physicalWidth   = (unsupported; unneccesary in Google Maps)
            // style.line.labelVisibility = (unsupported; possible to implement)
        }

        styleNodes = getElementsByTagName(thisNode, 'PolyStyle');
        if (!!styleNodes && styleNodes.length > 0) {
            style.poly.color = nodeValue(getElementsByTagName(styleNodes[0], 'color')[0], style.poly.color);
            style.poly.colorMode = nodeValue(getElementsByTagName(styleNodes[0], 'colorMode')[0], style.poly.colorMode);
            style.poly.outline = getBooleanValue(getElementsByTagName(styleNodes[0], 'outline')[0], style.poly.outline);
            style.poly.fill = getBooleanValue(getElementsByTagName(styleNodes[0], 'fill')[0], style.poly.fill);
        }
        return style;
    }

    // from http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object
    // http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
    function clone(obj) {
        if (obj == null || typeof(obj) != 'object') return obj;
        if (obj.cloneNode) return obj.cloneNode(true);
        var temp = new obj.constructor();
        for (var key in obj) temp[key] = clone(obj[key]);
        return temp;
    }

    function processStyleMap(thisNode, baseUrl, styleID, baseDir) {
        var pairs = getElementsByTagName(thisNode, 'Pair');
        var map = new Object();

        // add each key to the map
        for (var pr = 0; pr < pairs.length; pr++) {
            var pairKey = nodeValue(getElementsByTagName(pairs[pr], 'key')[0]);
            var pairStyle = nodeValue(getElementsByTagName(pairs[pr], 'Style')[0]);
            var pairStyleUrl = processStyleUrl(pairs[pr]);
            var pairStyleBaseUrl = pairStyleUrl[0] ? cleanURL(baseDir, pairStyleUrl[0]) : baseUrl;
            var pairStyleID = pairStyleUrl[1];

            if (!!pairStyle) {
                map[pairKey] = processStyle(pairStyle, pairStyleBaseUrl, pairStyleID);
            } else if (!!pairStyleID && !!styles[pairStyleBaseUrl][pairStyleID]) {
                map[pairKey] = clone(styles[pairStyleBaseUrl][pairStyleID]);
            }
        }
        if (!!map["normal"]) {
            styles[baseUrl][styleID] = clone(map["normal"]);
        } else {
            styles[baseUrl][styleID] = clone(defaultStyle);
        }
        if (!!map["highlight"] && !!parserOptions.processStyles) {
            processStyleID(map["highlight"]);
        }
        styles[baseUrl][styleID].map = clone(map);
    }

    function processPlacemarkCoords(node, tag) {
        var parent = getElementsByTagName(node, tag);
        var coordListA = [];
        for (var i = 0; i < parent.length; i++) {
            var coordNodes = getElementsByTagName(parent[i], 'coordinates');
            if (!coordNodes) {
                if (coordListA.length > 0) {
                    break;
                } else {
                    return [{coordinates: []}];
                }
            }

            for (var j = 0; j < coordNodes.length; j++) {
                var coords = nodeValue(coordNodes[j]).trim();
                coords = coords.replace(/,\s+/g, ',');
                var path = coords.split(/\s+/g);
                var pathLength = path.length;
                var coordList = [];
                for (var k = 0; k < pathLength; k++) {
                    coords = path[k].split(',');
                    if (!isNaN(coords[0]) && !isNaN(coords[1])) {
                        coordList.push({
                            lat: parseFloat(coords[1]),
                            lng: parseFloat(coords[0]),
                            alt: parseFloat(coords[2])
                        });
                    }
                }
                coordListA.push({coordinates: coordList});
            }
        }
        return coordListA;
    }

    var render = function (responseXML, doc, promise) {
        // Callback for retrieving a KML document: parse the KML and display it on the map
        if (!responseXML || responseXML == "failed parse") {
            // Error retrieving the data
            geoXML3.log('Unable to retrieve ' + doc.url);
            if (parserOptions.failedParse) parserOptions.failedParse(doc, promise);
            doc.failed = true;
            return;
        } else if (responseXML.parseError && responseXML.parseError.errorCode != 0) {
            // IE parse error
            var err = responseXML.parseError;
            var msg = 'Parse error in line ' + err.line + ', col ' + err.linePos + ' (error code: ' + err.errorCode + ")\n" +
                "\nError Reason: " + err.reason +
                'Error Line: ' + err.srcText;

            geoXML3.log('Unable to retrieve ' + doc.url + ': ' + msg);
            if (parserOptions.failedParse) parserOptions.failedParse(doc, promise);
            doc.failed = true;
            return;
        } else if (responseXML.documentElement && responseXML.documentElement.nodeName == 'parsererror') {
            // Firefox parse error
            geoXML3.log('Unable to retrieve ' + doc.url + ': ' + responseXML.documentElement.childNodes[0].nodeValue);
            if (parserOptions.failedParse) parserOptions.failedParse(doc, promise);
            doc.failed = true;
            return;
        } else if (!doc) {
            throw 'geoXML3 internal error: render called with null document';
        } else { //no errors
            var i;
            doc.placemarks = [];
            doc.groundoverlays = [];
            doc.ggroundoverlays = [];
            doc.networkLinks = [];
            doc.gpolygons = [];
            doc.gpolylines = [];

            // Check for dependent KML files
            var nodes = getElementsByTagName(responseXML, 'styleUrl');
            var docSet = doc.internals.docSet;

            for (var i = 0; i < nodes.length; i++) {
                var url = nodeValue(nodes[i]).split('#')[0];
                if (!url)                 continue;  // #id (inside doc)
                var rUrl = cleanURL(doc.baseDir, url);
                if (rUrl === doc.baseUrl) continue;  // self
                if (docsByUrl[rUrl])      continue;  // already loaded

                var thisDoc;
                var j = docSet.indexOfObjWithItem('baseUrl', rUrl);
                if (j != -1) {
                    // Already listed to be loaded, but probably in the wrong order.
                    // Load it right away to immediately resolve dependency.
                    thisDoc = docSet[j];
                    if (thisDoc.failed) continue;  // failed to load last time; don't retry it again
                }
                else {
                    // Not listed at all; add it in
                    thisDoc = new Object();
                    thisDoc.url = rUrl;  // url can't be trusted inside KMZ files, since it may .. outside of the archive
                    thisDoc.baseUrl = rUrl;
                    thisDoc.internals = doc.internals;

                    doc.internals.docSet.push(thisDoc);
                    doc.internals.remaining++;
                }

                // render dependent KML first then re-run renderer
                fetchDoc(rUrl, thisDoc, function (thisResXML) {
                    render(thisResXML, thisDoc);
                    render(responseXML, doc, promise);
                });

                // to prevent cross-dependency issues, just load the one
                // file first and re-check the rest later
                return;
            }

            // Parse styles
            doc.styles = styles[doc.baseUrl] = styles[doc.baseUrl] || {};
            var styleID, styleNodes;
            nodes = getElementsByTagName(responseXML, 'Style');
            nodeCount = nodes.length;
            for (i = 0; i < nodeCount; i++) {
                thisNode = nodes[i];
                var styleID = thisNode.getAttribute('id');
                if (!!styleID) processStyle(thisNode, doc.baseUrl, styleID, doc.baseDir);
            }
            // Parse StyleMap nodes
            nodes = getElementsByTagName(responseXML, 'StyleMap');
            for (i = 0; i < nodes.length; i++) {
                thisNode = nodes[i];
                var styleID = thisNode.getAttribute('id');
                if (!!styleID) processStyleMap(thisNode, doc.baseUrl, styleID, doc.baseDir);
            }

            if (!!parserOptions.processStyles || !parserOptions.createMarker) {
                // Convert parsed styles into GMaps equivalents
                processStyles(doc);
            }

            // Parse placemarks
            if (!!doc.reload && !!doc.markers) {
                for (i = 0; i < doc.markers.length; i++) {
                    doc.markers[i].active = false;
                }
            }
            var placemark, node, coords, path, marker, poly;
            var pathLength, marker, polygonNodes, coordList;
            var placemarkNodes = getElementsByTagName(responseXML, 'Placemark');
            for (pm = 0; pm < placemarkNodes.length; pm++) {
                // Init the placemark object
                node = placemarkNodes[pm];
                var styleUrl = processStyleUrl(node);
                placemark = {
                    name: nodeValue(getElementsByTagName(node, 'name')[0]),
                    description: nodeValue(getElementsByTagName(node, 'description')[0]),
                    styleUrl: styleUrl.join('#'),
                    styleBaseUrl: styleUrl[0] ? cleanURL(doc.baseDir, styleUrl[0]) : doc.baseUrl,
                    styleID: styleUrl[1],
                    visibility: getBooleanValue(getElementsByTagName(node, 'visibility')[0], true),
                    balloonVisibility: getBooleanValue(getElementsByTagNameNS(node, gxNS, 'balloonVisibility')[0], !parserOptions.suppressInfoWindows),
                    id: node.getAttribute('id'),
                    index: pm
                };
                placemark.style = (styles[placemark.styleBaseUrl] && styles[placemark.styleBaseUrl][placemark.styleID]) || clone(defaultStyle);
                // inline style overrides shared style
                var inlineStyles = getElementsByTagName(node, 'Style');
                if (inlineStyles && (inlineStyles.length > 0)) {
                    var style = processStyle(node, '{inline}', '{inline}');
                    processStyleID(style);
                    if (style) placemark.style = style;
                }

                if (/^https?:\/\//.test(placemark.description)) {
                    placemark.description = ['<a href="', placemark.description, '">', placemark.description, '</a>'].join('');
                }

                // record list of variables for substitution
                placemark.vars = {
                    display: {
                        name: 'Name',
                        description: 'Description',
                        address: 'Street Address',
                        id: 'ID',
                        Snippet: 'Snippet',
                        geDirections: 'Directions'
                    },
                    val: {
                        name: placemark.name || '',
                        description: placemark.description || '',
                        address: nodeValue(getElementsByTagName(node, 'address')[0], ''),
                        id: node.getAttribute('id') || '',
                        Snippet: nodeValue(getElementsByTagName(node, 'Snippet')[0], '')
                    },
                    directions: [
                        'f=d',
                        'source=GeoXML3'
                    ]
                };

                // add extended data to variables
                var extDataNodes = getElementsByTagName(node, 'ExtendedData');
                if (!!extDataNodes && extDataNodes.length > 0) {
                    var dataNodes = getElementsByTagName(extDataNodes[0], 'Data');
                    for (var d = 0; d < dataNodes.length; d++) {
                        var dn = dataNodes[d];
                        var name = dn.getAttribute('name');
                        if (!name) continue;
                        var dName = nodeValue(getElementsByTagName(dn, 'displayName')[0], name);
                        var val = nodeValue(getElementsByTagName(dn, 'value')[0]);

                        placemark.vars.val[name] = val;
                        placemark.vars.display[name] = dName;
                    }
                }

                // process MultiGeometry
                var GeometryNodes = getElementsByTagName(node, 'coordinates');
                var Geometry = null;
                if (!!GeometryNodes && (GeometryNodes.length > 0)) {
                    for (var gn = 0; gn < GeometryNodes.length; gn++) {
                        if (GeometryNodes[gn].parentNode &&
                            GeometryNodes[gn].parentNode.nodeName) {
                            var GeometryPN = GeometryNodes[gn].parentNode;
                            Geometry = GeometryPN.nodeName;

                            // Extract the coordinates
                            // What sort of placemark?
                            switch (Geometry) {
                                case "Point":
                                    placemark.Point = processPlacemarkCoords(node, "Point")[0];
                                    placemark.latlng = new google.maps.LatLng(placemark.Point.coordinates[0].lat, placemark.Point.coordinates[0].lng);
                                    pathLength = 1;
                                    break;
                                case "LinearRing":
                                    // Polygon/line
                                    polygonNodes = getElementsByTagName(node, 'Polygon');
                                    // Polygon
                                    if (!placemark.Polygon)
                                        placemark.Polygon = [{
                                            outerBoundaryIs: {coordinates: []},
                                            innerBoundaryIs: [{coordinates: []}]
                                        }];
                                    for (var pg = 0; pg < polygonNodes.length; pg++) {
                                        placemark.Polygon[pg] = {
                                            outerBoundaryIs: {coordinates: []},
                                            innerBoundaryIs: [{coordinates: []}]
                                        }
                                        placemark.Polygon[pg].outerBoundaryIs = processPlacemarkCoords(polygonNodes[pg], "outerBoundaryIs");
                                        placemark.Polygon[pg].innerBoundaryIs = processPlacemarkCoords(polygonNodes[pg], "innerBoundaryIs");
                                    }
                                    coordList = placemark.Polygon[0].outerBoundaryIs;
                                    break;

                                case "LineString":
                                    pathLength = 0;
                                    placemark.LineString = processPlacemarkCoords(node, "LineString");
                                    break;

                                default:
                                    break;
                            }
                        }
                    }
                }

                // call the custom placemark parse function if it is defined
                if (!!parserOptions.pmParseFn) parserOptions.pmParseFn(node, placemark);
                doc.placemarks.push(placemark);

                // single marker
                if (placemark.Point) {
                    if (!!google.maps) {
                        doc.bounds = doc.bounds || new google.maps.LatLngBounds();
                        doc.bounds.extend(placemark.latlng);
                    }

                    // Potential user-defined marker handler
                    var pointCreateFunc = parserOptions.createMarker || createMarker;
                    var found = false;
                    if (!parserOptions.createMarker) {
                        // Check to see if this marker was created on a previous load of this document
                        if (!!doc) {
                            doc.markers = doc.markers || [];
                            if (doc.reload) {
                                for (var j = 0; j < doc.markers.length; j++) {
                                    if ((doc.markers[j].id == placemark.id) ||
                                            // if no id, check position
                                        (!doc.markers[j].id &&
                                        (doc.markers[j].getPosition().equals(placemark.latlng)))) {
                                        found = doc.markers[j].active = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (!found) {
                        // Call the marker creator
                        var marker = pointCreateFunc(placemark, doc);
                        if (marker) {
                            marker.active = placemark.visibility;
                            marker.id = placemark.id;
                        }
                    }
                }
                // polygon/line
                var poly, line;
                if (!!doc) {
                    if (placemark.Polygon)    doc.gpolygons = doc.gpolygons || [];
                    if (placemark.LineString) doc.gpolylines = doc.gpolylines || [];
                }

                var polyCreateFunc = parserOptions.createPolygon || createPolygon;
                var lineCreateFunc = parserOptions.createLineString || createPolyline;
                if (placemark.Polygon) {
                    poly = polyCreateFunc(placemark, doc);
                    if (poly) poly.active = placemark.visibility;
                }
                if (placemark.LineString) {
                    line = lineCreateFunc(placemark, doc);
                    if (line) line.active = placemark.visibility;
                }
                if (!!google.maps) {
                    doc.bounds = doc.bounds || new google.maps.LatLngBounds();
                    if (poly) doc.bounds.union(poly.bounds);
                    if (line) doc.bounds.union(line.bounds);
                }

            } // placemark loop

            if (!!doc.reload && !!doc.markers) {
                for (i = doc.markers.length - 1; i >= 0; i--) {
                    if (!doc.markers[i].active) {
                        if (!!doc.markers[i].infoWindow) {
                            doc.markers[i].infoWindow.close();
                        }
                        doc.markers[i].setMap(null);
                        doc.markers.splice(i, 1);
                    }
                }
            }

            // Parse ground overlays
            if (!!doc.reload && !!doc.groundoverlays) {
                for (i = 0; i < doc.groundoverlays.length; i++) {
                    doc.groundoverlays[i].active = false;
                }
            }

            if (!!doc) {
                doc.groundoverlays = doc.groundoverlays || [];
            }
            // doc.groundoverlays =[];
            var groundOverlay, color, transparency, overlay;
            var groundNodes = getElementsByTagName(responseXML, 'GroundOverlay');
            for (i = 0; i < groundNodes.length; i++) {
                node = groundNodes[i];

                // Detect images buried in KMZ files (and use a base64 encoded URL)
                var gnUrl = cleanURL(doc.baseDir, nodeValue(getElementsByTagName(node, 'href')[0]));
                if (kmzMetaData[gnUrl]) gnUrl = kmzMetaData[gnUrl].dataUrl;

                // Init the ground overlay object
                groundOverlay = {
                    name: nodeValue(getElementsByTagName(node, 'name')[0]),
                    description: nodeValue(getElementsByTagName(node, 'description')[0]),
                    icon: {href: gnUrl},
                    latLonBox: {
                        north: parseFloat(nodeValue(getElementsByTagName(node, 'north')[0])),
                        east: parseFloat(nodeValue(getElementsByTagName(node, 'east')[0])),
                        south: parseFloat(nodeValue(getElementsByTagName(node, 'south')[0])),
                        west: parseFloat(nodeValue(getElementsByTagName(node, 'west')[0]))
                    },
                    index: i
                };
                if (!!google.maps) {
                    doc.bounds = doc.bounds || new google.maps.LatLngBounds();
                    doc.bounds.union(new google.maps.LatLngBounds(
                        new google.maps.LatLng(groundOverlay.latLonBox.south, groundOverlay.latLonBox.west),
                        new google.maps.LatLng(groundOverlay.latLonBox.north, groundOverlay.latLonBox.east)
                    ));
                }

                // Opacity is encoded in the color node
                var colorNode = getElementsByTagName(node, 'color');
                if (colorNode && colorNode.length > 0) {
                    groundOverlay.opacity = geoXML3.getOpacity(nodeValue(colorNode[0]));
                } else {
                    groundOverlay.opacity = 1.0;  // KML default
                }

                doc.groundoverlays.push(groundOverlay);
                if (!!parserOptions.createOverlay) {
                    // User-defined overlay handler
                    parserOptions.createOverlay(groundOverlay, doc);
                } else {
                    // Check to see if this overlay was created on a previous load of this document
                    var found = false;
                    if (!!doc) {
                        doc.groundoverlays = doc.groundoverlays || [];
                        if (doc.reload) {
                            overlayBounds = new google.maps.LatLngBounds(
                                new google.maps.LatLng(groundOverlay.latLonBox.south, groundOverlay.latLonBox.west),
                                new google.maps.LatLng(groundOverlay.latLonBox.north, groundOverlay.latLonBox.east)
                            );
                            var overlays = doc.groundoverlays;
                            for (i = overlays.length; i--;) {
                                if ((overlays[i].bounds().equals(overlayBounds)) &&
                                    (overlays.url_ === groundOverlay.icon.href)) {
                                    found = overlays[i].active = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (!found) {
                        // Call the built-in overlay creator
                        overlay = createOverlay(groundOverlay, doc);
                        overlay.active = true;
                    }
                }
                if (!!doc.reload && !!doc.groundoverlays && !!doc.groundoverlays.length) {
                    var overlays = doc.groundoverlays;
                    for (i = overlays.length; i--;) {
                        if (!overlays[i].active) {
                            overlays[i].remove();
                            overlays.splice(i, 1);
                        }
                    }
                    doc.groundoverlays = overlays;
                }
            }

            // Parse network links
            var networkLink;
            var docPath = document.location.pathname.split('/');
            docPath = docPath.splice(0, docPath.length - 1).join('/');
            var linkNodes = getElementsByTagName(responseXML, 'NetworkLink');
            for (i = 0; i < linkNodes.length; i++) {
                node = linkNodes[i];

                // Init the network link object
                networkLink = {
                    name: nodeValue(getElementsByTagName(node, 'name')[0]),
                    link: {
                        href: nodeValue(getElementsByTagName(node, 'href')[0]),
                        refreshMode: nodeValue(getElementsByTagName(node, 'refreshMode')[0])
                    }
                };

                // Establish the specific refresh mode
                if (!networkLink.link.refreshMode) {
                    networkLink.link.refreshMode = 'onChange';
                }
                if (networkLink.link.refreshMode === 'onInterval') {
                    networkLink.link.refreshInterval = parseFloat(nodeValue(getElementsByTagName(node, 'refreshInterval')[0]));
                    if (isNaN(networkLink.link.refreshInterval)) {
                        networkLink.link.refreshInterval = 0;
                    }
                } else if (networkLink.link.refreshMode === 'onChange') {
                    networkLink.link.viewRefreshMode = nodeValue(getElementsByTagName(node, 'viewRefreshMode')[0]);
                    if (!networkLink.link.viewRefreshMode) {
                        networkLink.link.viewRefreshMode = 'never';
                    }
                    if (networkLink.link.viewRefreshMode === 'onStop') {
                        networkLink.link.viewRefreshTime = nodeValue(getElementsByTagName(node, 'refreshMode')[0]);
                        networkLink.link.viewFormat = nodeValue(getElementsByTagName(node, 'refreshMode')[0]);
                        if (!networkLink.link.viewFormat) {
                            networkLink.link.viewFormat = 'BBOX=[bboxWest],[bboxSouth],[bboxEast],[bboxNorth]';
                        }
                    }
                }

                if (!/^[\/|http]/.test(networkLink.link.href)) {
                    // Fully-qualify the HREF
                    networkLink.link.href = docPath + '/' + networkLink.link.href;
                }

                // Apply the link
                if ((networkLink.link.refreshMode === 'onInterval') &&
                    (networkLink.link.refreshInterval > 0)) {
                    // Reload at regular intervals
                    setInterval(parserName + '.parse("' + networkLink.link.href + '")',
                        1000 * networkLink.link.refreshInterval);
                } else if (networkLink.link.refreshMode === 'onChange') {
                    if (networkLink.link.viewRefreshMode === 'never') {
                        // Load the link just once
                        doc.internals.parser.parse(networkLink.link.href, doc.internals.docSet);
                    } else if (networkLink.link.viewRefreshMode === 'onStop') {
                        // Reload when the map view changes

                    }
                }
            }
        }

        if (!!doc.bounds) {
            doc.internals.bounds = doc.internals.bounds || new google.maps.LatLngBounds();
            doc.internals.bounds.union(doc.bounds);
        }
        if (!!doc.markers || !!doc.groundoverlays || !!doc.gpolylines || !!doc.gpolygons) {
            doc.internals.parseOnly = false;
        }

        if (!doc.internals.parseOnly) {
            // geoXML3 is not being used only as a real-time parser, so keep the processed documents around
            if (doc.baseUrl) { // handle case from parseKmlString (no doc.baseUrl)
                if (!docsByUrl[doc.baseUrl]) {
                    docs.push(doc);
                    docsByUrl[doc.baseUrl] = doc;
                } else {
                    // internal replacement, which keeps the same memory ref loc in docs and docsByUrl
                    for (var i in docsByUrl[doc.baseUrl]) {
                        docsByUrl[doc.baseUrl][i] = doc[i];
                    }
                }
            }
        }

        doc.internals.remaining--;
        if (doc.internals.remaining === 0) {
            // We're done processing this set of KML documents
            // Options that get invoked after parsing completes
            if (parserOptions.zoom && !!doc.internals.bounds && !doc.internals.bounds.isEmpty() && !!parserOptions.map) {
                parserOptions.map.fitBounds(doc.internals.bounds);
            }
            if (parserOptions.afterParse) {
                parserOptions.afterParse(doc.internals.docSet, promise);
            }
            google.maps.event.trigger(doc.internals.parser, 'parsed');
        }
    };

    var kmlColor = function (kmlIn, colorMode) {
        var kmlColor = {};
        kmlIn = kmlIn || 'ffffffff';  // white (KML 2.2 default)

        var aa = kmlIn.substr(0, 2);
        var bb = kmlIn.substr(2, 2);
        var gg = kmlIn.substr(4, 2);
        var rr = kmlIn.substr(6, 2);

        kmlColor.opacity = parseInt(aa, 16) / 256;
        kmlColor.color = (colorMode === 'random') ? randomColor(rr, gg, bb) : '#' + rr + gg + bb;
        return kmlColor;
    };

    // Implemented per KML 2.2 <ColorStyle> specs
    var randomColor = function (rr, gg, bb) {
        var col = {rr: rr, gg: gg, bb: bb};
        for (var k in col) {
            var v = col[k];
            if (v == null) v = 'ff';

            // RGB values are limiters for random numbers (ie: 7f would be a random value between 0 and 7f)
            v = Math.round(Math.random() * parseInt(rr, 16)).toString(16);
            if (v.length === 1) v = '0' + v;
            col[k] = v;
        }

        return '#' + col.rr + col.gg + col.bb;
    };

    var processStyleID = function (style) {
        var icon = style.icon;
        if (!icon || !icon.href) return;

        if (icon.img && !icon.img.complete && (icon.dim.w < 0) && (icon.dim.h < 0)) {
            // we're still waiting on the image loading (probably because we've been blocking since the declaration)
            // so, let's queue this function on the onload stack
            icon.markerBacklog = [];
            icon.img.onload = function () {
                if (icon.dim.w < 0 || icon.dim.h < 0) {
                    icon.dim.w = this.width;
                    icon.dim.h = this.height;
                } else {
                    icon.dim.th = this.height;
                }
                processStyleID(style);

                // we will undoubtedly get some createMarker queuing, so set this up in advance
                for (var i = 0; i < icon.markerBacklog.length; i++) {
                    var p = icon.markerBacklog[i][0];
                    var d = icon.markerBacklog[i][1];
                    createMarker(p, d);
                    if (p.marker) p.marker.active = true;
                }
                delete icon.markerBacklog;
            };
            return;
        }
        else { //if (icon.dim.w < 0 || icon.dim.h < 0) {
            if (icon.img && icon.img.complete) {
                // sometimes the file is already cached and it never calls onLoad
                if (icon.dim.w < 0 || icon.dim.h < 0) {
                    icon.dim.w = icon.img.width;
                    icon.dim.h = icon.img.height;
                } else {
                    icon.dim.th = icon.img.height;
                }
            }
            else {
                // settle for a default of 32x32
                icon.dim.whGuess = true;
                icon.dim.w = 32;
                icon.dim.h = 32;
                icon.dim.th = 32;
            }
        }

        // pre-scaled variables
        var rnd = Math.round;
        var y = icon.dim.y;
        if (typeof icon.dim.th !== 'undefined' && icon.dim.th != icon.dim.h) { // palette - reverse kml y for maps
            y = Math.abs(y - (icon.dim.th - icon.dim.h));
        }

        var scaled = {
            x: icon.dim.x * icon.scale,
            y: y * icon.scale,
            w: icon.dim.w * icon.scale,
            h: icon.dim.h * icon.scale,
            aX: icon.hotSpot.x * icon.scale,
            aY: icon.hotSpot.y * icon.scale,
            iW: (icon.img ? icon.img.width : icon.dim.w) * icon.scale,
            iH: (icon.img ? icon.img.height : icon.dim.h) * icon.scale
        };

        // Figure out the anchor spot
        // Origins, anchor positions and coordinates of the marker increase in the X direction to the right and in
        // the Y direction down.
        var aX, aY;
        switch (icon.hotSpot.xunits) {
            case 'fraction':
                aX = rnd(scaled.aX * icon.dim.w);
                break;
            case 'insetPixels':
                aX = rnd(icon.dim.w * icon.scale - scaled.aX);
                break;
            default:
                aX = rnd(scaled.aX);
                break;  // already pixels
        }
        aY = scaled.h - rnd(((icon.hotSpot.yunits === 'fraction') ? icon.dim.h : 1) * scaled.aY);  // insetPixels Y = pixels Y
        var iconAnchor = new google.maps.Point(aX, aY);

        // Sizes
        // (NOTE: Scale is applied to entire image, not just the section of the icon palette.)
        var iconSize = icon.dim.whGuess ? null : new google.maps.Size(rnd(scaled.w), rnd(scaled.h));
        var iconScale = icon.scale == 1.0 ? null :
            icon.dim.whGuess ? new google.maps.Size(rnd(scaled.w), rnd(scaled.h))
                : new google.maps.Size(rnd(scaled.iW), rnd(scaled.iH));
        var iconOrigin = new google.maps.Point(rnd(scaled.x), rnd(scaled.y));

        // Detect images buried in KMZ files (and use a base64 encoded URL)
        if (kmzMetaData[icon.url]) icon.url = kmzMetaData[icon.url].dataUrl;

        // Init the style object with the KML icon
        icon.marker = {
            url: icon.url,        // url
            size: iconSize,       // size
            origin: iconOrigin,   // origin
            anchor: iconAnchor,   // anchor
            scaledSize: iconScale // scaledSize
        };

        // Look for a predictable shadow
        var stdRegEx = /\/(red|blue|green|yellow|lightblue|purple|pink|orange)(-dot)?\.png/;
        var shadowSize = new google.maps.Size(59, 32);
        var shadowPoint = new google.maps.Point(16, 32);
        if (stdRegEx.test(icon.href)) {
            // A standard GMap-style marker icon
            icon.shadow = {
                url: 'http://maps.google.com/mapfiles/ms/micons/msmarker.shadow.png', // url
                size: shadowSize,    // size
                origin: null,        // origin
                anchor: shadowPoint, // anchor
                scaledSize: shadowSize // scaledSize
            };
        } else if (icon.href.indexOf('-pushpin.png') > -1) {
            // Pushpin marker icon
            icon.shadow = {
                url: 'http://maps.google.com/mapfiles/ms/micons/pushpin_shadow.png',  // url
                size: shadowSize,    // size
                origin: null,        // origin
                anchor: shadowPoint, // anchor
                scaledSize: shadowSize // scaledSize
            };
        }
        /* else {
         // Other MyMaps KML standard icon
         icon.shadow = new google.maps.MarkerImage(
         icon.href.replace('.png', '.shadow.png'),                        // url
         shadowSize,                                                      // size
         null,                                                            // origin
         anchorPoint,                                                     // anchor
         shadowSize                                                       // scaledSize
         );
         } */
    }

    var processStyles = function (doc) {
        for (var styleID in doc.styles) {
            processStyleID(doc.styles[styleID]);
        }
    };

    var createMarker = function (placemark, doc) {
        // create a Marker to the map from a placemark KML object
        var icon = placemark.style.icon;

        if (!icon.marker && icon.img) {
            // yay, single point of failure is holding up multiple markers...
            icon.markerBacklog = icon.markerBacklog || [];
            icon.markerBacklog.push([placemark, doc]);
            return;
        }

        // Load basic marker properties
        var markerOptions = geoXML3.combineOptions(parserOptions.markerOptions, {
            map: parserOptions.map,
            position: new google.maps.LatLng(placemark.Point.coordinates[0].lat, placemark.Point.coordinates[0].lng),
            title: placemark.name,
            zIndex: Math.round(placemark.Point.coordinates[0].lat * -100000) << 5,
            icon: icon.marker,
            shadow: icon.shadow,
            flat: !icon.shadow,
            visible: placemark.visibility
        });

        // Create the marker on the map
        var marker = new google.maps.Marker(markerOptions);
        if (!!doc) doc.markers.push(marker);

        // Set up and create the infowindow if it is not suppressed
        createInfoWindow(placemark, doc, marker);
        placemark.marker = marker;
        return marker;
    };

    var createOverlay = function (groundOverlay, doc) {
        // Add a ProjectedOverlay to the map from a groundOverlay KML object

        if (!window.ProjectedOverlay) {
            throw 'geoXML3 error: ProjectedOverlay not found while rendering GroundOverlay from KML';
        }

        var bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(groundOverlay.latLonBox.south, groundOverlay.latLonBox.west),
            new google.maps.LatLng(groundOverlay.latLonBox.north, groundOverlay.latLonBox.east)
        );
        var overlayOptions = geoXML3.combineOptions(parserOptions.overlayOptions, {
            percentOpacity: groundOverlay.opacity * 100,
            index: groundOverlay.index
        });
        var overlay = new ProjectedOverlay(parserOptions.map, groundOverlay.icon.href, bounds, overlayOptions);

        if (!!doc) {
            doc.ggroundoverlays = doc.ggroundoverlays || [];
            doc.ggroundoverlays.push(overlay);
        }
        if (typeof parserOptions.onAfterCreateGroundOverlay === 'function') {
            parserOptions.onAfterCreateGroundOverlay(overlay);
        }
        return overlay;
    };

    // Create Polyline
    var createPolyline = function (placemark, doc) {
        var paths = [];
        var bounds = new google.maps.LatLngBounds();
        for (var j = 0; j < placemark.LineString.length; j++) {
            var path = [];
            var coords = placemark.LineString[j].coordinates;
            for (var i = 0; i < coords.length; i++) {
                var pt = new google.maps.LatLng(coords[i].lat, coords[i].lng);
                path.push(pt);
                bounds.extend(pt);
            }
            paths.push(path);
        }
        // point to open the infowindow if triggered
        var point = paths[0][Math.floor(path.length / 2)];
        // Load basic polyline properties
        var kmlStrokeColor = kmlColor(placemark.style.line.color, placemark.style.line.colorMode);
        var polyOptions = geoXML3.combineOptions(parserOptions.polylineOptions, {
            map: parserOptions.map,
            path: path,
            strokeColor: kmlStrokeColor.color,
            strokeWeight: placemark.style.line.width,
            strokeOpacity: kmlStrokeColor.opacity,
            title: placemark.name,
            visible: placemark.visibility,
            index: placemark.index
        });
        if (paths.length > 1) {
            polyOptions.paths = paths;
            var p = new MultiGeometry(polyOptions);
        } else {
            polyOptions.path = paths[0];
            var p = new google.maps.Polyline(polyOptions);
        }
        p.bounds = bounds;

        // setup and create the infoWindow if it is not suppressed
        createInfoWindow(placemark, doc, p);
        if (!!doc) doc.gpolylines.push(p);
        placemark.polyline = p;
        if (typeof parserOptions.onAfterCreatePolyLine === 'function') {
            parserOptions.onAfterCreatePolyLine(p, placemark);
        }
        return p;
    }

    // Create Polygon
    var createPolygon = function (placemark, doc) {
        var bounds = new google.maps.LatLngBounds();
        var pathsLength = 0;
        var paths = [];
        for (var polygonPart = 0; polygonPart < placemark.Polygon.length; polygonPart++) {
            for (var j = 0; j < placemark.Polygon[polygonPart].outerBoundaryIs.length; j++) {
                var coords = placemark.Polygon[polygonPart].outerBoundaryIs[j].coordinates;
                var path = [];
                for (var i = 0; i < coords.length; i++) {
                    var pt = new google.maps.LatLng(coords[i].lat, coords[i].lng);
                    path.push(pt);
                    bounds.extend(pt);
                }
                paths.push(path);
                pathsLength += path.length;
            }
            for (var j = 0; j < placemark.Polygon[polygonPart].innerBoundaryIs.length; j++) {
                var coords = placemark.Polygon[polygonPart].innerBoundaryIs[j].coordinates;
                var path = [];
                for (var i = 0; i < coords.length; i++) {
                    var pt = new google.maps.LatLng(coords[i].lat, coords[i].lng);
                    path.push(pt);
                    bounds.extend(pt);
                }
                paths.push(path);
                pathsLength += path.length;
            }
        }

        // Load basic polygon properties
        var kmlStrokeColor = kmlColor(placemark.style.line.color, placemark.style.line.colorMode);
        var kmlFillColor = kmlColor(placemark.style.poly.color, placemark.style.poly.colorMode);
        if (!placemark.style.poly.fill) kmlFillColor.opacity = 0.0;
        var strokeWeight = placemark.style.line.width;
        if (!placemark.style.poly.outline) {
            strokeWeight = 0;
            kmlStrokeColor.opacity = 0.0;
        }
        var polyOptions = geoXML3.combineOptions(parserOptions.polygonOptions, {
            map: parserOptions.map,
            paths: paths,
            title: placemark.name,
            strokeColor: kmlStrokeColor.color,
            strokeWeight: strokeWeight,
            strokeOpacity: kmlStrokeColor.opacity,
            fillColor: kmlFillColor.color,
            fillOpacity: kmlFillColor.opacity,
            visible: placemark.visibility,
            index: placemark.index
        });
        var p = new google.maps.Polygon(polyOptions);
        p.bounds = bounds;

        createInfoWindow(placemark, doc, p);
        if (!!doc) doc.gpolygons.push(p);
        placemark.polygon = p;
        if (typeof parserOptions.onAfterCreatePolygon === 'function') {
            parserOptions.onAfterCreatePolygon(p, placemark);
        }
        return p;
    };

    var createInfoWindow = function (placemark, doc, gObj) {
        var bStyle = placemark.style.balloon;
        var vars = placemark.vars;

        if (!placemark.balloonVisibility || bStyle.displayMode === 'hide') return;

        // define geDirections
        if (placemark.latlng &&
            (!parserOptions.suppressDirections || !parserOptions.suppressDirections)) {
            vars.directions.push('sll=' + placemark.latlng.toUrlValue());

            var url = 'http://maps.google.com/maps?' + vars.directions.join('&');
            var address = encodeURIComponent(vars.val.address || placemark.latlng.toUrlValue()).replace(/\%20/g, '+');

            vars.val.geDirections = '<a href="' + url + '&daddr=' + address + '" target=_blank>To Here</a> - <a href="' + url + '&saddr=' + address + '" target=_blank>From Here</a>';
        }
        else vars.val.geDirections = '';

        // add in the variables
        var iwText = bStyle.text.replace(/\$\[(\w+(\/displayName)?)\]/g, function (txt, n, dn) {
            return dn ? vars.display[n] : vars.val[n];
        });
        var classTxt = 'geoxml3_infowindow geoxml3_style_' + placemark.styleID;

        // color styles
        var styleArr = [];
        if (bStyle.bgColor != 'ffffffff') styleArr.push('background: ' + kmlColor(bStyle.bgColor).color + ';');
        if (bStyle.textColor != 'ff000000') styleArr.push('color: ' + kmlColor(bStyle.textColor).color + ';');
        var styleProp = styleArr.length ? ' style="' + styleArr.join(' ') + '"' : '';

        var infoWindowOptions = geoXML3.combineOptions(parserOptions.infoWindowOptions, {
            content: '<div class="' + classTxt + '"' + styleProp + '>' + iwText + '</div>',
            pixelOffset: new google.maps.Size(0, 2)
        });

        gObj.infoWindow = parserOptions.infoWindow || new google.maps.InfoWindow(infoWindowOptions);
        delete infoWindowOptions.content;
        gObj.infoWindowOptions = infoWindowOptions;

        // Info Window-opening event handler
        google.maps.event.addListener(gObj, 'click', function (e) {
            var iW = this.infoWindow;
            iW.close();
            iW.setOptions(this.infoWindowOptions);

            if (e && e.latLng) iW.setPosition(e.latLng);
            else if (this.bounds)   iW.setPosition(this.bounds.getCenter());

            //iW.setContent("<div id='geoxml3_infowindow'>" + iW.getContent() + "</div>");
            google.maps.event.addListenerOnce(iW, "domready", function () {
                /*var node = document.getElementById('geoxml3_infowindow');
                 var imgArray = node.getElementsByTagName('img');
                 for (var i = 0; i < imgArray.length; i++) {
                 var imgUrlIE = imgArray[i].getAttribute("src");
                 var imgUrl = cleanURL(doc.baseDir, imgUrlIE);

                 if (kmzMetaData[imgUrl]) {
                 imgArray[i].src = kmzMetaData[imgUrl].dataUrl;
                 } else if (kmzMetaData[imgUrlIE]) {
                 imgArray[i].src = kmzMetaData[imgUrlIE].dataUrl;
                 }
                 }*/
            });
            iW.open(this.map, this.bounds ? null : this);
            if (typeof this.infoWindow.$onOpen === 'function') {
                this.infoWindow.$onOpen(gObj);
            }
        });

    }

    return {
        // Expose some properties and methods

        options: parserOptions,
        docs: docs,
        docsByUrl: docsByUrl,
        kmzMetaData: kmzMetaData,

        parse: parse,
        render: render,
        parseKmlString: parseKmlString,
        hideDocument: hideDocument,
        showDocument: showDocument,
        processStyles: processStyles,
        createMarker: createMarker,
        createOverlay: createOverlay,
        createPolyline: createPolyline,
        createPolygon: createPolygon
    };
};
// End of KML Parser

// Helper objects and functions
geoXML3.getOpacity = function (kmlColor) {
    // Extract opacity encoded in a KML color value. Returns a number between 0 and 1.
    if (!!kmlColor &&
        (kmlColor !== '') &&
        (kmlColor.length == 8)) {
        var transparency = parseInt(kmlColor.substr(0, 2), 16);
        return transparency / 255;
    } else {
        return 1;
    }
};

// Log a message to the debugging console, if one exists
geoXML3.log = function (msg) {
    if (!!window.console) {
        console.log(msg);
    } else {
        alert("log:" + msg);
    }
};

/**
 * Creates a new parserOptions object.
 * @class GeoXML3 parser options.
 * @param {Object} overrides Any options you want to declare outside of the defaults should be included here.
 * @property {google.maps.Map} map The API map on which geo objects should be rendered.
 * @property {google.maps.MarkerOptions} markerOptions If the parser is adding Markers to the map itself, any options specified here will be applied to them.
 * @property {google.maps.InfoWindowOptions} infoWindowOptions If the parser is adding Markers to the map itself, any options specified here will be applied to their attached InfoWindows.
 * @property {ProjectedOverlay.options} overlayOptions If the parser is adding ProjectedOverlays to the map itself, any options specified here will be applied to them.
 */
geoXML3.parserOptions = function (overrides) {
    this.map = null,
    /** If true, the parser will automatically move the map to a best-fit of the geodata after parsing of a KML document completes.
     * @type Boolean
     * @default true
     */
        this.zoom = true,
    /**#@+ @type Boolean
     *     @default false */
    /** If true, only a single Marker created by the parser will be able to have its InfoWindow open at once (simulating the behavior of GMaps API v2). */
        this.singleInfoWindow = false,
    /** If true, suppresses the rendering of info windows. */
        this.suppressInfoWindows = false,
    /**
     * Control whether to process styles now or later.
     *
     * <p>By default, the parser only processes KML &lt;Style&gt; elements into their GMaps equivalents
     * if it will be creating its own Markers (the createMarker option is null). Setting this option
     * to true will force such processing to happen anyway, useful if you're going to be calling parser.createMarker
     * yourself later. OTOH, leaving this option false removes runtime dependency on the GMaps API, enabling
     * the use of geoXML3 as a standalone KML parser.</p>
     */
        this.processStyles = false,
    /**#@-*/

        this.markerOptions = {},
        this.infoWindowOptions = {},
        this.overlayOptions = {},

    /**#@+ @event */
    /** This function will be called when parsing of a KML document is complete.
     * @param {geoXML3.parser#docs} doc Parsed KML data. */
        this.afterParse = null,
    /** This function will be called when parsing of a KML document is complete.
     * @param {geoXML3.parser#docs} doc Parsed KML data. */
        this.failedParse = null,
    /**
     * If supplied, this function will be called once for each marker <Placemark> in the KML document, instead of the parser adding its own Marker to the map.
     * @param {geoXML3.parser.render#placemark} placemark Placemark object.
     * @param {geoXML3.parser#docs} doc Parsed KML data.
     */
        this.createMarker = null,
    /**
     * If supplied, this function will be called once for each <GroundOverlay> in the KML document, instead of the parser adding its own ProjectedOverlay to the map.
     * @param {geoXML3.parser.render#groundOverlay} groundOverlay GroundOverlay object.
     * @param {geoXML3.parser#docs} doc Parsed KML data.
     */
        this.createOverlay = null
    /**#@-*/

    if (overrides) {
        for (var prop in overrides) {
            if (overrides.hasOwnProperty(prop)) this[prop] = overrides[prop];
        }
    }
    return this;
};

/**
 * Combine two options objects: a set of default values and a set of override values.
 *
 * @deprecated This has been replaced with {@link geoXML3.parserOptions#combineOptions}.
 * @param {geoXML3.parserOptions|Object} overrides Override values.
 * @param {geoXML3.parserOptions|Object} defaults Default values.
 * @return {geoXML3.parserOptions} Combined result.
 */
geoXML3.combineOptions = function (overrides, defaults) {
    var result = {};
    if (!!overrides) {
        for (var prop in overrides) {
            if (overrides.hasOwnProperty(prop))                              result[prop] = overrides[prop];
        }
    }
    if (!!defaults) {
        for (prop in defaults) {
            if (defaults.hasOwnProperty(prop) && result[prop] === undefined) result[prop] = defaults[prop];
        }
    }
    return result;
};

/**
 * Combine two options objects: a set of default values and a set of override values.
 *
 * @function
 * @param {geoXML3.parserOptions|Object} overrides Override values.
 * @param {geoXML3.parserOptions|Object} defaults Default values.
 * @return {geoXML3.parserOptions} Combined result.
 */
geoXML3.parserOptions.prototype.combineOptions = geoXML3.combineOptions;

// Retrieve an XML document from url and pass it to callback as a DOM document
geoXML3.fetchers = [];

/**
 * Parses a XML string.
 *
 * <p>Parses the given XML string and returns the parsed document in a
 * DOM data structure. This function will return an empty DOM node if
 * XML parsing is not supported in this browser.</p>
 *
 * @param {String} str XML string.
 * @return {Element|Document} DOM.
 */
geoXML3.xmlParse = function (str) {
    if ((typeof ActiveXObject != 'undefined') || ("ActiveXObject" in window)) {
        var doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.loadXML(str);
        return doc;
    }

    if (typeof DOMParser != 'undefined') {
        return (new DOMParser()).parseFromString(str, 'text/xml');
    }

    return document.createElement('div', null);
}

/**
 * Checks for XML parse error.
 *
 * @param {xmlDOM} XML DOM.
 * @return boolean.
 */
// from http://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
geoXML3.isParseError = function (parsedDocument) {
    if ((typeof ActiveXObject != 'undefined') || ("ActiveXObject" in window))
        return false;
    // parser and parsererrorNS could be cached on startup for efficiency
    var p = new DOMParser(),
        errorneousParse = p.parseFromString('<', 'text/xml'),
        parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI;

    if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
        // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
        return parsedDocument.getElementsByTagName("parsererror").length > 0;
    }

    return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
};

/**
 * Fetches a XML document.
 *
 * <p>Fetches/parses the given XML URL and passes the parsed document (in a
 * DOM data structure) to the given callback.  Documents are downloaded
 * and parsed asynchronously.</p>
 *
 * @param {String} url URL of XML document.  Must be uncompressed XML only.
 * @param {Function(Document)} callback Function to call when the document is processed.
 */
geoXML3.fetchXML = function (url, callback) {
    function timeoutHandler() {
        callback();
    };

    var xhrFetcher = new Object();
    if (!!geoXML3.fetchers.length) xhrFetcher = geoXML3.fetchers.pop();
    else if (!!window.XMLHttpRequest)   xhrFetcher.fetcher = new window.XMLHttpRequest();  // Most browsers
    else if (!!window.ActiveXObject) {                                                     // Some IE
        // the many versions of IE's XML fetchers
        var AXOs = [
            'MSXML2.XMLHTTP.6.0',
            'MSXML2.XMLHTTP.5.0',
            'MSXML2.XMLHTTP.4.0',
            'MSXML2.XMLHTTP.3.0',
            'MSXML2.XMLHTTP',
            'Microsoft.XMLHTTP',
            'MSXML.XMLHTTP'
        ];
        for (var i = 0; i < AXOs.length; i++) {
            try {
                xhrFetcher.fetcher = new ActiveXObject(AXOs[i]);
                break;
            }
            catch (e) {
                continue;
            }
        }
        if (!xhrFetcher.fetcher) {
            geoXML3.log('Unable to create XHR object');
            callback(null);
            return null;
        }
    }

    xhrFetcher.fetcher.open('GET', url, true);
    if (!!xhrFetcher.fetcher.overrideMimeType) xhrFetcher.fetcher.overrideMimeType('text/xml');
    xhrFetcher.fetcher.onreadystatechange = function () {
        if (xhrFetcher.fetcher.readyState === 4) {
            // Retrieval complete
            if (!!xhrFetcher.xhrtimeout) clearTimeout(xhrFetcher.xhrtimeout);
            if (xhrFetcher.fetcher.status >= 400) {
                geoXML3.log('HTTP error ' + xhrFetcher.fetcher.status + ' retrieving ' + url);
                callback();
            }
            // Returned successfully
            else {
                if (xhrFetcher.fetcher.responseXML) {
                    // Sometimes IE will get the data, but won't bother loading it as an XML doc
                    var xml = xhrFetcher.fetcher.responseXML;
                    if (xml && !xml.documentElement && !xml.ownerElement) {
                        xml.loadXML(xhrFetcher.fetcher.responseText);
                    }
                } else {// handle valid xml sent with wrong MIME type
                    xml = geoXML3.xmlParse(xhrFetcher.fetcher.responseText);
                }
                // handle parse errors
                if (xml.parseError && (xml.parseError.errorCode != 0)) {
                    geoXML3.log("XML parse error " + xml.parseError.errorCode + ", " + xml.parseError.reason + "\nLine:" + xml.parseError.line + ", Position:" + xml.parseError.linepos + ", srcText:" + xml.parseError.srcText);
                    xml = "failed parse"
                } else if (geoXML3.isParseError(xml)) {
                    geoXML3.log("XML parse error");
                    xml = "failed parse"
                }
                callback(xml);
            }
            // We're done with this fetcher object
            geoXML3.fetchers.push(xhrFetcher);
        }
    };

    xhrFetcher.xhrtimeout = setTimeout(timeoutHandler, 60000);
    xhrFetcher.fetcher.send(null);
    return null;
};

var IEversion = function () {
    // http://msdn.microsoft.com/workshop/author/dhtml/overview/browserdetection.asp
    // Returns the version of Internet Explorer or a -1
    // (indicating the use of another browser).
    var rv = -1; // Return value assumes failure
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null) {
            rv = parseFloat(RegExp.$1);
        }
    }
    return rv;
};

/**
 * Fetches a KMZ document.
 *
 * <p>Fetches/parses the given ZIP URL, parses each image file, and passes
 * the parsed KML document to the given callback.  Documents are downloaded
 * and parsed asynchronously, though the KML file is always passed after the
 * images have been processed, in case the callback requires the image data.</p>
 *
 * @requires ZipFile.complete.js
 * @param {String} url URL of KMZ document.  Must be a valid KMZ/ZIP archive.
 * @param {Function(Document)} callback Function to call when the document is processed.
 * @param {geoXML3.parser} parser A geoXML3.parser object.  This is used to populate the KMZ image data.
 * @author Brendan Byrd
 * @see http://code.google.com/apis/kml/documentation/kmzarchives.html
 */
geoXML3.fetchZIP = function (url, callback, parser) {
    // Just need a single 'new' declaration with a really long function...
    var zipFile = new ZipFile(url, function (zip) {
        // Retrieval complete

        // Check for ERRORs in zip.status
        for (var i = 0; i < zip.status.length; i++) {
            var msg = zip.status[i];
            if (msg.indexOf("ERROR") == 0) {
                geoXML3.log('HTTP/ZIP error retrieving ' + url + ': ' + msg);
                callback();
                return;
            }
            else if (msg.indexOf("WARNING") == 0) {  // non-fatal, but still might be useful
                geoXML3.log('HTTP/ZIP warning retrieving ' + url + ': ' + msg);
            }
        }

        // Make sure KMZ structure is according to spec (with a single KML file in the root dir)
        var KMLCount = 0;
        var KML;
        for (var i = 0; i < zip.entries.length; i++) {
            var name = zip.entries[i].name;
            if (!/\.kml$/.test(name)) continue;

            KMLCount++;
            if (KMLCount == 1) KML = i;
            else {
                geoXML3.log('KMZ warning retrieving ' + url + ': found extra KML "' + name + '" in KMZ; discarding...');
            }
        }

        // Returned successfully, but still needs extracting
        var baseUrl = cleanURL(defileURL(url), url) + '/';
        var kmlProcessing = {  // this is an object just so it gets passed properly
            timer: null,
            extractLeft: 0,
            timerCalls: 0
        };
        var extractCb = function (entry, entryContent) {
            var mdUrl = cleanURL(baseUrl, entry.name);
            var ext = entry.name.substring(entry.name.lastIndexOf(".") + 1).toLowerCase();
            kmlProcessing.extractLeft--;

            if ((typeof entryContent.description == "string") && (entryContent.name == "Error")) {
                geoXML3.log('KMZ error extracting ' + mdUrl + ': ' + entryContent.description);
                callback();
                return;
            }

            // MIME types that can be used in KML
            var mime;
            if (ext === 'jpg') ext = 'jpeg';
            if (/^(gif|jpeg|png)$/.test(ext)) mime = 'image/' + ext;
            else if (ext === 'mp3')           mime = 'audio/mpeg';
            else if (ext === 'm4a')           mime = 'audio/mp4';
            else if (ext === 'm4a')           mime = 'audio/MP4-LATM';
            else                              mime = 'application/octet-stream';

            parser.kmzMetaData[mdUrl] = {};
            parser.kmzMetaData[mdUrl].entry = entry;
            // data:image/gif;base64,R0lGODlhEAAOALMA...
            parser.kmzMetaData[mdUrl].dataUrl = 'data:' + mime + ';base64,' + base64Encode(entryContent);
            // IE cannot handle GET requests beyond 2071 characters, even if it's an inline image
            if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
                if (((IEversion() < 8.0) &&
                    (parser.kmzMetaData[mdUrl].dataUrl.length > 2071)) ||
                    ((IEversion < 9.0) &&
                    (parser.kmzMetaData[mdUrl].dataUrl.length > 32767))) {
                    parser.kmzMetaData[mdUrl].dataUrl =
                        // this is a simple IE icon; to hint at the problem...
                        'data:image/gif;base64,R0lGODlhDwAQAOMPADBPvSpQ1Dpoyz1p6FhwvU2A6ECP63CM04CWxYCk+V6x+UK++Jao3rvC3fj7+v///yH5BAEKAA8ALAAAAAAPABAAAASC8Mk5mwCAUMlWwcLRHEelLA' +
                        'oGDMgzSsiyGCAhCETDPMh5XQCBwYBrNBIKWmg0MCQHj8MJU5IoroYCY6AAAgrDIbbQDGIK6DR5UPhlNo0JAlSUNAiDgH7eNAxEDWAKCQM2AAFheVxYAA0AIkFOJ1gBcQQaUQKKA5w7LpcEBwkJaKMUEQA7';
                }
            }
            parser.kmzMetaData[internalSrc(entry.name)] = parser.kmzMetaData[mdUrl];

        };
        var kmlExtractCb = function (entry, entryContent) {
            if ((typeof entryContent.description == "string") && (entryContent.name == "Error")) {
                geoXML3.log('KMZ error extracting ' + mdUrl + ': ' + entryContent.description);
                callback();
                return;
            }

            // check to see if the KML is the last file extracted
            clearTimeout(kmlProcessing.timer);
            if (kmlProcessing.extractLeft <= 1) {
                kmlProcessing.extractLeft--;
                callback(geoXML3.xmlParse(entryContent));
                return;
            }
            else {
                // KML file isn't last yet; it may need to use those files, so wait a bit (100ms)
                kmlProcessing.timerCalls++;
                if (kmlProcessing.timerCalls < 100) {
                    kmlProcessing.timer = setTimeout(function () {
                        kmlExtractCb(entry, entryContent);
                    }, 100);
                }
                else {
                    geoXML3.log('KMZ warning extracting ' + url + ': entire ZIP has not been extracted after 10 seconds; running through KML, anyway...');
                    kmlProcessing.extractLeft--;
                    callback(geoXML3.xmlParse(entryContent));
                }
            }
            return;
        };
        for (var i = 0; i < zip.entries.length; i++) {
            var entry = zip.entries[i];
            var ext = entry.name.substring(entry.name.lastIndexOf(".") + 1).toLowerCase();
            if (!/^(gif|jpe?g|png|kml)$/.test(ext)) continue;  // not going to bother to extract files we don't support
            if (ext === "kml" && i != KML)          continue;  // extra KMLs get discarded
            if (!parser && ext != "kml")            continue;  // cannot store images without a parser object

            // extract asynchronously
            kmlProcessing.extractLeft++;
            if (ext === "kml") entry.extract(kmlExtractCb);
            else               entry.extract(extractCb);
        }
    });

};

/**
 * Extract the text value of a DOM node, with leading and trailing whitespace trimmed.
 *
 * @param {Element} node XML node/element.
 * @param {Any} delVal Default value if the node doesn't exist.
 * @return {String|Null}
 */
geoXML3.nodeValue = function (node, defVal) {
    var retStr = "";
    if (!node) {
        return (typeof defVal === 'undefined' || defVal === null) ? null : defVal;
    }
    if (node.nodeType == 3 || node.nodeType == 4 || node.nodeType == 2) {
        retStr += node.nodeValue;
    } else if (node.nodeType == 1 || node.nodeType == 9 || node.nodeType == 11) {
        for (var i = 0; i < node.childNodes.length; ++i) {
            retStr += arguments.callee(node.childNodes[i]);
        }
    }
    return retStr;
};

/**
 * Loosely translate various values of a DOM node to a boolean.
 *
 * @param {Element} node XML node/element.
 * @param {Boolean} delVal Default value if the node doesn't exist.
 * @return {Boolean|Null}
 */
geoXML3.getBooleanValue = function (node, defVal) {
    var nodeContents = geoXML3.nodeValue(node);
    if (nodeContents === null) return defVal || false;
    nodeContents = parseInt(nodeContents);
    if (isNaN(nodeContents)) return true;
    if (nodeContents == 0) return false;
    else return true;
}

/**
 * Browser-normalized version of getElementsByTagNameNS.
 *
 * <p>Required because IE8 doesn't define it.</p>
 *
 * @param {Element|Document} node DOM object.
 * @param {String} namespace Full namespace URL to search against.
 * @param {String} tagname XML local tag name.
 * @return {Array of Elements}
 * @author Brendan Byrd
 */
geoXML3.getElementsByTagNameNS = function (node, namespace, tagname) {
    if (node && typeof node.getElementsByTagNameNS != 'undefined') return node.getElementsByTagNameNS(namespace, tagname);
    if (!node) return [];

    var root = node.documentElement || node.ownerDocument && node.ownerDocument.documentElement;
    if (!root || !root.attributes) return [];

    // search for namespace prefix
    for (var i = 0; i < root.attributes.length; i++) {
        var attr = root.attributes[i];
        if (attr.prefix === 'xmlns' && attr.nodeValue === namespace) return node.getElementsByTagName(attr.baseName + ':' + tagname);
        else if (attr.nodeName === 'xmlns' && attr.nodeValue === namespace) {
            // default namespace
            if (typeof node.selectNodes != 'undefined') {
                // Newer IEs have the SelectionNamespace property that can be used with selectNodes
                if (!root.ownerDocument.getProperty('SelectionNamespaces'))
                    root.ownerDocument.setProperty('SelectionNamespaces', "xmlns:defaultNS='" + namespace + "'");
                return node.selectNodes('.//defaultNS:' + tagname);
            }
            else {
                // Otherwise, you can still try to tack on the 'xmlns' attribute to root
                root.setAttribute('xmlns:defaultNS', namespace);
                return node.getElementsByTagName('defaultNS:' + tagname);
            }
        }
    }
    return geoXML3.getElementsByTagName(node, tagname);  // try the unqualified version
};

/**
 * Browser-normalized version of getElementsByTagName.
 *
 * <p>Required because MSXML 6.0 will treat this function as a NS-qualified function,
 * despite the missing NS parameter.</p>
 *
 * @param {Element|Document} node DOM object.
 * @param {String} tagname XML local tag name.
 * @return {Array of Elements}
 * @author Brendan Byrd
 */
geoXML3.getElementsByTagName = function (node, tagname) {
    if (node && typeof node.getElementsByTagNameNS != 'undefined') return node.getElementsByTagName(tagname);  // if it has both functions, it should be accurate
//  if (node && typeof node.selectNodes != 'undefined')            return node.selectNodes(".//*[local-name()='" + tagname + "']");
    return node.getElementsByTagName(tagname);  // hope for the best...
}

/**
 * Turn a directory + relative URL into an absolute one.
 *
 * @private
 * @param {String} d Base directory.
 * @param {String} s Relative URL.
 * @return {String} Absolute URL.
 * @author Brendan Byrd
 */
var toAbsURL = function (d, s) {
    var p, f, i;
    var h = location.protocol + "://" + location.host;

    if (!s.length)           return '';
    if (/^\w+:/.test(s))     return s;
    if (s.indexOf('/') == 0) return h + s;

    p = d.replace(/\/[^\/]*$/, '');
    f = s.match(/\.\.\//g);
    if (f) {
        s = s.substring(f.length * 3);
        for (i = f.length; i--;) {
            p = p.substring(0, p.lastIndexOf('/'));
        }
    }

    return h + p + '/' + s;
}

var internalSrc = function (src) {
    //this gets the full url
    var url = document.location.href;
    //this removes everything after the last slash in the path
    url = url.substring(0, url.lastIndexOf("/") + 1);
    var internalPath = url + src;
    return internalPath;
}

/**
 * Remove current host from URL
 *
 * @private
 * @param {String} s Absolute or relative URL.
 * @return {String} Root-based relative URL.
 * @author Brendan Byrd
 */
var dehostURL = function (s) {
    var h = location.protocol + "://" + location.host;
    h = h.replace(/([\.\\\+\*\?\[\^\]\$\(\)])/g, '\\$1');  // quotemeta
    return s.replace(new RegExp('^' + h, 'i'), '');
}

/**
 * Removes all query strings, #IDs, '../' references, and
 * hosts from a URL.
 *
 * @private
 * @param {String} d Base directory.
 * @param {String} s Absolute or relative URL.
 * @return {String} Root-based relative URL.
 * @author Brendan Byrd
 */
var cleanURL = function (d, s) {
    return dehostURL(toAbsURL(d ? d.split('#')[0].split('?')[0] : defileURL(location.pathname), s ? s.split('#')[0].split('?')[0] : ''));
}
/**
 * Remove filename from URL
 *
 * @private
 * @param {String} s Relative URL.
 * @return {String} Base directory.
 * @author Brendan Byrd
 */
var defileURL = function (s) {
    return s ? s.substr(0, s.lastIndexOf('/') + 1) : '/';
}


// Some extra Array subs for ease of use
// http://stackoverflow.com/questions/143847/best-way-to-find-an-item-in-a-javascript-array
Array.prototype.hasObject = (
    !Array.indexOf ? function (obj) {
        var l = this.length + 1;
        while (l--) {
            if (this[l - 1] === obj) return true;
        }
        return false;
    } : function (obj) {
        return (this.indexOf(obj) !== -1);
    }
);
Array.prototype.hasItemInObj = function (name, item) {
    var l = this.length + 1;
    while (l--) {
        if (this[l - 1][name] === item) return true;
    }
    return false;
};
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, fromIndex) {
        if (fromIndex == null) {
            fromIndex = 0;
        } else if (fromIndex < 0) {
            fromIndex = Math.max(0, this.length + fromIndex);
        }
        for (var i = fromIndex, j = this.length; i < j; i++) {
            if (this[i] === obj) return i;
        }
        return -1;
    };
}
Array.prototype.indexOfObjWithItem = function (name, item, fromIndex) {
    if (fromIndex == null) {
        fromIndex = 0;
    } else if (fromIndex < 0) {
        fromIndex = Math.max(0, this.length + fromIndex);
    }
    for (var i = fromIndex, j = this.length; i < j; i++) {
        if (this[i][name] === item) return i;
    }
    return -1;
};

/**
 * Borrowed from jquery.base64.js, with some "Array as input" corrections
 *
 * @private
 * @param {Array of charCodes} input An array of byte ASCII codes (0-255).
 * @return {String} A base64-encoded string.
 * @author Brendan Byrd
 */
var base64Encode = function (input) {
    var keyString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    while (i < input.length) {
        chr1 = input[i++];
        chr2 = input[i++];
        chr3 = input[i++];
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (chr2 == undefined) enc3 = enc4 = 64;
        else if (chr3 == undefined) enc4 = 64;

        output = output + keyString.charAt(enc1) + keyString.charAt(enc2) + keyString.charAt(enc3) + keyString.charAt(enc4);
    }
    return output;
};

// Create an overlay on the map from a projected image - Maps v3...
// Author. John D. Coryat 05/2009
// USNaviguide LLC - http://www.usnaviguide.com
// Thanks go to Mile Williams EInsert: http://econym.googlepages.com/einsert.js, Google's GOverlay Example and Bratliff's suggestion...
// Opacity code from TPhoto: http://gmaps.tommangan.us/addtphoto.html
// This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA.
//
// Parameters:
//    map: This Map
//    imageUrl: URL of the image (Mandatory)
//    bounds: Bounds object of image destination (Mandatory)
//    Options:
//    addZoom: Added Zoom factor as a parameter to the imageUrl (include complete parameter, including separater like '?zoom='
//    percentOpacity: Default 50, percent opacity to use when the image is loaded 0-100.
//    id: Default imageUrl, ID of the div
//
	
function ProjectedOverlay(map, imageUrl, bounds, opts)
{
 google.maps.OverlayView.call(this);

 this.map_ = map;
 this.url_ = imageUrl ;
 this.bounds_ = bounds ;
 this.addZ_ = opts.addZoom || '' ;				// Add the zoom to the image as a parameter
 this.id_ = opts.id || this.url_ ;				// Added to allow for multiple images
 this.percentOpacity_ = opts.percentOpacity || 50 ;

 this.setMap(map);
}

ProjectedOverlay.prototype = new google.maps.OverlayView();

ProjectedOverlay.prototype.createElement = function()
{
 var panes = this.getPanes() ;
 var div = this.div_ ;

 if (!div)
 {
  div = this.div_ = document.createElement("div");
  div.style.position = "absolute" ;
  div.setAttribute('id',this.id_) ;
  this.div_ = div ;
  this.lastZoom_ = -1 ;
  if( this.percentOpacity_ )
  {
   this.setOpacity(this.percentOpacity_) ;
  }
  panes.overlayLayer.appendChild(div);
 }
}

// Remove the main DIV from the map pane

ProjectedOverlay.prototype.remove = function()
{
 if (this.div_) 
 {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
  this.setMap(null);
 }
}

// Redraw based on the current projection and zoom level...

ProjectedOverlay.prototype.draw = function(firstTime)
{
 // Creates the element if it doesn't exist already.

 this.createElement();

 if (!this.div_)
 {
  return ;
 }

 var c1 = this.get('projection').fromLatLngToDivPixel(this.bounds_.getSouthWest());
 var c2 = this.get('projection').fromLatLngToDivPixel(this.bounds_.getNorthEast());

 if (!c1 || !c2) return;

 // Now position our DIV based on the DIV coordinates of our bounds

 this.div_.style.width = Math.abs(c2.x - c1.x) + "px";
 this.div_.style.height = Math.abs(c2.y - c1.y) + "px";
 this.div_.style.left = Math.min(c2.x, c1.x) + "px";
 this.div_.style.top = Math.min(c2.y, c1.y) + "px";

 // Do the rest only if the zoom has changed...
 
 if ( this.lastZoom_ == this.map_.getZoom() )
 {
  return ;
 }

 this.lastZoom_ = this.map_.getZoom() ;

 var url = this.url_ ;

 if ( this.addZ_ )
 {
  url += this.addZ_ + this.map_.getZoom() ;
 }

 this.div_.innerHTML = '<img src="' + url + '"  width=' + this.div_.style.width + ' height=' + this.div_.style.height + ' >' ;
}

ProjectedOverlay.prototype.setOpacity=function(opacity)
{
 if (opacity < 0)
 {
  opacity = 0 ;
 }
 if(opacity > 100)
 {
  opacity = 100 ;
 }
 var c = opacity/100 ;

 if (typeof(this.div_.style.filter) =='string')
 {
  this.div_.style.filter = 'alpha(opacity:' + opacity + ')' ;
 }
 if (typeof(this.div_.style.KHTMLOpacity) == 'string' )
 {
  this.div_.style.KHTMLOpacity = c ;
 }
 if (typeof(this.div_.style.MozOpacity) == 'string')
 {
  this.div_.style.MozOpacity = c ;
 }
 if (typeof(this.div_.style.opacity) == 'string')
 {
  this.div_.style.opacity = c ;
 }
}

