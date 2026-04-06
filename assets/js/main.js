// On mobile, collect .body-note sidenotes/marginnotes into a numbered footnote
// section at the bottom of the article, with anchor links back to the reference.
// Restores sidebar behavior when resizing back to desktop.
(function () {
    var mq = window.matchMedia('(max-width: 760px)');
    var state = { entries: [], container: null };

    function buildFootnotes() {
        var notes = Array.from(document.querySelectorAll('.body-note'));
        if (!notes.length) return;

        var article = document.querySelector('article') || document.body;
        var container = document.createElement('section');
        container.className = 'mobile-footnotes';
        container.appendChild(document.createElement('hr'));
        var list = document.createElement('ol');
        container.appendChild(list);

        notes.forEach(function (note, i) {
            var n = i + 1;
            var noteId = 'fn-' + n;
            var refId = 'fn-ref-' + n;

            // The DOM order is: label, input, span.body-note
            var input = note.previousElementSibling;
            var label = input && input.previousElementSibling;

            // Insert numbered superscript anchor before the label
            var ref = document.createElement('sup');
            ref.className = 'fn-ref';
            ref.innerHTML = '<a href="#' + noteId + '" id="' + refId + '">' + n + '</a>';
            var anchor = label || input || note;
            anchor.parentNode.insertBefore(ref, anchor);

            // Hide original label and input (JS-managed, so inline style overrides CSS)
            if (label) label.style.display = 'none';
            if (input) input.style.display = 'none';

            // Build footnote list item with back-link.
            // Images are moved after text so the list marker has a text line to anchor to.
            var li = document.createElement('li');
            li.id = noteId;
            var tmp = document.createElement('div');
            tmp.innerHTML = note.innerHTML;
            var imgs = Array.from(tmp.querySelectorAll('img'));
            imgs.forEach(function (img) { img.parentNode.removeChild(img); });
            li.innerHTML = tmp.innerHTML.trim() +
                ' <a href="#' + refId + '" class="fn-back" aria-label="Back to reference">\u21a9</a>';
            imgs.forEach(function (img) { li.appendChild(img); });
            list.appendChild(li);

            state.entries.push({ note: note, ref: ref, label: label, input: input });
        });

        article.appendChild(container);
        state.container = container;
    }

    function teardownFootnotes() {
        state.entries.forEach(function (e) {
            if (e.ref.parentNode) e.ref.parentNode.removeChild(e.ref);
            if (e.label) e.label.style.display = '';
            if (e.input) e.input.style.display = '';
        });
        if (state.container && state.container.parentNode) {
            state.container.parentNode.removeChild(state.container);
        }
        state = { entries: [], container: null };
    }

    function update() {
        teardownFootnotes();
        if (mq.matches) buildFootnotes();
    }

    document.addEventListener('DOMContentLoaded', update);
    mq.addEventListener('change', update);
})();
