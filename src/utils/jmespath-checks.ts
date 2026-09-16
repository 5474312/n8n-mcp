/**
 * Static checks for JMESPath queries, shared by the expression validator (`$jmespath()` inside
 * `{{ }}`) and the Code-node validator.
 *
 * n8n swallows JMESPath parse errors inside expressions: the isolated-vm bridge re-throws only
 * ExpressionError and ExpressionExtensionError, so a bad query resolves to null while the node
 * reports success (#1114). In a Filter or IF condition every item then fails the check. The
 * checks below catch the mistakes that produce that silent null.
 *
 * Every scan here is a single left-to-right pass: validate_workflow runs over caller-supplied
 * workflows, so nothing may recurse or rescan.
 */

export interface JmespathQueryFinding {
  severity: 'error' | 'warning';
  message: string;
  fix: string;
}

export interface JmespathCall {
  /** Source offset of `$jmespath(` */
  index: number;
  /** The query when it is a plain string literal (quotes removed); undefined when it is dynamic */
  query?: string;
  /** True when the string literal is the first argument, i.e. the arguments are reversed */
  queryIsFirstArgument: boolean;
}

/** Longest query the checks scan; anything longer is skipped rather than risking a slow regex. */
const MAX_QUERY_LENGTH = 2000;

/** Calls read per source; nested calls rescan their argument text, so this keeps the scan bounded. */
const MAX_CALLS = 100;

/**
 * Deepest `${ }` nesting the blanker tracks. Past it a `${` is left as literal text, so the
 * backtick that would have closed the nested template closes the outer one instead; the
 * output stays length-preserving and the scan terminates either way.
 */
const MAX_TEMPLATE_DEPTH = 64;

/**
 * Characters after which a `/` starts a regex literal rather than a division. `)`, `]` and
 * `}` are read as division: in an expression an object literal or a call result before `/`
 * is far more common than a regex after a block.
 */
const REGEX_PRECEDERS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', ';', '+', '-', '*', '%', '<', '>', '~', '^']);

/** Keywords after which a `/` starts a regex literal. */
const REGEX_KEYWORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await']);

/**
 * Replace the contents of '...', "..." and `...` literals with spaces, keeping the quotes and
 * the source length so offsets into the result match the source. `${ }` interpolations inside
 * a template literal are code and stay. Regex literals are blanked too (a `/` after an
 * operator or opening bracket starts one), so a quote inside `/"/` does not open a string.
 *
 * Known gaps, all on the side of reading less: an escaped quote inside an argument makes the
 * argument dynamic for findJmespathCalls, and a `/` misread as division leaves the regex body
 * as code.
 */
export function blankStringLiterals(source: string, options: { comments?: boolean } = {}): string {
  const out = source.split('');
  // Each entry is the brace depth of one open template literal's current `${ }`; -1 means the
  // template is in its literal part.
  const templates: number[] = [];
  let quote: string | null = null;
  let lastCode = ''; // last non-space code character, for the regex-vs-division decision
  let lastWord = ''; // the identifier or keyword that ends at lastCode, if any
  let i = 0;

  while (i < source.length) {
    const ch = source[i];

    if (quote !== null) {
      // Inside a ' or " literal.
      if (ch === '\\' && i + 1 < source.length) {
        out[i] = out[i + 1] = ' ';
        i += 2;
        continue;
      }
      if (ch === quote) {
        quote = null;
        lastCode = ch; // a closed literal is a value, so a following `/` divides
        lastWord = '';
      } else if (ch === '\n') {
        quote = null; // an unterminated literal ends at the line
        i++;
        continue;
      } else {
        out[i] = ' ';
      }
      i++;
      continue;
    }

    const template = templates.length > 0 ? templates[templates.length - 1] : undefined;
    const inTemplateText = template === -1;

    if (inTemplateText) {
      if (ch === '\\' && i + 1 < source.length) {
        out[i] = out[i + 1] = ' ';
        i += 2;
        continue;
      }
      if (ch === '`') {
        templates.pop();
        lastCode = ch;
        lastWord = '';
      } else if (ch === '$' && source[i + 1] === '{' && templates.length < MAX_TEMPLATE_DEPTH) {
        templates[templates.length - 1] = 0;
        i += 2;
        continue;
      } else {
        out[i] = ' ';
      }
      i++;
      continue;
    }

    // Code, possibly inside a `${ }`.
    if (options.comments && ch === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') out[i++] = ' ';
      continue;
    }
    if (options.comments && ch === '/' && source[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2);
      const end = close === -1 ? source.length : close + 2;
      while (i < end) out[i++] = ' ';
      continue;
    }
    if (ch === '/' && (lastCode === '' || REGEX_PRECEDERS.has(lastCode) || REGEX_KEYWORDS.has(lastWord))) {
      i = blankRegexLiteral(source, out, i);
      lastCode = '/';
      lastWord = '';
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
    } else if (ch === '`') {
      templates.push(-1);
    } else if (template !== undefined) {
      if (ch === '{') templates[templates.length - 1] = template + 1;
      else if (ch === '}') {
        if (template === 0) templates[templates.length - 1] = -1;
        else templates[templates.length - 1] = template - 1;
      }
    }
    if (/\w/.test(ch)) {
      lastWord = /\w/.test(lastCode) ? lastWord + ch : ch;
    } else if (!/\s/.test(ch)) {
      lastWord = '';
    }
    if (!/\s/.test(ch)) lastCode = ch;
    i++;
  }
  return out.join('');
}

/** Blank a regex literal starting at `start`; returns the offset after its closing `/`. */
function blankRegexLiteral(source: string, out: string[], start: number): number {
  let i = start + 1;
  let inClass = false;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '\n') return i; // not a regex after all; leave the rest alone
    if (ch === '\\' && i + 1 < source.length) {
      out[i] = out[i + 1] = ' ';
      i += 2;
      continue;
    }
    if (ch === '[') inClass = true;
    else if (ch === ']') inClass = false;
    else if (ch === '/' && !inClass) return i + 1;
    out[i] = ' ';
    i++;
  }
  return i;
}

/**
 * Locate every `$jmespath(` call outside string literals and comments and read its arguments. A plain
 * string-literal argument is returned as the query; the position tells whether the arguments
 * are reversed. A template literal with `${ }` is dynamic and returns no query.
 */
export function findJmespathCalls(source: string): JmespathCall[] {
  const calls: JmespathCall[] = [];
  const blanked = blankStringLiterals(source, { comments: true });
  const marker = '$jmespath';
  let from = 0;

  while (calls.length < MAX_CALLS) {
    const index = blanked.indexOf(marker, from);
    if (index === -1) break;
    // JavaScript allows whitespace between the callee and its `(`.
    let paren = index + marker.length;
    while (paren < blanked.length && /\s/.test(blanked[paren])) paren++;
    if (blanked[paren] !== '(') {
      from = index + marker.length;
      continue;
    }
    const argsStart = paren + 1;
    const args = splitTopLevelArguments(blanked, argsStart);
    // Nothing after an unclosed `(` can close a later call either.
    if (!args) break;
    // Resume inside the call so nested calls are read too; MAX_CALLS bounds the rescans.
    from = argsStart;

    const first = literalArgument(source, args.spans[0]);
    const second = literalArgument(source, args.spans[1]);
    if (first !== undefined) {
      calls.push({ index, query: first, queryIsFirstArgument: true });
    } else {
      calls.push({ index, query: second, queryIsFirstArgument: false });
    }
  }
  return calls;
}

/**
 * The literal's text when the span holds exactly one plain string literal, with JavaScript
 * escapes decoded (`\u0027` is a quote to the query, not to the validator).
 */
function literalArgument(source: string, span: [number, number] | undefined): string | undefined {
  if (!span) return undefined;
  const raw = source.slice(span[0], span[1]).trim();
  const quote = raw[0];
  if (!(quote === "'" || quote === '"' || quote === '`') || raw.length < 2) return undefined;

  let body = '';
  let i = 1;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === '\\') {
      const decoded = decodeEscape(raw, i);
      if (!decoded) return undefined;
      body += decoded.text;
      i = decoded.next;
      continue;
    }
    if (ch === quote) break;
    if (quote === '`' && ch === '$' && raw[i + 1] === '{') return undefined; // interpolated: dynamic
    body += ch;
    i++;
  }
  // The closing quote must end the argument; anything after it is an operator or a second literal.
  if (i !== raw.length - 1 || raw[i] !== quote) return undefined;
  return body;
}

const SIMPLE_ESCAPES: Record<string, string> = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', '0': '\0' };

/** Decode one JavaScript escape sequence starting at the backslash. */
function decodeEscape(raw: string, at: number): { text: string; next: number } | undefined {
  const ch = raw[at + 1];
  if (ch === undefined) return undefined;
  if (ch === 'u' && raw[at + 2] === '{') {
    const close = raw.indexOf('}', at + 3);
    if (close === -1) return undefined;
    const hex = raw.slice(at + 3, close);
    if (!/^[0-9a-fA-F]{1,6}$/.test(hex)) return undefined;
    const code = parseInt(hex, 16);
    if (code > 0x10ffff) return undefined;
    return { text: String.fromCodePoint(code), next: close + 1 };
  }
  if (ch === 'u' || ch === 'x') {
    const width = ch === 'u' ? 4 : 2;
    const hex = raw.slice(at + 2, at + 2 + width);
    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length !== width) return undefined;
    return { text: String.fromCharCode(parseInt(hex, 16)), next: at + 2 + width };
  }
  if (ch === '\n') return { text: '', next: at + 2 }; // line continuation
  return { text: SIMPLE_ESCAPES[ch] ?? ch, next: at + 2 };
}

/**
 * Split the arguments of a call on the blanked source, starting after its `(`. Returns the
 * argument spans and the offset just past the closing `)`, or null when the call is unclosed.
 */
function splitTopLevelArguments(blanked: string, start: number): { spans: [number, number][]; end: number } | null {
  const spans: [number, number][] = [];
  let depth = 0;
  let argStart = start;

  for (let i = start; i < blanked.length; i++) {
    const ch = blanked[i];
    if (ch === '(' || ch === '[' || ch === '{') {
      depth++;
    } else if (ch === ')' || ch === ']' || ch === '}') {
      if (depth === 0) {
        spans.push([argStart, i]);
        return { spans, end: i + 1 };
      }
      depth--;
    } else if (ch === ',' && depth === 0) {
      spans.push([argStart, i]);
      argStart = i + 1;
    }
  }
  return null;
}

/**
 * Check one JMESPath query string for the mistakes that make n8n return null silently, plus
 * the identifier-instead-of-string mistakes that match nothing.
 */
export function checkJmespathQuery(query: string): JmespathQueryFinding[] {
  const findings: JmespathQueryFinding[] = [];
  if (query.length > MAX_QUERY_LENGTH) return findings;
  const seen = new Set<string>();
  const add = (finding: JmespathQueryFinding) => {
    if (!seen.has(finding.message)) {
      seen.add(finding.message);
      findings.push(finding);
    }
  };
  // Raw strings ('a=b'), backtick JSON literals and quoted identifiers may contain anything;
  // scan around them. JMESPath quoting has no `${ }` and spans newlines, so this is not the
  // JavaScript blanker.
  const code = blankJmespathLiterals(query);
  let match: RegExpExecArray | null;

  // Numbers are backtick literals in JMESPath (`18`); a bare number is a parse error.
  const bareNumber = /(==|!=|<=|>=|<|>)\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(?![\w.`'"])/g;
  while ((match = bareNumber.exec(code)) !== null) {
    add({
      severity: 'error',
      message: `JMESPath literal ${match[2]} must be wrapped in backticks`,
      fix: `Write ${match[1]} \`${match[2]}\``
    });
  }

  // A bare true/false/null parses as an identifier (a field named "true"), so the comparison
  // is against a missing field rather than the boolean.
  const bareKeyword = /(==|!=|<=|>=|<|>)\s*(true|false|null)(?![\w.`'"])/g;
  while ((match = bareKeyword.exec(code)) !== null) {
    add({
      severity: 'warning',
      message: `JMESPath reads ${match[2]} as a field name, not the literal; wrap it in backticks`,
      fix: `Write ${match[1]} \`${match[2]}\``
    });
  }

  // JMESPath has no `and`/`or` keywords and no single `=`. A bare `and` after a pipe or an
  // opening bracket is an identifier (a field named "and"); only one between two operands is
  // an attempted operator.
  const wordOperator = /(?<=[\w`'")\]@]\s+)(and|or)(?=\s+[\w`'"(!@])/g;
  while ((match = wordOperator.exec(code)) !== null) {
    add({
      severity: 'error',
      message: `JMESPath has no "${match[1]}" operator`,
      fix: `Use ${match[1] === 'and' ? '&&' : '||'}`
    });
  }

  if (/(^|[^=!<>])=(?!=)/.test(code)) {
    add({
      severity: 'error',
      message: 'JMESPath comparisons use ==, not a single =',
      fix: 'Use == for equality'
    });
  }

  // "PL" on the right of a comparison is an identifier lookup, not the string PL. The literal
  // was blanked, so its text is read back from the query at the same offsets.
  const quotedRhs = /(==|!=|<=|>=|<|>)\s*"( *)"/g;
  while ((match = quotedRhs.exec(code)) !== null) {
    const bodyStart = match.index + match[0].length - 1 - match[2].length;
    const text = query.slice(bodyStart, bodyStart + match[2].length);
    add({
      severity: 'warning',
      message: `JMESPath treats "${text}" as an identifier, not a string; the comparison matches nothing`,
      fix: `Use single quotes for a raw string: ${match[1]} '${text.replace(/'/g, "\\'")}'`
    });
  }

  return findings;
}

/** Blank the contents of JMESPath quoted tokens: '...' raw strings, `...` literals, "..." identifiers. */
function blankJmespathLiterals(query: string): string {
  const out = query.split('');
  let quote: string | null = null;
  for (let i = 0; i < query.length; i++) {
    const ch = query[i];
    if (quote === null) {
      if (ch === "'" || ch === '"' || ch === '`') quote = ch;
      continue;
    }
    if (ch === '\\' && i + 1 < query.length) {
      out[i] = out[i + 1] = ' ';
      i++;
      continue;
    }
    if (ch === quote) {
      quote = null;
      continue;
    }
    out[i] = ' ';
  }
  return out.join('');
}
