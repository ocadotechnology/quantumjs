(define-generic-mode
  'quantum-mode ;; mode name
  '("#") ;; no comments
  nil ;; no keywords
  '(("\\(@[[:alpha:]]+\\)" 1 'font-lock-keyword-face) ;; Highlighting any word starting with @
    ("\\(@[[:alpha:]]+\\)\\(([^)]*)\\)?\\(\\[[^[]+\\]\\)" 3 'font-lock-constant-face) ;; Square brackets are @headings
    ("\\(@[[:alpha:]]+\\)\\(([^)]*?)\\)" 2 'font-lock-type-face) ;; Parens after @headings
    ("\\(@[[:alpha:]]+\\)\\([^:]*?\\)\\(:\\|$\\)" 2 'font-lock-type-face) ;; Highlighting params to @heading params params
    );; operators & builtins
  '("\\.\\(quant\\)?um\\'") ;; regexp for file associations
  nil ;; FUNCTION-LIST
  "Simple Mode to provide syntax highlighting for quantum-mode documentation")