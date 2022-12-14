<h1 align="center">Spell Checker</h1>

<p align="center">
  <a href="/wow-actions/spell-checker/blob/master/LICENSE"><img alt="MIT License" src="https://img.shields.io/github/license/wow-actions/spell-checker?style=flat-square"></a>
  <a href="https://www.typescriptlang.org" rel="nofollow"><img alt="Language" src="https://img.shields.io/badge/language-TypeScript-blue.svg?style=flat-square"></a>
  <a href="https://github.com/wow-actions/spell-checker/pulls"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" ></a>
  <a href="https://github.com/marketplace/actions/spell-checker" rel="nofollow"><img alt="website" src="https://img.shields.io/static/v1?label=&labelColor=505050&message=Marketplace&color=0076D6&style=flat-square&logo=google-chrome&logoColor=0076D6" ></a>
  <a href="https://github.com/wow-actions/spell-checker/actions/workflows/release.yml"><img alt="build" src="https://img.shields.io/github/workflow/status/wow-actions/spell-checker/Release/master?logo=github&style=flat-square" ></a>
</p>

<p align="center">
  <strong>Check and Annotate files with spelling suggestions to improve your spelling.</strong>
</p>

## 🚀 Usage

Create a `.github/workflows/spell-checker.yml` file in the repository you want to install this action:

```yml
name: Spell Checker
on: push
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: wow-actions/spell-checker@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          include: |
            **/*.md
            **/*.txt
```

## 🔖 License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
