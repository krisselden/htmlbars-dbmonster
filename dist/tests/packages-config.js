var packagesConfig = {
  "version": "0.14.0",
  "revision": "66ef3be1a616690949331a25fe9e3db93900e8a7",
  "vendored": {},
  "dependencies": {
    "htmlbars": {
      "node": true,
      "lib": [
        "syntax-handlebars-inliner",
        "htmlbars-util",
        "htmlbars-syntax",
        "htmlbars-compiler",
        "htmlbars-runtime",
        "simple-html-tokenizer",
        "morph-range",
        "morph-attr",
        "dom-helper"
      ]
    },
    "htmlbars-syntax": {
      "node": true,
      "lib": [
        "syntax-handlebars-inliner",
        "htmlbars-util",
        "simple-html-tokenizer"
      ]
    },
    "htmlbars-compiler": {
      "node": true,
      "lib": [
        "syntax-handlebars-inliner",
        "util-handlebars-inliner",
        "htmlbars-util",
        "htmlbars-syntax",
        "simple-html-tokenizer"
      ],
      "test": [
        "htmlbars-test-helpers",
        "htmlbars-runtime",
        "morph-range",
        "morph-attr",
        "dom-helper"
      ]
    },
    "htmlbars-runtime": {
      "lib": [
        "htmlbars-util",
        "morph-range",
        "morph-attr",
        "dom-helper"
      ]
    },
    "htmlbars-util": {
      "lib": [
        "util-handlebars-inliner"
      ]
    },
    "htmlbars-test-helpers": {},
    "morph-attr": {
      "node": true,
      "lib": [
        "dom-helper"
      ],
      "test": [
        "util-handlebars-inliner",
        "htmlbars-test-helpers",
        "htmlbars-util"
      ]
    },
    "dom-helper": {
      "node": true,
      "lib": [
        "morph-range",
        "morph-attr"
      ],
      "test": [
        "util-handlebars-inliner",
        "htmlbars-test-helpers",
        "htmlbars-util"
      ]
    }
  }
};