describe('initial iframe load diagnostic', () => {
  beforeEach(() => cy.visit('index.html?bundle=cypress'));

  it('records the initial document, body, and input after load', () => {
    cy.document()
      .then(
        (doc) =>
          new Cypress.Promise((resolve) => {
            const iframe = doc.createElement('iframe');
            let initialDocument;
            let initialBody;
            let input;
            let loadedDocument;
            let loadedBody;
            let loadFiredBeforeInputInsertion;

            const finish = () => {
              if (!input || !loadedDocument) return;
              resolve({
                browser: Cypress.browser,
                loadFiredBeforeInputInsertion,
                documentUnchanged: initialDocument === loadedDocument,
                bodyUnchanged: initialBody === loadedBody,
                inputConnectedAfterLoad: input.isConnected,
                currentDocumentContainsInput:
                  iframe.contentDocument.contains(input),
                initialDocumentContainsInput: initialDocument.contains(input),
                inputOwnerDocumentIsCurrent:
                  input.ownerDocument === iframe.contentDocument,
                initialUrl: initialDocument.URL,
                loadedUrl: loadedDocument.URL,
              });
            };

            iframe.addEventListener(
              'load',
              () => {
                loadFiredBeforeInputInsertion = !input;
                loadedDocument = iframe.contentDocument;
                loadedBody = loadedDocument.body;
                finish();
              },
              { once: true }
            );
            doc.body.appendChild(iframe);
            initialDocument = iframe.contentDocument;
            initialBody = initialDocument.body;
            input = initialDocument.createElement('input');
            input.value = 'hello';
            initialBody.appendChild(input);
            finish();
          })
      )
      .then((result) => {
        cy.writeFile('results/iframe-lifecycle.json', result);
      });
  });
});
