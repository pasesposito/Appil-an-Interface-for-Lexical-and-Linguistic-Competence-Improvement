// Function to create cloze text with input fields for articles
function createClozeText(text) {
    const articles = ['a', 'an', 'the'];
    let removedWords = []; // Reset the removed words array
    let id = 0;
    let newText = text.replace(new RegExp(`\\b(${articles.join('|')})\\b`, 'gi'), (match) => {
        removedWords.push({ id: id, word: match });
        return `<input type="text" class="cloze-input" style="display: inline; width: 60px !important;" data-id="${id++}" placeholder="Article">`;
    });
    return newText;
}