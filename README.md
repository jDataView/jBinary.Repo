jBinary.Repo
==================

**This repo is deprecated and will be replaced with bunch of separate repos for each file type.**

Repo for popular file formats and corresponding demos implemented with [jBinary](https://github.com/jDataView/jBinary).

Watch demos online from [catalog](https://jDataView.github.io/jBinary.Repo/).

For usage in own projects, check out [corresponding page in jBinary documentation](https://github.com/jDataView/jBinary/wiki/The-Repo).

Feel free to add own file formats:
  1. Fork this repo.
  2. Create folder for your `{format}`.
  4. Add `{format}.js` into folder and export typeset by using AMD `define` method.
  5. Add `demo.html` with demo partial into folder.
  6. Register file extension & mime type associations inside [associations.js](https://github.com/jDataView/jBinary.Repo/blob/gh-pages/assoiations.js) (if needed).
  7. Send me pull request.
  8. Watch your demo in [official catalog](https://jDataView.github.io/jBinary.Repo/)!
