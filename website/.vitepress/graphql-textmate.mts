import { LanguageRegistration } from '@shikijs/core';

export const graphqlLanguage: LanguageRegistration = {
  name: 'inline.graphql',
  scopeName: 'inline.graphql',
  embeddedLangs: [
    'graphql',
    'javascript',
    'typescript',
    'jsx',
    'tsx',
  ],
  injectTo: [
    'source.js',
    'source.jsx',
    'source.ts',
    'source.tsx',
    'source.vue',
    'source.svelte'
  ],
  injectionSelector: 'L:(meta.embedded.block.javascript | meta.embedded.block.typescript | source.js | source.ts | source.tsx | source.vue | source.svelte | source.astro) -source.graphql -inline.graphql -string -comment',
  patterns: [
    {
      include: "#meta.embedded.block.graphql"
    }
  ],
  repository: {
    $self: {},
    $base: {},

    "meta.embedded.block.graphql": {
      patterns: [
        {
          "begin": "\\s*+(?:(Relay)\\??\\.)(QL)|(gql|graphql|graphql\\.experimental)\\s*(?:<.*>)?\\s*\\(",
          "end": "\\)",
          "beginCaptures": {
            "1": {
              "name": "variable.other.class.js"
            },
            "2": {
              "name": "entity.name.function.tagged-template.js"
            },
            "3": {
              "name": "entity.name.function.tagged-template.js"
            }
          },
          "patterns": [
            {
              "contentName": "meta.embedded.block.graphql",
              "begin": "(`|')",
              "end": "(`|')",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.string.template.begin.js"
                }
              },
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.string.template.end.js"
                }
              },
              "patterns": [
                {
                  "include": "source.graphql"
                }
              ]
            },
            {
              "patterns": [
                { "include": "source.js" },
                { "include": "source.ts" },
                { "include": "source.js.jsx" },
                { "include": "source.tsx" }
              ]
            }
          ]
        },
        {
          "contentName": "meta.embedded.block.graphql",
          "begin": "\\s*+(?:(?:(?:(Relay)\\??\\.)(QL)|(gql|graphql|graphql\\.experimental)\\s*(?:<.*>)?\\s*)|(/\\* GraphQL \\*/))\\s*(`|')",
          "beginCaptures": {
            "1": {
              "name": "variable.other.class.js"
            },
            "2": {
              "name": "entity.name.function.tagged-template.js"
            },
            "3": {
              "name": "entity.name.function.tagged-template.js"
            },
            "4": {
              "name": "comment.graphql.js"
            },
            "5": {
              "name": "punctuation.definition.string.template.begin.js"
            }
          },
          "end": "(`|')",
          "endCaptures": {
            "0": {
              "name": "punctuation.definition.string.template.end.js"
            }
          },
          "patterns": [
            {
              "include": "source.graphql"
            }
          ]
        },
        {
          "name": "taggedTemplates",
          "contentName": "meta.embedded.block.graphql",
          "begin": "(`|')(#graphql)",
          "beginCaptures": {
            "1": {
              "name": "punctuation.definition.string.template.begin.js"
            },
            "2": {
              "name": "comment.line.graphql.js"
            }
          },
          "end": "(`|')",
          "endCaptures": {
            "0": {
              "name": "punctuation.definition.string.template.end.js"
            }
          },
          "patterns": [
            {
              "include": "source.graphql"
            }
          ]
        },
      ],
    },
  },
};
