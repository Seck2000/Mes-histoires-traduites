# Comment coller dans Overleaf

Tu gardes ton ZIP du cours (`includes.tex`, `uqar.png`, `kpfonts.sty`, etc.).

## Remplacer / ajouter ces fichiers

1. **`report_v1.0.tex`** ← fichier principal (celui de ce dossier)
2. **`report_v1.0.bib`** ← bibliographie
3. **`titlepage.tex`** ← page de titre (INF39615-7T, UQAR)
4. Dossier **`figures/`** ← tes captures PNG (voir `CAPTURES.md`)

## Page de titre

- Étudiante : **Aissatou Seck**
- Professeur : **Mohamed Tarik Moutacalli**
- Cours : **INF39615-7T**
- Projet : **Mes histoires traduites** (StoryTranslatorWeb)

## Compilation Overleaf

Utilise **pdfLaTeX**, puis compile **2 fois** (table des matières + références).

Si la bibliographie ne s’affiche pas : Menu → Compiler → **Recompile from scratch**, ou enchaîne pdfLaTeX → BibTeX → pdfLaTeX ×2.
