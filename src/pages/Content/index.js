import { WORD_COLORS } from './constant';
import nlp from 'compromise';
function isEnglishPage() {
  var language = navigator.languages || navigator.userLanguage;
  return language.indexOf('en') !== -1;
}

function extractMainElement() {
  var mainContentElement = document.body;
  if (!mainContentElement) return '';

  return mainContentElement;
}

function processTextNodes(node, callback) {
  if (
    node.tagName === 'STYLE' ||
    node.tagName === 'SCRIPT' ||
    node.tagName === 'PRE'
  ) {
    return;
  } else if (node.nodeType === Node.TEXT_NODE) {
    callback(node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (let i = 0; i < node.childNodes.length; i++) {
      processTextNodes(node.childNodes[i], callback);
    }
  }
}

function processTextNode(node) {
  const text = node.textContent.trim();
  if (text.length) {
    const doc = nlp(text);
    doc.json()[0].terms.forEach((term) => {
      let tags = term.tags;
      if (!/^[a-zA-Z]+$/.test(term.text)) {
        return;
      }
      const replacedText = text.replaceAll(
        new RegExp(`\\b${term.text}\\b`, 'ig'),
        `<span class="${tags.map((tag) => `ext__${tag}`).join(' ')}"> ${
          term.text
        } </span>`
      );
      const tempNode = document.createElement('span');
      tempNode.innerHTML = replacedText;
      if (node.parentNode) {
        while (tempNode.firstChild) {
          node.parentNode.insertBefore(tempNode.firstChild, node);
        }
        node.parentNode?.removeChild(node);
      }
    });
  }
}

window.onload = function () {
  if (isEnglishPage()) {
    var element = extractMainElement();
    processTextNodes(element, processTextNode);
  }
};
