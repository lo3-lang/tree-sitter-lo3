# tree-sitter-lo3

Tree-sitter grammar for [lo3](https://github.com/lo3-lang/lo3-core), derived
directly from `src/parsing.c` (`pars_tokenize`, `pars_resv`) and
`src/internal/{bare-define.h,specific-language.h}` in lo3-core.

## Goal

This grammar is step one of making lo3 usable as a proper language in an
editor, not just runnable from the command line. The plan is for this repo
to stay in lockstep with lo3-core and grow into full tooling support:

- [x] Syntax highlighting (`queries/highlights.scm`)
- [ ] Code folding (`queries/folds.scm`)
- [ ] Locals/scope queries, for accurate variable highlighting
- [ ] Reuse by [lo3-lsp](https://github.com/lo3-lang) for diagnostics,
      hover, and completion (parse errors surfaced live instead of only at
      `#l`/`#d` runtime)

As lo3-core's syntax grows (new `lo3_cmds`, new `lo3_types`), this grammar
should be updated alongside it — ideally in the same PR that touches
`specific-language.h` / `bare-define.h`, so the two never drift apart.

## Grammar summary

```
# <cmd> <arg1>? <arg2>?     command line (cmd = single char, see lo3_cmds)
@ <...>                     macro / syntax-sugar line (@., @{)
// ...                      comment
```

Args always carry an explicit type prefix — no bare/unprefixed tokens:

| prefix    | meaning                       |
| --------- | ------------------------------ |
| `$123`    | integer literal                |
| `_foo`    | string literal (bare)          |
| `"a b"`   | string literal (quoted, spaces + `\`-escapes ok) |
| `*3`      | index into the `g[]` stack     |
| `%name`   | variable reference             |
| `/...`    | double (reserved, unimplemented) |

## Build

```sh
npm install
npx tree-sitter generate
npx tree-sitter parse path/to/file.lo3
```

## Neovim (nvim-treesitter)

Register a local/custom parser in your config:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.lo3 = {
  install_info = {
    url = "https://github.com/lo3-lang/tree-sitter-lo3",
    files = { "src/parser.c" },
    branch = "main",
  },
  filetype = "lo3",
}

vim.filetype.add({ extension = { lo3 = "lo3" } })
```

Then:

```vim
:TSInstall lo3
```

`queries/highlights.scm` ships with the grammar and will be picked up
automatically.
