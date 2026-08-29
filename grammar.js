// tree-sitter grammar for lo3
//
// Derived directly from lo3-core's src/parsing.c (pars_tokenize, pars_resv)
// and src/internal/{bare-define.h, specific-language.h}.
//
// A line is either:
//   # <cmd:1 char> <arg>? <arg>?      -- a command
//   @ <anything>                      -- a macro / syntax-sugar line (@., @{)
//   // ...                            -- a comment (ignored by the lo3 parser)
//
// An <arg> always carries an explicit type prefix (bare-define.h: lo3_types):
//   $<int>       TYPE_num     -- integer literal
//   _<chars>     TYPE_string  -- string literal (bare, ends at whitespace)
//   "<chars>"    TYPE_string  -- string literal (quoted, spaces allowed,
//                                 \-escapes honored, per pars_tokenize)
//   *<int>       TYPE_array   -- index into the g[] stack
//   %<name>      TYPE_var     -- variable reference
//   /<...>       TYPE_double  -- reserved for doubles (not implemented yet)
//
// No bare/unprefixed tokens are valid arguments.

module.exports = grammar({
  name: "lo3",

  extras: ($) => [/[ \t]/],

  conflicts: ($) => [[$.command]],

  rules: {
    source_file: ($) => repeat(choice($.command, $.macro, $.comment, "\n")),

    comment: (_$) => token(seq("//", /.*/)),

    // 0xRobert: @. changes LO3_STARTING_LINE, @{ is g_fasterInit — both are
    // "syntax sugar" the parser special-cases before the normal cmd dispatch.
    // Editors don't need to distinguish those sub-forms to highlight
    // correctly, so the whole line body after `@` is kept as opaque content.
    macro: ($) => seq("@", field("body", $.macro_body), "\n"),

    macro_body: (_$) => /[^\n]*/,

    command: ($) =>
      seq(
        "#",
        field("cmd", $.cmd_name),
        optional(field("arg1", $.arg)),
        optional(field("arg2", $.arg)),
        "\n",
      ),

    // single-char command codes from lo3_cmds (specific-language.h)
    cmd_name: (_$) =>
      token(
        choice(
          "=", // BSC_asn
          "s", // BSC_sys
          "+", // ALU_add
          "-", // ALU_sub
          "/", // ALU_div
          "*", // ALU_mul
          "d", // CNT_jmp
          "c", // CNT_call
          "C", // CNT_callS
          "l", // CNT_label
          "n", // CNT_new
          "?", // CNT_cmp
          "<", // CNT_small
          ">", // CNT_big
          "k", // CNT_kiLab
          "p", // CNT_push
          "t", // CNT_pop
          "x", // CNT_init
          "o", // STM_out
          "i", // STM_in
          "f", // CNT_free
          "0", // RET_good
          "1", // RET_bad
          "r", // RET_smart
        ),
      ),

    arg: ($) =>
      choice(
        $.number,
        $.bare_string,
        $.quoted_string,
        $.array_ref,
        $.var_ref,
        $.double_ref,
      ),

    number: (_$) => token(seq("$", /[0-9]+/)),

    bare_string: (_$) => token(seq("_", /[^\s]+/)),

    // pars_tokenize: opens on `"`, honors \-escapes, closes on unescaped `"`,
    // spaces are allowed inside.
    quoted_string: (_$) =>
      token(seq('"', repeat(choice(/[^"\\]/, seq("\\", /./))), '"')),

    array_ref: (_$) => token(seq("*", /[0-9]+/)),

    var_ref: (_$) => token(seq("%", /[^\s]+/)),

    double_ref: (_$) => token(seq("/", /[^\s]+/)),
  },
});
