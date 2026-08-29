; lo3 syntax highlighting
;
; Mapping to standard tree-sitter highlight groups so nvim-treesitter (and
; other editors that consume these captures) pick sensible colors without
; any extra config.

(comment) @comment

"#" @punctuation.special
(cmd_name) @keyword

; @-lines are lo3's "syntax sugar" / mini-macros (@., @{...}) — surfaced as
; a macro so it stands out (commonly rendered red/bold by themes).
"@" @constant.macro
(macro_body) @constant.macro

(number) @number
(bare_string) @string
(quoted_string) @string
(array_ref) @property
(var_ref) @variable
(double_ref) @type
