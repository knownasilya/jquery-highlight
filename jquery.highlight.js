/*
 * jQuery Highlight plugin
 *
 * Based on highlight v3 by Johann Burkard
 * http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
 *
 * Code a little bit refactored and cleaned (in my humble opinion).
 * Most important changes:
 *  - has an option to highlight only entire words (wordsOnly - false by default),
 *  - has an option to be case sensitive (caseSensitive - false by default)
 *  - highlight element tag and class names can be specified in options
 *
 * Usage:
 *   // wrap every occurrence of text 'lorem' in content
 *   // with <span class='highlight'> (default options)
 *   $('#content').highlight('lorem');
 *
 *   // search for and highlight more terms at once
 *   // so you can save some time on traversing DOM
 *   $('#content').highlight(['lorem', 'ipsum']);
 *   $('#content').highlight('lorem ipsum');
 *
 *   // search only for entire word 'lorem'
 *   $('#content').highlight('lorem', { wordsOnly: true });
 *
 *   // search only for the entire word 'C#'
 *   // and make sure that the word boundary can also
 *   // be a 'non-word' character, as well as a regex latin1 only boundary:
 *   $('#content').highlight('C#', { wordsOnly: true , wordsBoundary: '[\\b\\W]' });
 *
 *   // don't ignore case during search of term 'lorem'
 *   $('#content').highlight('lorem', { caseSensitive: true });
 *
 *   // wrap every occurrence of term 'ipsum' in content
 *   // with <em class='important'>
 *   $('#content').highlight('ipsum', { element: 'em', className: 'important' });
 *
 *   // remove default highlight
 *   $('#content').unhighlight();
 *
 *   // remove custom highlight
 *   $('#content').unhighlight({ element: 'em', className: 'important' });
 *
 *
 * Copyright (c) 2009 Bartek Szopka
 *
 * Licensed under MIT license.
 *
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function (jQuery) {
    function highlightTextNode(node, match, matchStr, nodeName, className, callback) {
        var highlight = document.createElement(nodeName || 'span');
        highlight.className = className || 'highlight';
        // Note that we use the captured value to find the real index
        // of the match. This is because we do not want to include the matching word boundaries
        var capturePos = node.data.indexOf( matchStr , match.index );

        // Split the node and replace the matching wordnode
        // with the highlighted node
        var wordNode = node.splitText(capturePos);
        wordNode.splitText(matchStr.length);

        var wordClone = wordNode.cloneNode(true);
        highlight.appendChild(wordClone);
        wordNode.parentNode.replaceChild(highlight, wordNode);
        if (typeof callback == 'function') {
            callback(highlight)   
        }
        return highlight
    }
    function highlightHtmlNode(node, nodeName, className, callback) {
        var highlight = document.createElement(nodeName || 'span');
        highlight.className = className || 'highlight';
        var nodeClone = node.cloneNode(true)
        highlight.appendChild(nodeClone);
        node.parentNode.replaceChild(highlight, node);
        if (typeof callback == 'function') {
            callback(highlight)   
        }
        return highlight
    }
    function highlightHtmlNodeList(nodeList, nodeName, className, callback) {
        var node = nodeList[0]
        var highlight = document.createElement(nodeName || 'span');
        highlight.className = className || 'highlight';
        node.parentNode.insertBefore(highlight, node);
        nodeList.forEach(function(node) {
            highlight.appendChild(node)
        }) 
        if (typeof callback == 'function') {
            callback(highlight)   
        }
        return highlight
    }
    jQuery.extend({
        highlight: function (node, str, re, re2, nodeName, className, callback) {
            if (node.nodeType === 3) {
                var match = node.data.match(re);
                if (match) {
                    // The new highlight Element Node
                    highlightTextNode(node, match, match[1], nodeName, className, callback)
                    return 1; //skip added node in parent
                }

                // check if we matched begining of str.
                // Then see if we match the rest of string in sibling nodes
                // looks around one level up and unlimited levels deep
                var matchSub = node.data.match(re2);
                if (matchSub) {
                    var nextStr = str.replace(matchSub[0], '')
                    var sibling = node.nextSibling || node.parentNode.nextSibling
                    var nextMatchSub = true
                    var matchedSiblings = [node]
                    var subMatches = [matchSub]
                    while(nextStr && sibling && nextMatchSub) {
                        var nextRe = getSubRegex(nextStr)
                        nextMatchSub = sibling.textContent.match(nextRe)
                        if (nextMatchSub) {
                            nextStr = nextStr.replace(nextMatchSub[0], '').trim()
                            matchedSiblings.push(sibling)
                            subMatches.push(nextMatchSub)
                            sibling = sibling.nextSibling
                        }
                    }
                    
                    // we matched whole string
                    if (!nextStr) {
                        var subNodes = []
                        for (var i = 0; i < matchedSiblings.length; i++) {
                            var subNode = null
                            if (matchedSiblings[i].nodeType == 3)
                                subNode = highlightTextNode(matchedSiblings[i], subMatches[i], subMatches[i][0], nodeName, 'sub-highlight')
                            else 
                                subNode = highlightHtmlNode(matchedSiblings[i], nodeName, 'sub-highlight')
                            subNodes.push(subNode)
                        }
                        highlightHtmlNodeList(subNodes, nodeName, className, callback)
                        return matchedSiblings.length
                    }
                }
                
            } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
                    !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
                    !(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
                var parentMatch = node.textContent.match(re)
                for (var i = 0; i < node.childNodes.length; i++) {
                    i += jQuery.highlight(node.childNodes[i], str, re, re2, nodeName, className, callback);
                }
            }
            return 0;
        }
    });

    jQuery.fn.unhighlight = function (options) {
        var settings = {
          className: 'highlight',
          element: 'span'
        };

        jQuery.extend(settings, options);

        return this.find(settings.element + '.' + settings.className).each(function () {
            var parent = this.parentNode;
            parent.replaceChild(this.firstChild, this);
            parent.normalize();
        }).end();
    };

    jQuery.fn.highlight = function (words, options, callback) {
        var settings = {
          className: 'highlight',
          element: 'span',
          caseSensitive: false,
          wordsOnly: false,
          wordsBoundary: '\\b'
        };

        jQuery.extend(settings, options);

        if (typeof words === 'string') {
          words = [words];
        }
        var str = words.join(' ')
        words = jQuery.grep(words, function(word, i){
          return word != '';
        });
        words = jQuery.map(words, function(word, i) {
          return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        });

        if (words.length === 0) {
          return this;
        };

        var flag = settings.caseSensitive ? '' : 'i';
        // The capture parenthesis will make sure we can match
        // only the matching word
        var pattern = '(' + words.join('|') + ')';
        if (settings.wordsOnly) {
            pattern =
                (settings.wordsBoundaryStart || settings.wordsBoundary) +
                pattern +
                (settings.wordsBoundaryEnd || settings.wordsBoundary);
        }
        var re = new RegExp(pattern, flag);
        var re2 = getSubRegex(str)

        return this.each(function () {
            jQuery.highlight(this, str, re, re2, settings.element, settings.className, callback);
        });
    };

    function escapeRegex(word) {
        return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    }

    // matches the first portion of the string
    function getSubRegex(str) {
        str = str.trim()
        var words = str.split(/[\s\t\r\n]+/)
        var firstWord = words.shift()
        str = str.substr(firstWord.length)
        var subPattern = '(' + escapeRegex(firstWord) + ')'
        subPattern += words.map(function(word) {
            var i = str.indexOf(word)
            var delimiter = str.substr(0, i)
            str = str.substr(i + word.length)
            return '(\\' + delimiter + ')?(' + escapeRegex(word).replace(/\\[-_]/g, ')?(\$&)?(') + ')?'
        }).join('')
        console.log(subPattern)
        var re2 = new RegExp(subPattern, 'i')
        return re2
    }

}));
