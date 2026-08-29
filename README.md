# tree-sitter-lo3

Tree-sitter grammar for [lo3](https://github.com/lo3-lang/lo3-core), derived
directly from `src/parsing.c` (`pars_tokenize`, `pars_resv`) and
`src/internal/{bare-define.h,specific-language.h}` in lo3-core.

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
    url = "~/path/to/tree-sitter-lo3", -- or the github repo once pushed
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
